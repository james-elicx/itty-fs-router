import mockFs from 'mock-fs';
import {
	createProject,
	getSrcFile,
	getValidExportedDeclarations,
	groupExportedDeclarations,
	readPathsRecursively,
} from 'src/cli/utils';
import type { Project } from 'ts-morph';
import { suite, test, expect, beforeAll, afterAll } from 'vitest';
import type { ProcessedRoute } from '../../src/cli/routes';
import {
	groupRoutePaths,
	addRouteOptions,
	createFileHandler,
	transformSyntax,
} from '../../src/cli/routes';
import { mockConsoleLog } from '../_helpers';

suite('routes', () => {
	let project: Project;

	beforeAll(() => {
		mockFs({
			src: {
				'get.ts': `export const GET = "foo";`,
				'multiple-valid.ts': `export const GET = "foo"; export const POST = "bar";`,
				'mixed-valid.ts': `export const GET = "foo"; export const middleware = { GET: "" };`,
				'invalid.ts': `import { GET } from "./get"; export const invalid = { GET };`,
			},
			'custom-src': {
				'get.ts': `export const GET = "foo";`,
				'multiple-valid.ts': `export const GET = "foo"; export const POST = "bar";`,
				'mixed-valid.ts': `export const GET = "foo"; export const middleware = { GET: "" };`,
				'invalid.ts': `import { GET } from "./get"; export const invalid = { GET };`,
			},
			'all-types': {
				'_config.ts': `export const config = { basePath: "" };`,
				'_middleware.ts': `export const GET = "middleware";`,
				'_not-found.ts': `export const GET = "not found";`,
				'index.ts': `export const GET = "index";`,
			},
		});

		project = createProject(readPathsRecursively('.'));
	});

	afterAll(() => {
		mockFs.restore();
	});

	suite('addRouteOptions', () => {
		test('should append valid middleware option routes', () => {
			const { options } = groupExportedDeclarations(
				getValidExportedDeclarations(getSrcFile(project, 'mixed-valid.ts')),
			);

			const arr: ProcessedRoute[] = [];
			addRouteOptions(arr, options.get('middleware'), 'middleware', {
				path: 'mixed-valid.ts',
				route: 'foo',
			});

			const expected = [['GET', /^foo\/*$/, ['require("mixed-valid.ts").middleware.GET']]];
			expect(arr).toEqual(expected);
		});
	});

	suite('groupRoutePaths', () => {
		test('should group different files into the correct categories', () => {
			const routes = readPathsRecursively('./all-types');
			const grouped = groupRoutePaths(routes);

			const expected = {
				config: [expect.stringMatching(/\/all-types\/_config\.ts$/)],
				middleware: [expect.stringMatching(/\/all-types\/_middleware\.ts$/)],
				notFound: [expect.stringMatching(/\/all-types\/_not-found\.ts$/)],
				routes: [expect.stringMatching(/\/all-types\/index\.ts$/)],
			};

			expect(grouped).toEqual(expected);
		});
	});

	suite('createFileHandler', () => {
		test('processes multiple routes correctly', () => {
			const consoleMock = mockConsoleLog();
			const routes = [
				'src/get.ts',
				'src/multiple-valid.ts',
				'src/mixed-valid.ts',
				'src/invalid.ts',
			];

			const rootDir = 'src';
			const basePath = '';
			const { files, ...fileHandler } = createFileHandler(routes, { rootDir, basePath });

			fileHandler.processGroup(files);

			const expected = [
				['GET', /^\/get\/*$/, ['require("src/get.ts").GET']],
				['GET', /^\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").GET']],
				['POST', /^\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").POST']],
				['GET', /^\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(fileHandler.getProcessedRoutes()).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(1);
			expect(consoleMock).toHaveBeenCalledWith(`Processing ${routes.length} routes...`);
			consoleMock.mockRestore();
		});

		test('processes multiple routes correctly with custom root dir', () => {
			const consoleMock = mockConsoleLog();
			const routes = [
				'custom-src/get.ts',
				'custom-src/multiple-valid.ts',
				'custom-src/mixed-valid.ts',
				'custom-src/invalid.ts',
			];

			const rootDir = 'custom-src';
			const basePath = '';
			const { files, ...fileHandler } = createFileHandler(routes, { rootDir, basePath });

			fileHandler.processGroup(files);

			// fileHandler.process(files.middleware, { methodsOnly: true });
			// fileHandler.process(files.routes, { shouldLog: true });
			// fileHandler.process(files.notFound, { methodsOnly: true });

			const expected = [
				['GET', /^\/get\/*$/, ['require("custom-src/get.ts").GET']],
				['GET', /^\/multiple-valid\/*$/, ['require("custom-src/multiple-valid.ts").GET']],
				['POST', /^\/multiple-valid\/*$/, ['require("custom-src/multiple-valid.ts").POST']],
				['GET', /^\/mixed-valid\/*$/, ['require("custom-src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/mixed-valid\/*$/, ['require("custom-src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(fileHandler.getProcessedRoutes()).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(1);
			expect(consoleMock).toHaveBeenCalledWith(`Processing ${routes.length} routes...`);
			consoleMock.mockRestore();
		});

		test('processes multiple routes correctly with base path', () => {
			const consoleMock = mockConsoleLog();
			const routes = [
				'src/get.ts',
				'src/multiple-valid.ts',
				'src/mixed-valid.ts',
				'src/invalid.ts',
			];

			const rootDir = 'src';
			const basePath = '/base/path';
			const { files, ...fileHandler } = createFileHandler(routes, { rootDir, basePath });

			fileHandler.processGroup(files);

			const expected = [
				['GET', /^\/base\/path\/get\/*$/, ['require("src/get.ts").GET']],
				['GET', /^\/base\/path\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").GET']],
				['POST', /^\/base\/path\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").POST']],
				['GET', /^\/base\/path\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/base\/path\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(fileHandler.getProcessedRoutes()).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(2);
			expect(consoleMock).toHaveBeenCalledWith(`Processing ${routes.length} routes...`);
			expect(consoleMock).toHaveBeenCalledWith(`Using base path: ${basePath}`);
			consoleMock.mockRestore();
		});
	});

	suite('transformSyntax', () => {
		[
			{ name: 'greedy params', route: '/foo/[...bar]', expected: '/foo/:bar+' },
			{ name: 'wildcard', route: '/foo/[...]', expected: '/foo/*' },
			{ name: 'optional params', route: '/foo/[[bar]]', expected: '/foo/:bar?' },
			{ name: 'simple params', route: '/foo/[bar]', expected: '/foo/:bar' },
			{ name: 'file extension', route: '/foo/[bar].[[baz]]', expected: '/foo/:bar.:baz?' },
			{ name: 'simple + simple', route: '/foo/[bar][baz]', expected: '/foo/:bar:baz' },
			{ name: 'simple + greedy', route: '/foo/[bar][...baz]', expected: '/foo/:bar:baz+' },
		].forEach(({ name, route, expected }) => {
			test(name, () => {
				expect(transformSyntax(route)).toBe(expected);
			});
		});
	});
});
