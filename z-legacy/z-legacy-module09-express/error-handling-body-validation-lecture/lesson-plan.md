# Error handling and Body Validation

# Error handling

## Express built-in error handler

- Express gives us back an HTML response by default, for our RESTful API we want a JSON response
  - show invalid route in Postman
  - show invalid method

## Create custom error handler

- Just like in starter repo, we'll create a `middlewares` folder
  `middlewares/errorHandler.js`
- An error handler is a special type of middleware that has an `error` as the first parameter
  - When an error is thrown without a catch block, it gets handled by Express

```js
const errorHandler = (err, req, res, next) => {
  process.env.NODE_ENV !== 'production' && console.error(err.stack);
  res.status(err.cause || 500).json({ error: err.message });
};

export default errorHandler;
```

- Because order matters, we put the error handler after all of our routes
  - Having it before any route, means that for that route our custom error handler wouldn't be used

```js
import express from 'express';
import './db/associations.js';
import duckRouter from './routers/duckRouter.js';
import userRouter from './routers/userRouter.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/ducks', duckRouter);
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

- Now if we throw an error anywhere in our application. it will get handled by our custom `errorHandler`

### Getting rid of the try/catch blocks

- Since Express is handling our errors, we no longer need try/catch blocks, just to throw an error when something goes wrong
- This simplifies our code quite a bit

```js
import Duck from '../models/Duck.js';
import User from '../models/User.js';

const getAllDucks = async (req, res) => {
  const ducks = await Duck.findAll({ include: User });
  res.json(ducks);
};

const createDuck = async (req, res) => {
  const { userId, name, imgUrl, quote } = req.body;
  if (!name || !imgUrl) throw new Error('Missing required fields', { cause: 400 });

  const newDuck = await Duck.create({ userId, name, imgUrl, quote });
  res.status(201).json(newDuck);
};

const getDuckById = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByPk(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json(duck);
};

const updateDuck = async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { name, imgUrl, quote } = req.body;

  console.log('userId', userId);

  if (!name || !imgUrl || !quote) throw new Error('Missing required fields', { cause: 400 });

  const duck = await Duck.findByPk(id, { include: User });

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  if (userId !== duck.user.id) throw new Error('You are not authorized to update this duck', { cause: 403 });

  await duck.update({ name, imgUrl, quote });
  res.json(duck);
};

