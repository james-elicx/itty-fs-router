import { buildWorker, type Worker } from '@fixtures/utils';
import { createWorker } from '@fixtures/utils';
import { beforeAll, afterAll, expect, suite, test } from 'vitest';

let worker: Worker;
beforeAll(async () => {
	await buildWorker();
	worker = await createWorker('dist/index.js');
});

afterAll(async () => {
	await worker.stop();
});

suite('Basic method routes', () => {
	['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].forEach((method) => {
		test(`Same route handles multiple methods (${method})`, async () => {
			const resp = await worker.fetch('/', { method });

			expect(resp.status).toEqual(200);
			expect(resp.rawText).toMatchInlineSnapshot(`"Hello from ${method}"`);
		});
	});

	['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].forEach((method) => {
		test(`Catch-all method (ALL) catches for invalid method (${method})`, async () => {
			const resp = await worker.fetch('/catch-all', { method });

			expect(resp.status).toEqual(200);
			expect(resp.rawText).toMatchInlineSnapshot(`"Method caught in a catch-all route"`);
		});
	});

	test('Invalid route returns 404', async () => {
		const resp = await worker.fetch('/invalid-route');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
	});

	test('Nested route returns for valid method on index route', async () => {
		const resp = await worker.fetch('/nested');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello from GET in a nested route!"`);
	});

	test('Nested route returns for valid method on normal route', async () => {
		const resp = await worker.fetch('/nested/hello');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello world! From a nested route!"`);
	});

	['/nested', '/nested/hello'].forEach((path) => {
		test('Nested route invalid method request returns 404', async () => {
			const resp = await worker.fetch(path, { method: 'POST' });

			expect(resp.status).toEqual(404);
			expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
		});
	});
});
