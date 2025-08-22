# Routers

-   To organize our routes we'll first make a `routers` folder, then a file for `userRouter` and `duckRouter`

## `duckRouter.js`

-   import `Router` object

```js
import { Router } from 'express';
```

-   Create an instance of the Router and export it

```js
const duckRouter = Router();

export default duckRouter;
```

-   Move imports from `index.js` and update path

```js
import {
    getAllDucks,
    createDuck,
    getDuckById,
    updateDuck,
    deleteDuck,
} from '../controllers/ducks.js';
```

-   Move routes, and use router instead of app, and remove `ducks`

```js
duckRouter.route('/').get(getAllDucks).post(createDuck);

duckRouter.route('/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);
```

-   Import `duckRouter` in `index.js`

```js
import duckRouter from './routers/duckRouter.js';
```

-   use the router for `ducks`

```js
app.use('/ducks', duckRouter);
```

## `userRouter.js`

-   Do the same for the user routes. Help me out?

```js
import { Router } from 'express';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from '../controllers/users.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(createUser);
userRouter.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default userRouter;
```

-   `index.js`

```js
import userRouter from './routers/userRouter.js';
//other stuff...
app.use('users', userRouter);
```
