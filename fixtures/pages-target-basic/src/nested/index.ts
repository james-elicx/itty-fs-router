import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello from GET in a nested route!');
};
