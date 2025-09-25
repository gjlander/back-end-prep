import { type RequestHandler } from 'express';
import { z, type ZodObject, type ZodString } from 'zod/v4';

type ValidationOptions = 'body' | 'params' | 'query';

const validateBody =
	(
		zodSchema: ZodObject | ZodString,
		property: ValidationOptions
	): RequestHandler =>
	(req, res, next) => {
		if (!req[property])
			next(
				new Error(`Missing ${property} in request`, {
					cause: {
						status: 400
					}
				})
			);
		console.log(property);
		console.log(req[property]);
		const { data, error, success } = zodSchema.safeParse(req[property]);
		if (!success) {
			next(
				new Error(z.prettifyError(error), {
					cause: {
						status: 400
					}
				})
			);

			// throw new Error(z.prettifyError(error), {
			// 	cause: {
			// 		status: 400
			// 	}
			// });
		} else {
			req[property] = data;
			next();
		}
	};

export default validateBody;
