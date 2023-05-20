import mockFs from 'mock-fs';
import type { Project } from 'ts-morph';
import { suite, test, expect, beforeAll, afterAll } from 'vitest';
import { readPathsRecursively } from '../../../src/cli/utils';
import {
	createProject,
	getSrcFile,
	getValidExportedDeclarations,
	groupExportedDeclarations,
} from '../../../src/cli/utils/ts-morph';

suite('ts-morph', () => {
	let project: Project;

	beforeAll(() => {
		mockFs({
			'get.ts': `export const GET = "foo";`,
			'multiple-valid.ts': `export const GET = "foo"; export const POST = "bar";`,
			'mixed-valid.ts': `export const GET = "foo"; export const middleware = { GET: "" };`,
			'invalid.ts': `import { GET } from "./get"; export const invalid = { GET };`,
		});

		project = createProject(readPathsRecursively('.'));
	});

	afterAll(() => {
		mockFs.restore();
	});

	suite('getSrcFile', () => {
		test('gets source file', () => {
			const file = getSrcFile(project, 'get.ts');
			expect(file.getText()).toMatch(/export const GET = "foo";/);
		});
	});

	suite('getValidExportedDeclarations', () => {
		test('single valid export', () => {
			const exported = getValidExportedDeclarations(getSrcFile(project, 'get.ts'));

			expect(exported.size).toEqual(1);
			expect(exported.get('GET')?.length).toEqual(1);
			expect(exported.get('GET')?.[0]?.getText()).toMatch(/GET = "foo"/);
		});

		test('multiple valid exports', () => {
			const exported = getValidExportedDeclarations(getSrcFile(project, 'multiple-valid.ts'));

			expect(exported.size).toEqual(2);
			expect(exported.get('GET')?.length).toEqual(1);
			expect(exported.get('GET')?.[0]?.getText()).toMatch(/GET = "foo"/);
			expect(exported.get('POST')?.length).toEqual(1);
			expect(exported.get('POST')?.[0]?.getText()).toMatch(/POST = "bar"/);
		});

		test('mixed valid exports', () => {
			const exported = getValidExportedDeclarations(getSrcFile(project, 'mixed-valid.ts'));

			expect(exported.size).toEqual(2);
			expect(exported.get('GET')?.length).toEqual(1);
			expect(exported.get('GET')?.[0]?.getText()).toMatch(/GET = "foo"/);
			expect(exported.get('middleware')?.length).toEqual(1);
			expect(exported.get('middleware')?.[0]?.getText()).toMatch(/middleware = { GET: "" }/);
		});

		test("doesn't get invalid exports", () => {
			const exported = getValidExportedDeclarations(getSrcFile(project, 'invalid.ts'));

			expect(exported.size).toEqual(0);
		});
	});

	suite('groupExportedDeclarations', () => {
		test('groups mixed valid exports', () => {
			const exported = groupExportedDeclarations(
				getValidExportedDeclarations(getSrcFile(project, 'mixed-valid.ts')),
			);

			expect(exported.methods.size).toEqual(1);
			expect(exported.methods.get('GET')?.length).toEqual(1);
			expect(exported.methods.get('GET')?.[0]?.getText()).toMatch(/GET = "foo"/);

			expect(exported.options.size).toEqual(1);
			expect(exported.options.get('middleware')?.length).toEqual(1);
			expect(exported.options.get('middleware')?.[0]?.getText()).toMatch(
				/middleware = { GET: "" }/,
			);
		});
	});

	suite('getExportedOptionKeys', () => {
		test('gets exported option keys', () => {
			const exported = groupExportedDeclarations(
				getValidExportedDeclarations(getSrcFile(project, 'mixed-valid.ts')),
			);

			expect([...exported.options.keys()]).toEqual(['middleware']);
		});

		test('returns empty when no options', () => {
			const exported = groupExportedDeclarations(
				getValidExportedDeclarations(getSrcFile(project, 'multiple-valid.ts')),
			);

			expect([...exported.options.keys()]).toEqual([]);
		});
	});
});
