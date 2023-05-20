import { Project, type ExportedDeclarations, type SourceFile } from 'ts-morph';
import type { Method } from '../../types';
import { logger } from './cli';
import { goErrSync } from './err';

export type OptionExport = 'middleware' | 'notFound';
export type ValidExport = Method | OptionExport;
export const validMethods: Method[] = [
	'GET',
	'POST',
	'PUT',
	'PATCH',
	'DELETE',
	'HEAD',
	'OPTIONS',
	'ALL',
];
export const validOptions: OptionExport[] = ['middleware', 'notFound'];
export const validExports: ValidExport[] = [...validOptions, ...validMethods];

/**
 * Creates a new `ts-morph` project with the given paths.
 *
 * @param paths Paths to load into the `ts-morph` project.
 * @returns A new `ts-morph` project.
 */
export const createProject = (paths: string[]) => {
	const project = new Project({ compilerOptions: { allowJs: true } });
	project.addSourceFilesAtPaths(paths);

	return project;
};

/**
 * Retrieves the source file and AST for a given path, from the created `ts-morph` project.
 *
 * @param project The `ts-morph` project.
 * @param path Path to file to retrieve the AST for.
 * @returns The source file and AST.
 */
export const getSrcFile = (project: Project, path: string): SourceFile => {
	const [src, err] = goErrSync(() => project.getSourceFileOrThrow(path));
	if (err) {
		logger.error(`Error reading file ${path}: ${err}`);
		process.exit(1);
	}
	return src;
};

/**
 * Gets the exported declarations from a source file, filtering out any that are not valid exports.
 *
 * @param src Source file.
 * @returns Exported declarations from the source file.
 */
export const getValidExportedDeclarations = (
	src: SourceFile,
): Map<ValidExport, ExportedDeclarations[]> =>
	new Map<ValidExport, ExportedDeclarations[]>(
		[...(src.getExportedDeclarations() as Map<ValidExport, ExportedDeclarations[]>)].filter(
			([key]) => validExports.includes(key),
		),
	);

export type GroupedExportedDeclarations = {
	methods: Map<Method, ExportedDeclarations[]>;
	options: Map<OptionExport, ExportedDeclarations[]>;
};
/**
 * Groups together exported declarations into exported methods and exported configuration options.
 *
 * @param exports A map of exported declarations.
 * @returns The exported declarations grouped by method and option.
 */
export const groupExportedDeclarations = (
	exports: Map<ValidExport, ExportedDeclarations[]>,
): GroupedExportedDeclarations => {
	const methods = new Map<Method, ExportedDeclarations[]>();
	const options = new Map<OptionExport, ExportedDeclarations[]>();

	for (const [key, value] of exports) {
		if (validMethods.includes(key as Method)) methods.set(key as Method, value);
		else if (validOptions.includes(key as OptionExport)) options.set(key as OptionExport, value);
	}

	return { methods, options };
};

/**
 * Gets the keys of valid exported options from an exported declaration object.
 *
 * @param exportedDeclarations A list of exported declarations.
 * @param validatorArr An array of valid keys.
 * @returns An array of valid keys.
 */
export const getExportedOptionKeys = <T = Method>(
	exportedDeclarations: ExportedDeclarations[] | undefined,
	validatorArr: T[],
): T[] => [
	...new Set(
		exportedDeclarations
			?.map((declaration) =>
				(declaration.getFirstChildByKind(207)?.getProperties() ?? [])
					.map((prop) => (prop.getSymbol()?.getName() ?? '') as T)
					.filter((key) => validatorArr.includes(key as T)),
			)
			.filter(Boolean)
			.flat() ?? [],
	),
];
