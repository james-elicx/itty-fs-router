/**
 * Runs a function and return the result and error in an array, similar to Golang error handling.
 *
 * @param cb Function to execute.
 * @returns Array with the result of the function and the error.
 */
export const goErr = async <T>(cb: () => T): Promise<[Awaited<T>, Error]> => {
	try {
		const val = await cb();
		return [val, undefined as unknown as Error];
	} catch (err) {
		return [undefined as unknown as Awaited<T>, err as Error];
	}
};

/**
 * Runs a function and return the result and error in an array, similar to Golang error handling.
 *
 * @param cb Function to execute.
 * @returns Array with the result of the function and the error.
 */
export const goErrSync = <T>(cb: () => T): [T, Error] => {
	try {
		const val = cb();
		return [val, undefined as unknown as Error];
	} catch (err) {
		return [undefined as unknown as T, err as Error];
	}
};
