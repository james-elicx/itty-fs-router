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

suite('Middleware option', () => {
	test('Non-middleware route does not get applied', async () => {
		const resp = await worker.fetch('/hello');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello world!"`);
	});

	test('Middleware route gets middleware applied', async () => {
		const resp = await worker.fetch('/with-middleware');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Middleware Context: 'Context from middleware'"`);
	});

	test('Non-middleware nested route with same path as middleware does not get applied', async () => {
		const resp = await worker.fetch('/with-middleware/hello');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello world!"`);
	});

	test('Middleware route with catch-all applies to all routes', async () => {
		const resp = await worker.fetch('/with-middleware-all', { method: 'PUT' });

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Middleware Context: 'Context from middleware'"`);
	});
});

suite('Not found option', () => {
	test('Not found route gets applied for correct method', async () => {
		const resp = await worker.fetch('/with-not-found', { method: 'POST' });

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Custom not found!!"`);
	});

	test('Not found route does not apply to valid method', async () => {
		const resp = await worker.fetch('/with-not-found', { method: 'GET' });

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello world!"`);
	});

	test('Not found route does not apply to incorrect method', async () => {
		const resp = await worker.fetch('/with-not-found', { method: 'PUT' });

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
	});

	test('Non-not found nested route with same path as not found does not get applied', async () => {
		const resp = await worker.fetch('/with-not-found/hello', { method: 'POST' });

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"Hello world!"`);
	});

	test('Missing non-not found nested route with same path as not found does not get applied', async () => {
		const resp = await worker.fetch('/with-not-found/invalid-route', { method: 'POST' });

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
	});

	test('Not found route with with catch-all applies to all methods', async () => {
		const resp = await worker.fetch('/with-not-found-all', { method: 'PUT' });

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Custom not found!!"`);
	});
});

suite('Not found option with middleware option', () => {
	test('Middleware and not found route gets applied for correct method', async () => {
		const resp = await worker.fetch('/with-middleware-and-not-found');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"Custom not found. Middleware Context: Hello from middleware"`,
		);
	});
});
