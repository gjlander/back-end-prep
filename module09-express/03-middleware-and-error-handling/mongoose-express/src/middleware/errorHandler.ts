import { type ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	process.env.NODE_ENV !== 'development' &&
		console.error(`\x1b[31m${err.stack}\x1b[0m`);
	res.status(err.cause || 500).json({ message: err.message });
};

export default errorHandler;
