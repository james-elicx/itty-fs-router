import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<{ file: string; extension?: string }> = ({ params }) => {
	return new Response(`file extensions: ${JSON.stringify(params)}`);
};
