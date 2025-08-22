import { Router } from 'express';
import { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck } from '../controllers/ducks.js';
import validateBody from '../middleware/validateBody.js';
import { duckSchema } from '../zod/schemas.js';
const duckRouter = Router();

const verifyToken = (req, res, next) => {
  // token verification logic here...
  req.userId = 1;
  next();
};

duckRouter.route('/').get(getAllDucks).post(validateBody(duckSchema), createDuck);

duckRouter.route('/:id').get(getDuckById).put(verifyToken, validateBody(duckSchema), updateDuck).delete(deleteDuck);

export default duckRouter;
