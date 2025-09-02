import { Router, type RequestHandler } from 'express';
import {
	getAllDucks,
	createDuck,
	getDuckById,
	updateDuck,
	deleteDuck
} from '#controllers';
const duckRouter = Router();

const duckMiddleware: RequestHandler = (req, res, next) => {
	console.log('I only appear on the duck routes!');
	next();
};

const validateDuck: RequestHandler = (req, res, next) => {
	// body validation logic here...
	console.log('Validation passed!');
	next();
};

const verifyToken: RequestHandler = (req, res, next) => {
	// token verification logic here...
	req.userId = '68b046de0f7e46123b038d5b';
	next();
};

duckRouter.use(duckMiddleware);

duckRouter.route('/').get(getAllDucks).post(validateDuck, createDuck);

duckRouter
	.route('/:id')
	.get(getDuckById)
	.put(verifyToken, updateDuck)
	.delete(deleteDuck);

export default duckRouter;
