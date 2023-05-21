import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () =>
	new Response('Hello, world! This page was served by `itty-fs-router`.', { status: 200 });
