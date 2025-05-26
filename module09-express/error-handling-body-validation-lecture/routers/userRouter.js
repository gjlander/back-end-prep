import { Router } from 'express';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/users.js';
import validateBody from '../middleware/validateBody.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody('user'), createUser);
userRouter.route('/:id').get(getUserById).put(validateBody('user'), updateUser).delete(deleteUser);

export default userRouter;
