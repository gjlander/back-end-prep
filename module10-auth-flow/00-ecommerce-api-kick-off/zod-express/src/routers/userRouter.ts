import { Router } from 'express';
import {
	getUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser
} from '#controllers';
import { validateBody } from '#middleware';
import { userInputSchema, paramsSchema } from '#schemas';

const userRouter = Router();

userRouter
	.route('/')
	.get(getUsers)
	.post(validateBody(userInputSchema, 'body'), createUser);

userRouter.use('/:id', validateBody(paramsSchema, 'params'));
userRouter
	.route('/:id')
	.get(getUserById)
	.put(validateBody(userInputSchema, 'body'), updateUser)
	.delete(deleteUser);

export default userRouter;
