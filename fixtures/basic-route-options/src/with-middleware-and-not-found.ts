import type { Middleware, NotFound } from 'itty-fs-router';

export const middleware: Middleware = {
	GET: (req) => {
		req.ctx['from-middleware'] = 'Hello from middleware';
	},
};

export const notFound: NotFound = {
	GET: (req) => {
		return new Response(`Custom not found. Middleware Context: ${req.ctx['from-middleware']}`, {
			status: 404,
		});
	},
};
