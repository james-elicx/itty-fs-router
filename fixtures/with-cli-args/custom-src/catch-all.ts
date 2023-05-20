import type { RouteHandler } from 'itty-fs-router';

export const ALL: RouteHandler = () => {
	return new Response('Method caught in a catch-all route');
};
