import { Router } from 'express';
import {
	getAllUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser
} from '#controllers';

const userRouter = Router();

userRouter.route('/users').get(getAllUsers).post(createUser);
userRouter
	.route('/users/:id')
	.get(getUserById)
	.put(updateUser)
	.delete(deleteUser);

export default userRouter;
