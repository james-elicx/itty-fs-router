import type { MiddlewareRouteHandler } from 'itty-fs-router';

export const ALL: MiddlewareRouteHandler = (req) => {
	req.ctx['from-middleware-nested'] = 'Context from nested middleware';
};
