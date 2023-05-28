import { relative } from 'node:path';
import type { ExportedDeclarations } from 'ts-morph';
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
import type { Args, OptionExport } from './utils';

export const transformSyntax = (route: string) =>
	route
		.replace(/\[\.\.\.(\w+)\]/g, ':$1+') // greedy params: [...param]
		.replace(/\[\.\.\.\]/g, '*') // wildcard: [...]
		.replace(/\[\[(\w+)\]\]/g, ':$1?') // optional params: [[param]]
		.replace(/\[(\w+)\]/g, ':$1'); // simple params: [param]

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
		`^${transformSyntax(route)
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
export const addRouteOptions = (
	routes: ProcessedRoute[],
	declarations: ExportedDeclarations[] | undefined,
	option: OptionExport,
	{ path, route, wildcard }: { path: string; route: string; wildcard?: boolean },
) => {
	const methods = getExportedOptionKeys(declarations, validMethods);
	for (const method of methods) {
		routes.push([
			method,
			createRouteExpression(`${route}${wildcard ? '*' : ''}`),
			[createRequire(path, `${option}.${method}`)],
		]);
	}
};

type GroupedRoutes = {
	config: string[];
	middleware: string[];
	notFound: string[];
	routes: string[];
};

/**
 * Groups the paths of the routes, middleware, not found files, and config files.
 *
 * @param routes List of route paths.
 * @returns An object with the paths grouped by config, middleware, not found, and routes.
 */
export const groupRoutePaths = (routes: string[]) => {
	const configRegExp = /.+_config\.[jt]s$/;
	const middlewareRegExp = /.+_middleware\.[jt]s$/;
	const notFoundRegExp = /.+_(notFound|not-found)\.[jt]s$/;

	return routes.reduce<GroupedRoutes>(
		(acc, route) => {
			if (configRegExp.test(route)) acc.config.push(route);
			else if (middlewareRegExp.test(route)) acc.middleware.push(route);
			else if (notFoundRegExp.test(route)) acc.notFound.push(route);
			else acc.routes.push(route);
			return acc;
		},
		{ config: [], middleware: [], notFound: [], routes: [] },
	);
};

export type ProcessedRoute = [string, RegExp, string[]];
type ProcessArgs = { methodsOnly?: boolean; shouldLog?: boolean; wildcard?: boolean };

/**
 * Creates a file handler for the route paths.
 *
 * @param routes Array of route paths.
 * @param args The root directory and base path.
 * @returns An object with methods to handle and finish processing the routes, as well as the grouped paths.
 */
export const createFileHandler = (
	paths: string[],
	{ rootDir, basePath }: Pick<Args, 'basePath' | 'rootDir'>,
) => {
	if (basePath) logger.log(`Using base path: ${basePath}`);

	const groupedPaths = groupRoutePaths(paths);
	const project = createProject(paths);

	const finalRoutes: ProcessedRoute[] = [];

	const processPaths = (
		routePaths: string[],
		{ methodsOnly, shouldLog, wildcard }: ProcessArgs = {},
	) => {
		if (shouldLog) {
			const plural = routePaths.length > 1 ? 's' : '';
			logger.log(`Processing ${routePaths.length} route${plural}...`);
		}

		for (const path of routePaths) {
			const route = squashPath(normalizePath(`${basePath}/${relative(rootDir, path)}`)) || '/';

			const srcFile = getSrcFile(project, path);

			const exportedDeclarations = getValidExportedDeclarations(srcFile, methodsOnly);
			const { methods, options } = groupExportedDeclarations(exportedDeclarations);

			addRouteOptions(finalRoutes, options.get('middleware'), 'middleware', { path, route });

			for (const [method] of methods) {
				finalRoutes.push([
					method,
					createRouteExpression(`${route}${wildcard ? '*' : ''}`),
					[createRequire(path, method)],
				]);
			}

			addRouteOptions(finalRoutes, options.get('notFound'), 'notFound', { path, route });
		}
	};

	return {
		/**
		 * The file paths, grouped by routes, middleware, not found files, and config files.
		 */
		files: groupedPaths,

		/**
		 * Processes a set of routes, middleware, or not found files.
		 *
		 * @param routePaths The paths of the routes to process.
		 * @param args Options for processing a path.
		 */
		process: processPaths,

		/**
		 * Processes the grouped route paths.
		 *
		 * @param files Grouped route paths.
		 */
		processGroup: (files: GroupedRoutes) => {
			processPaths(files.middleware, { methodsOnly: true, wildcard: true });
			processPaths(files.routes, { shouldLog: true });
			processPaths(files.notFound, { methodsOnly: true, wildcard: true });
		},

		/**
		 * Retrieves the processed routes.
		 *
		 * @returns Processed routes to pass to Itty.
		 */
		getProcessedRoutes: () => {
			finalRoutes.push([
				'ALL',
				createRouteExpression('*'),
				['() => new Response("Not found", { status: 404 })'],
			]);

			return finalRoutes;
		},
	};
};
