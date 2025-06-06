import { Router } from 'express';
import validateBody from '../middleware/validateBody.js';
import { signUp, signIn } from '../controllers/auth.js';
import { userSchema } from '../zod/schemas.js';

const authRouter = Router();

authRouter.route('/signup').post(validateBody(userSchema), signUp);

authRouter.route('/signin').post(validateBody(userSchema), signIn);

export default authRouter;
