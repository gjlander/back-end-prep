import { Router } from 'express';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/users.js';
import validateBody from '../middleware/validateBody.js';
import { userSchema } from '../zod/schemas.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody(userSchema), createUser);
userRouter.route('/:id').get(getUserById).put(validateBody(userSchema), updateUser).delete(deleteUser);

export default userRouter;
