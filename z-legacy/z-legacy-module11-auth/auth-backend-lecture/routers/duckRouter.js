import { Router } from 'express';
import { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck } from '../controllers/ducks.js';
import validateBody from '../middleware/validateBody.js';
import { duckSchema } from '../zod/schemas.js';

const duckRouter = Router();

duckRouter.route('/').get(getAllDucks).post(validateBody(duckSchema), createDuck);

duckRouter.route('/:id').get(getDuckById).put(validateBody(duckSchema), updateDuck).delete(deleteDuck);

export default duckRouter;
