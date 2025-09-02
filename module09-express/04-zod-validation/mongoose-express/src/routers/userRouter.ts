import { Router } from 'express';
import {
	getAllUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser
} from '#controllers';
import { validateBody } from '#middleware';

const userRouter = Router();

userRouter.route('/').get(getAllUsers).post(validateBody('user'), createUser);
userRouter
	.route('/:id')
	.get(getUserById)
	.put(validateBody('user'), updateUser)
	.delete(deleteUser);

export default userRouter;
