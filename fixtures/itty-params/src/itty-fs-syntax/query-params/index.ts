import type { IttyFsParams, RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler<IttyFsParams, { action: string }> = ({ query }) => {
	return new Response(`query params: ${JSON.stringify(query)}`);
};
