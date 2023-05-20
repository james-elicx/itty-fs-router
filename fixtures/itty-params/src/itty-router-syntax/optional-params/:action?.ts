import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<{ action?: string }> = ({ params }) => {
	return new Response(`optional params: ${JSON.stringify(params)}`);
};
