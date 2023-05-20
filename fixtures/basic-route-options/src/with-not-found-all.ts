import type { MiddlewareConfig } from 'itty-fs-router';

export const notFound: MiddlewareConfig = {
	ALL: () => new Response('Custom not found!!', { status: 404 }),
};
