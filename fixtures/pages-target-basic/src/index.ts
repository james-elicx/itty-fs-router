import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello from GET', { status: 200 });
};

export const POST: RouteHandler = () => {
	return new Response('Hello from POST', { status: 200 });
};
