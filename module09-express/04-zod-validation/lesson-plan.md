# Body Validation with Zod

- As promised, we're going to look at more sophisticated body validation, but first, let's take a look at building a middleware factory

## Building a middleware factory

- Because functions are first class citizens in JS (and by extension TS), we can return them from another function
- Let's build a middleware factory to validate our input (with placeholder logic for now)
- `middleware/validateBody.ts`
  - Let's move our `validateDuck` function to it's own file, and return it from a more general `validateBody` function

```ts
import { type RequestHandler } from 'express';

const validateBody = (): RequestHandler => {
	return (req, res, next) => {
		// body validation logic here...
		console.log('Validation passed!');
		next();
	};
};
```

- Re-export

```ts
export { default as errorHandler } from './errorHandler.ts';
export { default as validateBody } from './validateBody.ts';
```

- Import it into `duckRouter.ts`

```js
import { validateBody } from '#middleware';
```

- Previously we were putting the function without parenthesis, but now we want our middleware factory to actually run, and return the actual middleware we'll be using
- So we call `validateBody()`, and it returns the function we want to go there

```js
duckRouter.route('/').get(getAllDucks).post(validateBody(), createDuck);
```

- Because we are using arrow functions, we can actually simplify our factory to look like this
  - But it's important to note that even without the return keyword, we are RETURNing this middleware

```ts
const validateBody = (): RequestHandler => (req, res, next) => {
	// body validation logic here...
	console.log('Validation passed!');
	next();
};
```

- From here, we can add a parameter to our middleware factory
- We can specify if we want to validate a user, or a duck specifically based on a predefined schema

```ts
import { type RequestHandler } from 'express';

const validateBody =
	(schema: string): RequestHandler =>
	(req, res, next) => {
		// body validation logic here...
		console.log(`Validation passed! This is a valid ${schema}`);
		next();
	};

export default validateBody;
```

- Now when we call it, we need to pass an argument. For now, just a string to indicate what we want to validate
- `duckRouter.ts`

```js
duckRouter.route('/').get(getAllDucks).post(validateBody('duck'), createDuck);

duckRouter
	.route('/:id')
	.get(getDuckById)
	.put(verifyToken, validateBody('duck'), updateDuck)
	.delete(deleteDuck);
```

- `userRouter.ts`

```ts
import { validateBody } from '#middleware';

const userRouter = Router();

userRouter.route('/').get(getAllUsers).post(validateBody('user'), createUser);
userRouter
	.route('/:id')
	.get(getUserById)
	.put(validateBody('user'), updateUser)
	.delete(deleteUser);
```

- Now if we POST or PUT to `users` or `ducks` we get the specific message. We have the blueprint now for adding in actual validation logic with Zod

## Validation with Zod

- Yes, the very same Zod that we used in the frontend! We can use it to validate user input, and do more than just check if the property is there or not
- We first need to install it
  `npm i zod`

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
