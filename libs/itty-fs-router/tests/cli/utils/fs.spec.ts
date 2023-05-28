import { resolve } from 'path';
import mockFs from 'mock-fs';
import { suite, test, expect, beforeAll, afterAll } from 'vitest';
import {
	createRequire,
	normalizePath,
	readPathsRecursively,
	squashPath,
} from '../../../src/cli/utils/fs';

suite('fs', () => {
	suite('normalizePath', () => {
		test('windows paths', () => {
			expect(normalizePath('C:\\\\a\\\\b.ts')).toEqual('C:/a/b.ts');
		});

		test('unix paths', () => {
			expect(normalizePath('/a/b.ts')).toEqual('/a/b.ts');
		});
	});

	suite('readPathsRecursively', () => {
		beforeAll(() => {
			mockFs({ 'a.ts': '', 'b.ts': '', nested: { 'c.ts': '', nested: { 'd.ts': '' } } });
		});
		afterAll(() => {
			mockFs.restore();
		});

		test('gets nested files', () => {
			const expected = ['/nested/c.ts', '/nested/nested/d.ts', '/a.ts', '/b.ts'];
			const result = readPathsRecursively('.').map((path) =>
				path.replace(normalizePath(resolve()), ''),
			);

			expect(result).toEqual(expected);
		});
	});

	suite('squashPath', () => {
		test('squash double slashes', () => {
			expect(squashPath('a//b')).toEqual('a/b');
		});

		test('squash extensions', () => {
			expect(squashPath('foo.js')).toEqual('foo');
			expect(squashPath('foo.ts')).toEqual('foo');
		});

		test('squash index', () => {
			expect(squashPath('a/index')).toEqual('a');
		});
	});

	suite('createRequire', () => {
		test('creates a require string', () => {
			expect(createRequire('foo', 'bar')).toEqual('require("foo").bar');
		});
	});
});
