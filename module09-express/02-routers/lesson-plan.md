# Routers

- To organize our routes we'll first make a `routers` folder, then a file for `userRouter` and `duckRouter`
- Add to imports

```json
"#routers": {
			"development": "./src/routers/index.ts",
			"default": "./dist/routers/index.js"
		}
```

## `duckRouter.ts`

- import `Router` object

```js
import { Router } from 'express';
```

- Create an instance of the Router and export it

```js
const duckRouter = Router();

export default duckRouter;
```

- Re-export from `index.ts`

```ts
export { default as duckRouter } from './duckRouter.ts';
```

- Move imports from `app.ts`

```js
import {
	getAllDucks,
	createDuck,
	getDuckById,
	updateDuck,
	deleteDuck
} from '#controllers';
```

- Move routes, and use router instead of app, and remove `ducks`

```js
duckRouter.route('/').get(getAllDucks).post(createDuck);

duckRouter.route('/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);
```

- Import `duckRouter` in `app.ts`

```js
import { duckRouter } from '#routers';
```

- use the router for `ducks`

```js
app.use('/ducks', duckRouter);
```

## `userRouter.js`

- Do the same for the user routes. Help me out?

```js
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
```

- `index.ts`

```ts
export { default as duckRouter } from './duckRouter.ts';
export { default as userRouter } from './userRouter.ts';
```

- `app.ts`

```ts
import { duckRouter, userRouter } from '#routers';
//other stuff...
app.use('/users', userRouter);
```
