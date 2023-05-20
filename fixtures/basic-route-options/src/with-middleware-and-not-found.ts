import type { MiddlewareConfig } from 'itty-fs-router';

export const middleware: MiddlewareConfig = {
	GET: (req) => {
		req.ctx['from-middleware'] = 'Hello from middleware';
	},
};

export const notFound: MiddlewareConfig = {
	GET: (req) => {
		return new Response(`Custom not found. Middleware Context: ${req.ctx['from-middleware']}`, {
			status: 404,
		});
	},
};
