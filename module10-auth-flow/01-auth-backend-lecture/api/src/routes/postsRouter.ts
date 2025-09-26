import { Router } from 'express';
import { validateZod } from '#middlewares';
import { createPost, deletePost, getAllPosts, getSinglePost, updatePost } from '#controllers';
import { postSchema } from '#schemas';
import { authenticate, hasRole } from '#middlewares';

const postsRouter = Router();

postsRouter.route('/').get(getAllPosts).post(authenticate, hasRole('user'), validateZod(postSchema), createPost);

postsRouter
  .route('/:id')
  .get(getSinglePost)
  .put(authenticate, hasRole('self'), validateZod(postSchema), updatePost)
  .delete(authenticate, hasRole('self'), deletePost);

export default postsRouter;
