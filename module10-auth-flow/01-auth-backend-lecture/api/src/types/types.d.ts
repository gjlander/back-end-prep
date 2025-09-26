import { userSchema, postSchema, signInSchema, postDBSchema } from '#schemas';
import type { z } from 'zod/v4';
import type { Post } from '#models';

declare global {
  type UserRequestBody = z.infer<typeof userSchema>;
  type PostRequestBody = z.infer<typeof postSchema>;
  type SignInRequestBody = z.infer<typeof signInSchema>;

  type SanitizedBody = UserRequestBody | PostRequestBody | SignInRequestBody;

  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
      post?: InstanceType<typeof Post>;
    }
  }
}
