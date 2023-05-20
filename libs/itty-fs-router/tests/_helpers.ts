// eslint-disable-next-line import/no-extraneous-dependencies
import { vi } from 'vitest';

export const mockProcessExit = () =>
	vi.spyOn(process, 'exit').mockImplementation(() => null as never);
export const mockConsoleErr = () =>
	vi.spyOn(console, 'error').mockImplementation(() => null as never);
export const mockConsoleLog = () =>
	vi.spyOn(console, 'log').mockImplementation(() => null as never);
