import type { NotFoundRouteHandler } from 'itty-fs-router';

export const ALL: NotFoundRouteHandler = () => {
	return new Response('Not found (root)', { status: 404 });
};
