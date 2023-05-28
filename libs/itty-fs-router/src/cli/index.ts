import { existsSync } from 'node:fs';
import { buildWorker } from './build';
import { createFileHandler } from './routes';
import { readPathsRecursively, printHelpMessage, args, logger } from './utils';

/**
 * Run the CLI.
 */
export const run = async (): Promise<void> => {
	const { basePath, rootDir, outDir, skipMinify, help, target } = args;

	if (help) {
		printHelpMessage();
		return;
	}

	if (!existsSync(rootDir)) {
		logger.error(`The root directory \`${rootDir}\` does not exist.`);
		process.exit(1);
	}

	const collectedRoutes = readPathsRecursively(rootDir);
	const { files, ...fileHandler } = createFileHandler(collectedRoutes, { basePath, rootDir });
	fileHandler.processGroup(files);

	const processedRoutes = fileHandler.getProcessedRoutes();

	await buildWorker(processedRoutes, { basePath, skipMinify, rootDir, outDir, target });
};

run();
