import { relative } from 'node:path';
import {
	getExportedOptionKeys,
	groupExportedDeclarations,
	createRequire,
	getSrcFile,
	getValidExportedDeclarations,
	squashPath,
	normalizePath,
	validMethods,
	createProject,
	logger,
} from './utils';
import type { Args, GroupedExportedDeclarations, OptionExport } from './utils';

// TODO: `_config` for that directory and its descendants.

/**
 * Creates a regular expression for a route path.
 *
 * This uses the the same syntax and rules as itty-router - they were taken directory from the
 * source code.
 *
 * https://github.com/kwhitley/itty-router/blob/v4.x/src/Router.ts#L61-L67
 *
 * @param route Route path to convert to a regular expression.
 * @returns Regular expression for the route.
 */
const createRouteExpression = (route: string) =>
	RegExp(
		`^${route
			.replace(/\/+(\/|$)/g, '$1') // remove multiple/trailing slash
			.replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
			.replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
			.replace(/\./g, '\\.') // dot in path
			.replace(/(\/?)\*/g, '($1.*)?')}/*$`, // wildcard
	);

/**
 * Adds routes for the methods of an option.
 *
 * @param routes Processed routes array.
 * @param options Exported declarations grouped by option.
 * @param option Option to add.
 * @param args.path Path to the file containing the option.
 * @param args.route Route path for the option.
 * @param args.wildcard Whether the option is a wildcard.
 */
export const addOptionRoutes = (
	routes: ProcessedRoute[],
	options: GroupedExportedDeclarations['options'],
	option: OptionExport,
	{ path, route, wildcard }: { path: string; route: string; wildcard?: boolean },
) => {
	const methods = getExportedOptionKeys(options.get(option), validMethods);
	for (const method of methods) {
		routes.push([
			method,
			createRouteExpression(`${route}${wildcard ? '*' : ''}`),
			[createRequire(path, `${option}.${method}`)],
		]);
	}
};

export type ProcessedRoute = [string, RegExp, string[]];

/**
 * Processes the routes so that they can be passed to Itty.
 *
 * @param routes Array of route paths.
 * @param args The root directory and base path.
 * @returns Processed routes to pass to Itty.
 */
export const processRoutes = (
	routes: string[],
	{ rootDir, basePath }: Pick<Args, 'basePath' | 'rootDir'>,
): ProcessedRoute[] => {
	const finalRoutes: ProcessedRoute[] = [];

	const configRegExp = /.+_config\.[jt]s$/;
	// const configPaths = routes.filter((route) => configRegExp.test(route));
	const routePaths = routes.filter((route) => !configRegExp.test(route));

	const project = createProject(routes);

	if (basePath) logger.log(`Using base path: ${basePath}`);

	// TODO: Support for `_config` files before the route files.

	for (const path of routePaths) {
		const route = squashPath(normalizePath(`${basePath}/${relative(rootDir, path)}`));
		logger.log(`Processing route \`${route || '/'}\`...`);

		const srcFile = getSrcFile(project, path);
		const exportedDeclarations = getValidExportedDeclarations(srcFile);

		const { methods, options } = groupExportedDeclarations(exportedDeclarations);

		addOptionRoutes(finalRoutes, options, 'middleware', { path, route });

		for (const [method] of methods) {
			finalRoutes.push([method, createRouteExpression(route), [createRequire(path, method)]]);
		}

		addOptionRoutes(finalRoutes, options, 'notFound', { path, route });
	}

	finalRoutes.push([
		'ALL',
		createRouteExpression('*'),
		['() => new Response("Not found", { status: 404 })'],
	]);

	return finalRoutes;
};
