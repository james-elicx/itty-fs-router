import type { MiddlewareConfig, RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello world!');
};

export const notFound: MiddlewareConfig = {
	POST: () => new Response('Custom not found!!', { status: 404 }),
};