const deleteDuck = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByPk(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  await duck.destroy();

  res.json({ message: `Duck deleted successfully` });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

- Same in our `user` controllers

```js
import User from '../models/User.js';
import Duck from '../models/Duck.js';

export const getUsers = async (req, res) => {
  const users = await User.findAll({ include: Duck });
  res.json(users);
};

export const createUser = async (req, res) => {
  const {
    body: { firstName, lastName, email }
  } = req;
  if (!firstName || !lastName || !email) throw new Error('firstName, lastName, and email are required', { cause: 400 });
  const user = await User.create(req.body);
  res.json(user);
};

export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};

export const updateUser = async (req, res) => {
  const {
    body: { firstName, lastName, email },
    params: { id }
  } = req;
  if (!firstName || !lastName || !email)
    return res.status(400).json({ error: 'firstName, lastName, and email are required' });
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found', { cause: 404 });
  await user.update(req.body);
  res.json(user);
};

export const deleteUser = async (req, res) => {
  const {
    params: { id }
  } = req;
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found', { cause: 404 });
  await user.destroy();
  res.json({ message: 'User deleted' });
};
```

### Creating a `*splat` route

- But for routes/methods that don't exist we're still getting the default behavior
- Just like in React Router we could use a `*` as a wildcard to make a 404 route, we can do a similar thing in Express
- Since Express v5 we're supposed to use `*splat` over `*`
- Again, `app.use()` so that any method our route that isn't defined lands here
- Place it second to last, just above our `errorHandler`

```js
app.use('*splat', (req, res) => {
  throw new Error('Not found', { cause: 404 });
});

app.use(errorHandler);
```

- Now if an invalid method or route is used, we land here and get a simple `Not Found` message

# Body Validation with Zod

- As promised, we're going to look at more sophisticated body validation, but first, let's take a look at building a middleware factory

## Building a middleware factory

- Because functions are first class citizens in JS, we can return them from another function
- Building on the example in th exercise, let's build a middleware factory to validate our input (with placeholder logic for now)
- `middleware/validateBody.js`
  - Let's return our `validateDuck` function

```js
const validateBody = () => {
  return (req, res, next) => {
    // body validation logic here...
    console.log('Validation passed!');
    next();
  };
};
```

- Import it into `duckRouter.js`

```js
import validateBody from '../middleware/validateBody.js';
```

- Previously we were putting the function without parenthesis, but now we want our middleware factory to actually run, and return the actual middleware we'll be using
- So we call `validateBody()`, and it returns the function we want to go there

```js
duckRouter.route('/').get(getAllDucks).post(validateBody(), createDuck);
```

- Because we are using arrow functions, we can actually simplify our factory to look like this
  - But it's important to note that even without the return keyword, we are RETURNing this middleware

```js
const validateBody = () => (req, res, next) => {
  // body validation logic here...
  console.log('Validation passed!');
  next();
};
```

- From here, we can add a parameter to our middleware factory
- We can specify if we want to validate a user, or a duck specifically based on a predefined schema

```js
const validateBody = schema => (req, res, next) => {
  // body validation logic here...
  console.log(`Validation passed! This is a valid ${schema}`);
  next();
};

export default validateBody;
```

- Now when we call it, we need to pass an argument. For now, just a string to indicate what we want to validate
- `duckRouter.js`

```js
duckRouter.route('/').get(getAllDucks).post(validateBody('duck'), createDuck);

duckRouter.route('/:id').get(getDuckById).put(verifyToken, validateBody('duck'), updateDuck).delete(deleteDuck);
```

- `userRouter.js`

```js
import validateBody from '../middleware/validateBody.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody('user'), createUser);
userRouter.route('/:id').get(getUserById).put(validateBody('user'), updateUser).delete(deleteUser);
```

- Now if we POST to `users` or `ducks` we get the specific message

## Adding a custom property to the request object

- Since middleware can also add new properties to the request object, if our validation sanitizes the body, we could attach that too

```js
const validateBody = schema => (req, res, next) => {
  // body validation logic here...
  console.log(`Validation passed! This is a valid ${schema}`);
  req.sanitizedBody = req.body; // after going through validation
  next();
};

export default validateBody;
```

- Then use the `sanitizedBody` instead when working with the body
- And because our middleware is handling the validation, we don't need the validation checks here

```js
const createDuck = async (req, res) => {
  const { userId, name, imgUrl, quote } = req.sanitizedBody;
  //   if (!name || !imgUrl) throw new Error('Missing required fields', { cause: 400 });

  const newDuck = await Duck.create({ userId, name, imgUrl, quote });
  res.status(201).json(newDuck);
};

const getDuckById = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByPk(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json(duck);
};
```

- Also update `updateDuck`, `createUser`, and `updateUser`

## Error handling in a middleware

- Back in our middleware factory, we need to add error handling. There's 2 options

  1. throwing an `Error` openly
  2. Calling `next()` with an argument
     - If we call `next` with an argument, Express will read the argument as an error, and pass things straight to our error handler

- Let's call `next()` with an error using an `if` statement

```js
const validateBody = schema => (req, res, next) => {
  const error = true;
  // body validation logic here...

  if (error) {
    next(new Error(`Invalid ${schema}!`, { cause: 400 }));
  } else {
    console.log(`Validation passed! This is a valid ${schema}`);
    req.sanitizedBody = req.body; // after going through validation
    next();
  }
};

export default validateBody;
```

- Now we get our error response.
- Of course, this is all just a skeleton for what we'll need to do with actual validation, which is where Zod comes in!

## Body Validation with [Zod](https://zod.dev/)

- With Zod, we can define a schema based on many constraints
- This is similar to our model from `Sequelize`, but we can get even more detailed about the shape we want our data to have, and we prevent costly database queries that we know would fail from even starting

### Points to cover in docs

- z types
- z.object
- parse vs. safeParse
- Returns `data` on success and `error` on failure
- prettifyError

#### We will cover how to use Zod in detail in the correction, but I want to give you a chance based on what we've covered to try and implement it
