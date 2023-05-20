import type { NotFound } from 'itty-fs-router';

export const notFound: NotFound = {
	ALL: () => new Response('Custom not found!!', { status: 404 }),
};
