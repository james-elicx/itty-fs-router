import type { Middleware, NotFound, RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = (req) => {
	return new Response(
		JSON.stringify({
			root: req.ctx['from-middleware-root'],
			nested: req.ctx['from-middleware-nested'],
			route: req.ctx['from-middleware-route'],
		}),
	);
};

export const POST: RouteHandler = (req) => {
	return new Response(
		JSON.stringify({
			root: req.ctx['from-middleware-root'],
			nested: req.ctx['from-middleware-nested'],
			route: req.ctx['from-middleware-route'],
		}),
	);
};

export const middleware: Middleware = {
	POST: (req) => {
		req.ctx['from-middleware-route'] = 'Context from route middleware';
	},
};

export const notFound: NotFound = {
	ALL: () => {
		return new Response('Not found (route)', { status: 404 });
	},
};
