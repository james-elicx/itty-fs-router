/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import type { RouteEntry } from 'itty-router';
import { Router } from 'itty-router';

declare const __ROUTES__: RouteEntry[];
declare const __BASE__: string | undefined;
declare const __ASSETS__: Record<string, true>;

const router = Router({ base: __BASE__, routes: __ROUTES__ });

export default {
	fetch: (req, env, ctx) => {
		const url = new URL(req.url);
		if (url.pathname.replace(new RegExp(`^/${__BASE__}`), '') in __ASSETS__) {
			return env.ASSETS.fetch(req);
		}

		(req as { ctx?: Record<string, unknown> }).ctx = Object.create(null);
		return router.handle(req, env, ctx);
	},
} as ExportedHandler<{ ASSETS: Fetcher }>;
