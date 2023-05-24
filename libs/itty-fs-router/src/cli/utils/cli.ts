import { resolve } from 'node:path';
import { z } from 'zod';
import { argumentParser } from 'zodcli';
import { normalizePath } from './fs';

// shared flag for boolean values
const booleanFlag = z
	.union([
		z.literal('true').transform(() => true),
		z.literal('false').transform(() => false),
		z.null().transform(() => true),
	])
	.default('false');

// shared flag for directories
type DirectoryFlagArgs = { name: string; fallback: string };
const directoryFlag = ({ name, fallback }: DirectoryFlagArgs) =>
	z
		.string()
		.optional()
		.default(fallback)
		.transform((path) => normalizePath(resolve(path)))
		.refine(
			(path) => path.startsWith(normalizePath(resolve())) && path !== normalizePath(resolve()),
			{ message: `The ${name} directory should be inside the current working directory` },
		);

const options = z
	.object({
		help: booleanFlag.describe(JSON.stringify({ msg: 'Show this help message.', fb: 'false' })),
		silent: booleanFlag.describe(JSON.stringify({ msg: 'Silence all CLI logging.', fb: 'false' })),
		skipMinify: booleanFlag.describe(
			JSON.stringify({ msg: 'Skip minification of the generated worker.', fb: 'false' }),
		),
		basePath: z
			.string()
			.optional()
			.default('')
			.transform((path) => (/^\//.test(path) ? path : `/${path}`))
			.describe(JSON.stringify({ msg: 'Base path for the router.', fb: '' })),
		rootDir: directoryFlag({ name: 'root', fallback: 'src' }).describe(
			JSON.stringify({ msg: 'Root directory for the project.', fb: 'src' }),
		),
		outDir: directoryFlag({ name: 'output', fallback: 'dist' }).describe(
			JSON.stringify({ msg: 'Output directory for the generated worker.', fb: 'dist' }),
		),
		target: z
			.union([z.literal('workers'), z.literal('pages')])
			.optional()
			.default('workers')
			.describe(
				JSON.stringify({ msg: 'Platform to target; "workers" or "pages".', fb: 'workers' }),
			),
	})
	.strict();

const aliases: { [key: string]: keyof Args } = {
	h: 'help',
};

const invertedAliases = Object.entries(aliases).reduce(
	(acc, [key, value]) => ({ ...acc, [value]: key }),
	{} as { [key in keyof Args]?: string },
);

/**
 * Determines the pluralization for an array.
 *
 * @param str Array to determine pluralization for.
 * @returns The pluralization for the array.
 */
const getPlural = (str: (string | number)[]) => (str.length === 1 ? '' : 's');

type ParseCliErrorReturns = { text: string[]; showHelp: boolean };

/**
 * Parses a CLI error and returns the error message to print and whether to show the help message.
 *
 * @param e Error to parse.
 * @returns Error message to print and whether to show the help message.
 */
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

/**
 * Prints the help message.
 */
export const printHelpMessage = () => {
	const opts = Object.entries(options.shape)
		.map(([key, opt]) => {
			const argKey = key
				.split(/(?=[A-Z])/)
				.map((s) => s.toLowerCase())
				.join('-');

			const alias = invertedAliases[key as keyof Args];
			const aliasStr = alias ? `-${alias},` : '   ';

			const filler = ' '.repeat(22 - argKey.length - aliasStr.length - 1);

			const { msg, fb } = JSON.parse(opt.description || '{}') as { msg?: string; fb?: string };

			const descArr = msg?.match(/.{1,50}(\s|$)/g) || [''];
			const desc = descArr
				.map((d) => `${d}${' '.repeat(50 - d.length)}`)
				.join(`\n${' '.repeat(27)}`);

			const defaultVal = fb !== undefined ? `[default: ${JSON.stringify(fb)}]` : '';

			return `  ${aliasStr} --${argKey} ${filler} ${desc} ${defaultVal}`;
		})
		.join('\n');

	console.log(`
Usage: itty-fs-router [options]

Options:

${opts}
`);
};

/**
 * Parses the CLI arguments.
 *
 * @returns The parsed CLI arguments.
 */
export const parseArgs = (): Args => {
	try {
		return argumentParser({ options, aliases }).parse(process.argv.slice(2));
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
	/**
	 * Logs a message to the console.
	 *
	 * @param msg Message to log.
	 * @returns The logged message.
	 */
	log: (msg: string) => !args.silent && console.log(msg),
	/**
	 * Logs a warning to the console.
	 *
	 * @param msg Warning to log.
	 * @returns The logged warning.
	 */
	warn: (msg: string) => !args.silent && console.warn(msg),
	/**
	 * Logs an error to the console.
	 *
	 * @param msg Error to log.
	 * @returns The logged error.
	 */
	error: (msg: string | Error) => !args.silent && console.error(msg),
};
