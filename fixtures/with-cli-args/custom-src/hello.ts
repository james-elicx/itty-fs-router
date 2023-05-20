import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello world!', { status: 200 });
};
