import { spawn } from 'node:child_process';
import type { UnstableDevWorker } from 'wrangler';
import { unstable_dev } from 'wrangler';

export type FetchResponse = Response & { rawText: string };
export type Worker = {
	worker: UnstableDevWorker;
	stop: () => Promise<void>;
	fetch: (path: string, opts?: RequestInit) => Promise<FetchResponse>;
};

export const createWorker = async (filePath: string, assetsDir?: string): Promise<Worker> => {
	const worker = await unstable_dev(filePath, {
		experimental: {
			disableExperimentalWarning: true,
			enablePagesAssetsServiceBinding: assetsDir ? { directory: assetsDir } : undefined,
		},
		compatibilityDate: '2023-05-18',
	});

	const stop = () => worker.stop();

	const request = async (path: string, opts?: RequestInit) => {
		const url = new URL(path, `http://${worker.address}:${worker.port}`);
		const resp = await fetch(url, opts);

		const text = await resp.text();
		Object.assign(resp, { rawText: text });

		return resp as FetchResponse;
	};

	return { worker, stop, fetch: request };
};

export const buildWorker = async (args: string[] = []) =>
	new Promise((res, rej) => {
		const cmd = process.platform === 'win32' ? '.cmd' : '';
		const npx = spawn(`npx${cmd}`, ['itty-fs-router', '--silent', ...args]);

		npx.stdout.on('data', (data) => console.log(data.toString()));
		npx.stderr.on('data', (data) => console.error(data.toString()));

		npx.on('close', () => res(true));
		npx.on('error', (err) => rej(err));
	});
