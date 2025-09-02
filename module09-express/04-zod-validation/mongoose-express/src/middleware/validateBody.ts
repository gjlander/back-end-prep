import { type RequestHandler } from 'express';

const validateBody =
	(schema: string): RequestHandler =>
	(req, res, next) => {
		// body validation logic here...
		console.log(`Validation passed! This is a valid ${schema}`);
		next();
	};

export default validateBody;
