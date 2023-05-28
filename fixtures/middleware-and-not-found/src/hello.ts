import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = (req) => {
	return new Response(
		JSON.stringify({
			root: req.ctx['from-middleware-root'],
			nested: req.ctx['from-middleware-nested'],
			route: req.ctx['from-middleware-route'],
		}),
		{ status: 200 },
	);
};
