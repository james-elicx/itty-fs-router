/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import type { RouteEntry } from 'itty-router';
import { Router } from 'itty-router';

declare const __ROUTES__: RouteEntry[];
declare const __BASE__: string | undefined;

const router = Router({ base: __BASE__, routes: __ROUTES__ });

export default {
	fetch: (req, env, ctx) => {
		(req as { ctx?: Record<string, unknown> }).ctx = Object.create(null);
		return router.handle(req, env, ctx);
	},
} as ExportedHandler;
