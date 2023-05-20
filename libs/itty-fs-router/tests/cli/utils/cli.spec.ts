import { suite, test, expect } from 'vitest';
import { parseArgs } from '../../../src/cli/utils/cli';
import { mockProcessExit, mockConsoleErr, mockConsoleLog } from '../../_helpers';

suite('parseArgs', () => {
	test('no args returns defaults', () => {
		process.argv = ['node', 'index.js'];

		expect(parseArgs()).toEqual({
			basePath: '/',
			help: false,
			skipMinify: false,
			outDir: expect.stringMatching(/.+\/itty-fs-router\/dist$/),
			rootDir: expect.stringMatching(/.+\/itty-fs-router\/src$/),
			silent: false,
		});
	});

	test('custom valid args returns custom values', () => {
		process.argv = [
			'node',
			'index.js',
			'--help',
			'--silent',
			'--skip-minify',
			'--base-path=test',
			'--out-dir=./src/cli',
			'--root-dir=src/cli',
		];

		expect(parseArgs()).toEqual({
			basePath: '/test',
			help: true,
			skipMinify: true,
			outDir: expect.stringMatching(/.+\/itty-fs-router\/src\/cli$/),
			rootDir: expect.stringMatching(/.+\/itty-fs-router\/src\/cli$/),
			silent: true,
		});
	});

	test('invalid outdir (outside directory) prints error and exits', () => {
		process.argv = ['node', 'index.js', '--out-dir=../invalid'];
		const exitMock = mockProcessExit();
		const consoleMock = mockConsoleErr();

		expect(parseArgs()).toEqual(null);

		expect(exitMock).toHaveBeenCalledTimes(1);
		exitMock.mockRestore();

		expect(consoleMock).toHaveBeenCalledTimes(1);
		expect(consoleMock).toHaveBeenCalledWith(
			expect.stringMatching(/output directory should be inside/),
		);
		consoleMock.mockRestore();
	});

	test('invalid argument prints error and exits', () => {
		process.argv = ['node', 'index.js', '--invalid-arg'];
		const exitMock = mockProcessExit();
		const consoleMock = mockConsoleErr();
		const consoleLogMock = mockConsoleLog();

		expect(parseArgs()).toEqual(null);

		expect(exitMock).toHaveBeenCalledTimes(1);
		exitMock.mockRestore();

		expect(consoleMock).toHaveBeenCalledTimes(1);
		expect(consoleMock).toHaveBeenCalledWith(expect.stringMatching(/Unknown option: --invalid/));
		consoleMock.mockRestore();

		expect(consoleLogMock).toHaveBeenCalledTimes(1);
		expect(consoleLogMock).toHaveBeenCalledWith(expect.stringMatching(/Usage: itty-fs-router/));
		consoleLogMock.mockRestore();
	});
});
