import type { RouteHandler } from 'itty-fs-router';

export const POST: RouteHandler = () => {
	return new Response('Hello world!');
};
