import type { MiddlewareConfig, RouteHandler } from 'itty-fs-router';

export const ALL: RouteHandler = (req) => {
	const middlewareCtx = req.ctx['from-middleware'];

	return new Response(`Middleware Context: '${middlewareCtx}'`);
};

export const middleware: MiddlewareConfig = {
	ALL: (req) => {
		req.ctx['from-middleware'] = 'Context from middleware';
	},
};
