import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => {
	return new Response('Hello from GET', { status: 200 });
};

export const POST: RouteHandler = () => {
	return new Response('Hello from POST', { status: 200 });
};

export const PUT: RouteHandler = () => {
	return new Response('Hello from PUT', { status: 200 });
};

export const PATCH: RouteHandler = () => {
	return new Response('Hello from PATCH', { status: 200 });
};

export const DELETE: RouteHandler = () => {
	return new Response('Hello from DELETE', { status: 200 });
};

export const OPTIONS: RouteHandler = () => {
	return new Response('Hello from OPTIONS', { status: 200 });
};
