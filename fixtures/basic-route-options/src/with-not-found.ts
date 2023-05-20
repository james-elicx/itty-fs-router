import type { NotFound, RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello world!');
};

export const notFound: NotFound = {
	POST: () => new Response('Custom not found!!', { status: 404 }),
};
