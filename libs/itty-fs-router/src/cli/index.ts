import { buildWorker } from './build';
import { processRoutes } from './routes';
import { readPathsRecursively, printHelpMessage, args } from './utils';

/**
 * Run the CLI.
 */
export const run = async (): Promise<void> => {
	const { basePath, rootDir, outDir, skipMinify, help } = args;

	if (help) {
		printHelpMessage();
		return;
	}

	const collectedRoutes = readPathsRecursively(rootDir);
	const processedRoutes = processRoutes(collectedRoutes, { basePath, rootDir });

	await buildWorker(processedRoutes, { basePath, skipMinify, outDir });
};

run();
