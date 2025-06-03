import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  addDuckToPond,
  updateDuckInPond,
  deleteDuckFromPond
} from '../controllers/users.js';
import validateBody from '../middleware/validateBody.js';
import { userSchema, pondDuckSchema } from '../zod/schemas.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody(userSchema), createUser);
userRouter.route('/:id').get(getUserById).put(validateBody(userSchema), updateUser).delete(deleteUser);
userRouter.route('/:id/ducks').post(validateBody(pondDuckSchema), addDuckToPond);

userRouter
  .route('/:id/ducks/:pondDuckId')
  .put(validateBody(pondDuckSchema.omit({ duckId: true })), updateDuckInPond)
  .delete(deleteDuckFromPond);

export default userRouter;
