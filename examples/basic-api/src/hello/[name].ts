import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<{ name: string }> = ({ params }) => {
	return new Response(`Hello, ${params.name}!`);
};
