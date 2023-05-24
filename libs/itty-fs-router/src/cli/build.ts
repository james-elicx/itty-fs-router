import { cpSync, existsSync } from 'node:fs';
import { rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import type { ProcessedRoute } from './routes';
import type { Args } from './utils';
import { readPathsRecursively } from './utils';

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const __dirname = dirname(__filename);

/**
 * Converts processed routes into a string to be injected into the worker script.
 *
 * @param routes Processed routes to pass to Itty.
 * @returns A string of the routes to be injected into the worker script.
 */
const getRoutesStr = (routes: ProcessedRoute[]): string => {
	return `export const __ROUTES__ = [${routes
		.map(
			([method, expr, entries]) => `[${JSON.stringify(method)}, ${expr}, [${entries.join(',')}]]`,
		)
		.join(',')}];`;
};

/**
 * Builds a worker file from processed routes.
 *
 * @param routes Processed routes to pass to Itty.
 * @param args The base path, minification, and output directory settings.
 */
export const buildWorker = async (
	routes: ProcessedRoute[],
	{
		basePath,
		skipMinify,
		rootDir,
		outDir,
		target,
	}: Pick<Args, 'basePath' | 'skipMinify' | 'rootDir' | 'outDir' | 'target'>,
) => {
	// Write the routes to a temporary file so they can be injected
	const tempRoutesFile = join(tmpdir(), `itty-fs-${Math.random().toString(36).slice(2)}.js`);
	writeFile(tempRoutesFile, getRoutesStr(routes));

	// Clean and then create the output directory.
	if (existsSync(outDir)) {
		await rm(outDir, { recursive: true, force: true });
	}
	await mkdir(outDir, { recursive: true });

	const outDirIsFile = /\.[cm]?[jt]s$/.test(outDir);
	const outputFileName = target === 'pages' ? '_worker.js' : 'index.js';
	const outputFile = outDirIsFile ? outDir : `${outDir}/${outputFileName}`;

	// Handle `/public` directory in pages mode.
	const publicDir = resolve(rootDir, '..', outDirIsFile ? '..' : '', 'public');
	let assets: Record<string, true> | undefined;
	if (target === 'pages' && existsSync(publicDir)) {
		assets = readPathsRecursively(publicDir)
			.map((path) => `/${relative(publicDir, path)}`)
			.reduce((acc, path) => ({ ...acc, [path]: true }), {});

		cpSync(publicDir, outDir, { recursive: true });
	}

	return build({
		entryPoints: [resolve(__dirname, 'template', `${target}.js`)],
		bundle: true,
		inject: [tempRoutesFile],
		target: 'es2022',
		platform: 'neutral',
		define: {
			__BASE__: JSON.stringify(basePath),
			...(target === 'pages' && { __ASSETS__: JSON.stringify(assets || {}) }),
		},
		outfile: outputFile,
		minify: !skipMinify,
	});
};
