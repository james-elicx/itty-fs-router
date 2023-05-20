import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<{ url: string }> = ({ params }) => {
	return new Response(`greedy params: ${JSON.stringify(params)}`);
};
