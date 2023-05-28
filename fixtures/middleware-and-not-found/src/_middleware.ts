import type { MiddlewareRouteHandler } from 'itty-fs-router';

export const ALL: MiddlewareRouteHandler = (req) => {
	req.ctx['from-middleware-root'] = 'Context from root middleware';
};
