import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { goErrSync } from './err';

/**
 * Normalizes a path name. Useful for Windows paths.
 *
 * @param path Path name to normalize.
 * @returns Normalized path name.
 */
export const normalizePath = (path: string): string =>
	path.replace(/\\/g, '/').replace(/\/\//g, '/');

/**
 * Reads a directory's file paths recursively, filtering for `.js` and `.ts` files.
 *
 * @param dir Directory to read.
 * @returns Array of file paths.
 */
export const readPathsRecursively = (dir: string): string[] => [
	...new Set(
		readdirSync(dir)
			.filter((path) => /^.+(\.[jt]s)?$/.test(path))
			.map((path) => normalizePath(resolve(dir, path)))
			.map((path) =>
				goErrSync(() => statSync(path).isDirectory())[0] ? readPathsRecursively(path) : [path],
			)
			.flat(),
	),
];

/**
 * Squashes a path name.
 *
 * - Remove double slashes.
 * - Remove file extensions.
 * - Remove `/index`.
 *
 * @param path Path name to squash.
 * @returns Squashed path name.
 */
export const squashPath = (path: string): string =>
	path
		.replace(/\/\//, '/')
		.replace(/\.[tj]s$/, '')
		.replace(/\/index$/, '');

/**
 * Creates a string to require a file and access an exported variable.
 *
 * @param path Path name to the file.
 * @param variable Exported variable name.
 * @returns String to require the file and access the exported variable.
 */
export const createRequire = (path: string, variable: string): string =>
	`require(${JSON.stringify(path)}).${variable}`;
