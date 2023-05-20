import { buildWorker, type Worker } from '@fixtures/utils';
import { createWorker } from '@fixtures/utils';
import { beforeAll, afterAll, expect, suite, test } from 'vitest';

let worker: Worker;

[
	{ args: ['--base-path=base-path'], basePath: '/base-path' },
	{ args: ['--root-dir=custom-src'] },
	{ args: ['--out-dir=custom-dist'], outDir: 'custom-dist' },
	{ args: ['--skip-minify'] },
].forEach(({ args = [], basePath = '', outDir = 'dist' }) => {
	suite(`Using CLI args: ${args.join(' ')}`, () => {
		beforeAll(async () => {
			await buildWorker(args);
			worker = await createWorker(`${outDir}/index.js`);
		});

		afterAll(async () => {
			await worker.stop();
		});

		test('Route with correct header returns', async () => {
			const resp = await worker.fetch(`${basePath}/hello`);

			expect(resp.status).toEqual(200);
			expect(resp.rawText).toMatchInlineSnapshot(`"Hello world!"`);
		});

		test('Catch-all header in router catches invalid headers', async () => {
			const resp = await worker.fetch(`${basePath}/catch-all`);

			expect(resp.status).toEqual(200);
			expect(resp.rawText).toMatchInlineSnapshot(`"Method caught in a catch-all route"`);
		});

		test('Invalid route returns 404', async () => {
			const resp = await worker.fetch(`${basePath}/invalid-route`);

			expect(resp.status).toEqual(404);
			expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
		});

		test('Nested route returns for valid method on index route', async () => {
			const resp = await worker.fetch(`${basePath}/nested`);

			expect(resp.status).toEqual(200);
			expect(resp.rawText).toMatchInlineSnapshot(`"Hello from GET in a nested route!"`);
		});

		test('Nested route invalid method request returns 404', async () => {
			const resp = await worker.fetch(`${basePath}/nested`, { method: 'POST' });

			expect(resp.status).toEqual(404);
			expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
		});
	});
});
