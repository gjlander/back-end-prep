import { Router } from 'express';
import validateBody from '../middleware/validateBody.js';
import verifyToken from '../middleware/verifyToken.js';
import { signUp, signIn, me } from '../controllers/auth.js';
import { userSchema, signInSchema } from '../zod/schemas.js';

const authRouter = Router();

authRouter.route('/signup').post(validateBody(userSchema), signUp);

authRouter.route('/signin').post(validateBody(signInSchema), signIn);

authRouter.route('/me').get(verifyToken, me);

export default authRouter;
