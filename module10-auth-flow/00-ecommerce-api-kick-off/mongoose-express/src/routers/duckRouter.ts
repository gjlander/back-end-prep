import { Router } from 'express';
import {
	getAllDucks,
	createDuck,
	getDuckById,
	updateDuck,
	deleteDuck
} from '#controllers';
import { validateBody } from '#middleware';
import { duckInputSchema, duckUpdateInputSchema, paramsSchema } from '#schemas';
const duckRouter = Router();

duckRouter
	.route('/')
	.get(getAllDucks)
	.post(validateBody(duckInputSchema, 'body'), createDuck);

duckRouter.use('/:id', validateBody(paramsSchema, 'params'));
duckRouter
	.route('/:id')
	.get(getDuckById)
	.put(validateBody(duckUpdateInputSchema, 'body'), updateDuck)
	.delete(deleteDuck);

export default duckRouter;
