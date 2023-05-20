import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { argumentParser } from 'zodcli';
import { normalizePath } from './fs';

const booleanFlag = z
	.union([
		z.literal('true').transform(() => true),
		z.literal('false').transform(() => false),
		z.null().transform(() => true),
	])
	.default('false');

type DirectoryFlagArgs = { name: string; fallback: string; shouldExist?: boolean };
const directoryFlag = ({ name, fallback, shouldExist = false }: DirectoryFlagArgs) =>
	z
		.string()
		.optional()
		.default(fallback)
		.transform((path) => normalizePath(resolve(path)))
		.refine(
			(path) => path.startsWith(normalizePath(resolve())) && path !== normalizePath(resolve()),
			{ message: `The ${name} directory should be inside the current working directory` },
		)
		.refine((path) => !shouldExist || existsSync(path), {
			message: `The ${name} directory should exist`,
		});

const options = z
	.object({
		help: booleanFlag,
		silent: booleanFlag,
		skipMinify: booleanFlag,
		basePath: z
			.string()
			.optional()
			.default('')
			.transform((path) => (/^\//.test(path) ? path : `/${path}`)),
		rootDir: directoryFlag({ name: 'root', fallback: 'src', shouldExist: true }),
		outDir: directoryFlag({ name: 'output', fallback: 'dist' }),
	})
	.strict();

const getPlural = (str: (string | number)[]) => (str.length === 1 ? '' : 's');

type ParseCliErrorReturns = { text: string[]; showHelp: boolean };
const parseCliError = (e: Error | z.ZodError | unknown): ParseCliErrorReturns => {
	const issue = e instanceof z.ZodError ? e.issues[0] : undefined;

	switch (issue?.code) {
		case 'invalid_type':
		case 'custom': {
			return {
				text: [
					`Failed to parse the ${issue.path.join(', ')} argument${getPlural(issue.path)}.`,
					issue.message,
				],
				showHelp: false,
			};
		}
		case 'unrecognized_keys': {
			return {
				text: [`Unknown option${getPlural(issue.keys)}: ${issue.keys.join(', ')}`],
				showHelp: true,
			};
		}
		default: {
			return {
				text: [e instanceof Error ? e.message : 'Error parsing arguments'],
				showHelp: false,
			};
		}
	}
};

export const printHelpMessage = () => {
	console.log(`
	Usage: itty-fs-router [options]

	Options:
		--help						Show this help message
		--silent					Don't log anything to the console
		--skip-minify			Don't minify the output
		--root-dir				The root directory to search for files in
		--out-dir					The output directory to write the router to
		--base-path				The base path to use for the router
	`);
};

export const parseArgs = (): Args => {
	try {
		return argumentParser({ options }).parse(process.argv.slice(2));
	} catch (e) {
		const { text, showHelp } = parseCliError(e);

		console.error(text.join('\n'));
		if (showHelp) printHelpMessage();

		return process.exit(1);
	}
};

export type Args = z.infer<typeof options>;
export const args = parseArgs();

export const isWindows = process.platform === 'win32';

export const logger = {
	log: (msg: string) => !args.silent && console.log(msg),
	warn: (msg: string) => !args.silent && console.warn(msg),
	error: (msg: string) => !args.silent && console.error(msg),
};
