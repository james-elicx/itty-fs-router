import mockFs from 'mock-fs';
import {
	addOptionRoutes,
	processRoutes,
	type ProcessedRoute,
	transformSyntax,
} from 'src/cli/routes';
import {
	createProject,
	getSrcFile,
	getValidExportedDeclarations,
	groupExportedDeclarations,
	readPathsRecursively,
} from 'src/cli/utils';
import type { Project } from 'ts-morph';
import { suite, test, expect, beforeAll, afterAll } from 'vitest';
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
		});

		project = createProject(readPathsRecursively('.'));
	});

	afterAll(() => {
		mockFs.restore();
	});

	suite('addOptionRoutes', () => {
		test('should append valid middleware option routes', () => {
			const { options } = groupExportedDeclarations(
				getValidExportedDeclarations(getSrcFile(project, 'mixed-valid.ts')),
			);

			const arr: ProcessedRoute[] = [];
			addOptionRoutes(arr, options, 'middleware', { path: 'mixed-valid.ts', route: 'foo' });

			const expected = [['GET', /^foo\/*$/, ['require("mixed-valid.ts").middleware.GET']]];
			expect(arr).toEqual(expected);
		});
	});

	suite('processRoutes', () => {
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
			const processedRoutes = processRoutes(routes, { rootDir: 'src', basePath: '' });

			const expected = [
				['GET', /^\/get\/*$/, ['require("src/get.ts").GET']],
				['GET', /^\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").GET']],
				['POST', /^\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").POST']],
				['GET', /^\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(processedRoutes).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(routes.length);
			routes.forEach((path) => {
				expect(consoleMock).toHaveBeenCalledWith(
					`Processing route \`${path.replace(rootDir, basePath).replace('.ts', '')}\`...`,
				);
			});
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
			const processedRoutes = processRoutes(routes, { rootDir, basePath });

			const expected = [
				['GET', /^\/get\/*$/, ['require("custom-src/get.ts").GET']],
				['GET', /^\/multiple-valid\/*$/, ['require("custom-src/multiple-valid.ts").GET']],
				['POST', /^\/multiple-valid\/*$/, ['require("custom-src/multiple-valid.ts").POST']],
				['GET', /^\/mixed-valid\/*$/, ['require("custom-src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/mixed-valid\/*$/, ['require("custom-src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(processedRoutes).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(routes.length);
			routes.forEach((path) => {
				expect(consoleMock).toHaveBeenCalledWith(
					`Processing route \`${path.replace(rootDir, basePath).replace('.ts', '')}\`...`,
				);
			});
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
			const processedRoutes = processRoutes(routes, { rootDir, basePath });

			const expected = [
				['GET', /^\/base\/path\/get\/*$/, ['require("src/get.ts").GET']],
				['GET', /^\/base\/path\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").GET']],
				['POST', /^\/base\/path\/multiple-valid\/*$/, ['require("src/multiple-valid.ts").POST']],
				['GET', /^\/base\/path\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").middleware.GET']],
				['GET', /^\/base\/path\/mixed-valid\/*$/, ['require("src/mixed-valid.ts").GET']],
				['ALL', /^(.*)?\/*$/, ['() => new Response("Not found", { status: 404 })']],
			];
			expect(processedRoutes).toEqual(expected);

			expect(consoleMock).toHaveBeenCalledTimes(routes.length + 1);
			routes.forEach((path) => {
				expect(consoleMock).toHaveBeenCalledWith(
					`Processing route \`${path.replace(rootDir, basePath).replace('.ts', '')}\`...`,
				);
			});
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
