import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<{ id: string }> = ({ params }) => {
	return new Response(`simple params: ${JSON.stringify(params)}`);
};
