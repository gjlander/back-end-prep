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

### Declare a Zod schema once

- Let's now create a new folder for our zod schemas, and add it to imports
- Then we create our duck input schema, this is just what's coming in from the user
  - By using a `strictObject`, if there are additional properties than what we've allowed, it will throw an error
  - We can even do our ObjectId validation check with Zod, by using their `refine` method

```ts
import { z } from 'zod/v4';
import { isValidObjectId } from 'mongoose';

const duckInputSchema = z.strictObject({
	name: z
		.string()
		.min(1, 'Your duck must have a name')
		.max(255, 'Maximum name length is 255 characters'),
	imgUrl: z.url({
		protocol: /^https?$/,
		hostname: z.regexes.domain
	}),
	quote: z.string().min(1, 'A quote is required'),
	owner: z.string().refine(val => isValidObjectId(val), 'Invalid owner ID')
});

export { duckInputSchema };
```

- Don't forget to re-export

### Runtime validation middleware

- We now use that schema in our middleware to get actual runtime validation
- Since our middleware is now taking a Zod schema, we import the type from Zod so we can run `safeParse()` on it

```ts
import { type RequestHandler } from 'express';
import { z, type ZodObject } from 'zod/v4';

const validateBody =
	(zodSchema: ZodObject): RequestHandler =>
	(req, res, next) => {
		// body validation logic here...
		const { data, error, success } = zodSchema.safeParse(req.body);
		console.log(`Validation passed! This is a valid ${zodSchema}`);
		next();
	};

export default validateBody;
```

### Error handling in a middleware

- Based on the `success` property we get back from `safeParse`, we can either throw an error, or continue along the chain
- There's 2 options for handling the error

  1. throwing an `Error` openly
  2. Calling `next()` with an argument
     - If we call `next` with an argument, Express will read the argument as an error, and pass things straight to our error handler

- Let's call `next()` with an error using an `if` statement
  - Here cause has a nested object, this is a stylistic preference, we'll go with how it was yesterday, and just set the cause as a number

```js
if (!success) {
	next(
		new Error(z.prettifyError(error), {
			cause: {
				status: 400
			}
		})
	);
}
```

- Since Express v5 this is functionally the same as simply throwing the error

```ts
throw new Error(z.prettifyError(error), {
	cause: {
		status: 400
	}
});
```

- On success, we can take that `data` response (which is the sanitized version of our input) and replace the `body` with this validated data

```ts
import { type RequestHandler } from 'express';
import { z, type ZodObject } from 'zod/v4';

const validateBody =
	(zodSchema: ZodObject): RequestHandler =>
	(req, res, next) => {
		// body validation logic here...
		const { data, error, success } = zodSchema.safeParse(req.body);
		if (!success) {
			next(
				new Error(z.prettifyError(error), {
					cause: 400
				})
			);

			// new Error(z.prettifyError(error), {
			// 		cause: 400
			// 	})
		} else {
			req.body = data;
			next();
		}
	};

export default validateBody;
```

## Use it in routes

- Now back in `duckRouter.ts`, TS is complaining that we're passing strings, so instead we pass our schema

```ts
import { duckInputSchema } from '#schemas';
duckRouter
	.route('/')
	.get(getAllDucks)
	.post(validateBody(duckInputSchema), createDuck);

duckRouter
	.route('/:id')
	.get(getDuckById)
	.put(verifyToken, validateBody(duckInputSchema), updateDuck)
	.delete(deleteDuck);
```

- But wait, we don't include the `owner` property in our `PUT` request. Zod has helpers very similar to TS's utilities, so we can make a schema that omits the owner

```ts
const duckUpdateInputSchema = duckInputSchema.omit({ owner: true });

export { duckInputSchema, duckUpdateInputSchema };
```

- Now if we're missing a property, or get an unexpected one, we get an error

## Some small improvements

- Back in our duck controllers, we declared a type for our duck input. We can use Zod as our single source of truth, and infer the types from our schema instead
- Since we don't need the actual schemas, we can import them as types

```ts
import type { z } from 'zod/v4';
import type { duckInputSchema, duckUpdateInputSchema } from '#schemas';
```

- We can use `z.infer` to get our types

```ts
type DuckType = z.infer<typeof duckInputSchema>;

type UpdateDuckType = z.infer<typeof duckUpdateInputSchema>;
```

- The type ends up looking exactly the same, but now updating our Zod schema will automatically update our type as well

### What is a DTO?

- Refer to DTO in article
- This is the plain old JS/TS object that will be sent through, so no methods, etc. It's what will show up in the JSON. So to indicate that intent, we can rename our types

```ts
type DuckInputDTO = z.infer<typeof duckInputSchema>;

type UpdateDuckDTO = z.infer<typeof duckUpdateInputSchema>;
```

### Removing controller level validations

- Since we are validating in our middleware, we can safely remove our basic validation checks from each controller, further simplifying our logic
- Since we can be sure the body only has valid inputs, we can even skip destructuring, and just pass the body directly for `create`

```ts
import type { RequestHandler } from 'express';
import { Duck } from '#models';
import type { z } from 'zod/v4';
import type { duckInputSchema, duckUpdateInputSchema } from '#schemas';

type DuckInputDTO = z.infer<typeof duckInputSchema>;

type UpdateDuckDTO = z.infer<typeof duckUpdateInputSchema>;

const getAllDucks: RequestHandler = async (req, res) => {
	const ducks = await Duck.find();

	res.json(ducks);
};
const createDuck: RequestHandler<{}, {}, DuckInputDTO> = async (req, res) => {
	const newDuck = await Duck.create<DuckInputDTO>(req.body);

	res.json(newDuck);
};
const getDuckById: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	res.json(duck);
};
const updateDuck: RequestHandler<{ id: string }, {}, UpdateDuckDTO> = async (
	req,
	res
) => {
	const { name, imgUrl, quote } = req.body;
	const { id } = req.params;
	const { userId } = req;

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	// console.log(duck.owner);
	if (userId !== duck.owner.toString())
		throw new Error('You are not authorized to update this duck', {
			cause: 403
		});

	duck.name = name;
	duck.imgUrl = imgUrl;
	duck.quote = quote;

	await duck.save();
	res.json(duck);
};
const deleteDuck: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	const found = await Duck.findByIdAndDelete(id);

	if (!found) throw new Error('Duck Not Found', { cause: 404 });

	res.json({ message: 'Duck deleted' });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

### Adding type safety to the Response body

- This is already a significant improvement over how we were previously validating our inputs. But there's one more refinement we can add to help us write clean code. In our `RequestHandler` generic, we can also type what we want the Response Body to look like.
- For example, we expect to get our newly created duck back under `createDuck`, but we could send back whatever we want

```ts
const createDuck: RequestHandler<{}, {}, DuckInputDTO> = async (req, res) => {
	const { name, imgUrl, quote, owner } = req.body;

	const newDuck = await Duck.create<DuckInputDTO>({
		name,
		imgUrl,
		quote,
		owner
	});

	res.json({ message: 'New duck added!' });
};
```

- To make it clear, we can type the response body.

```ts
const createDuck: RequestHandler<{}, DuckInputDTO, DuckInputDTO> = async (
	req,
	res
) => {
	const { name, imgUrl, quote, owner } = req.body;

	const newDuck = await Duck.create<DuckInputDTO>({
		name,
		imgUrl,
		quote,
		owner
	});

	res.json({ message: 'New duck added!' });
};
```

- Now TS complains about the message, but it will also complain if we try to type it with our input type

```ts
const createDuck: RequestHandler<{}, DuckInputDTO, DuckInputDTO> = async (
	req,
	res
) => {
	const { name, imgUrl, quote, owner } = req.body;

	const newDuck = await Duck.create<DuckInputDTO>({
		name,
		imgUrl,
		quote,
		owner
	});

	res.status(201).json(newDuck);
};
```

- What we need is a second type that reflects all of the additional properties added by MongoDB. To keep Zod as our single source of truth, let's make a second schema that has just data from the database

```ts
const dbEntrySchema = z.strictObject({
	_id: z.instanceof(Types.ObjectId),
	createdAt: z.date(),
	updatedAt: z.date(),
	__v: z.int().nonnegative()
});
```

- Zod has an `extend` method to let us combine schemas, but their documentation recommends using the spread operator
  - The only adjustment we need to make is that we get our owner input as a string, but it's of type ObjectId on the actual duck

```ts
const duckSchema = z.object({
	...dbEntrySchema.shape,
	...duckInputSchema.shape,
	owner: z.instanceof(Types.ObjectId)
});

export { duckInputSchema, duckUpdateInputSchema, duckSchema };
```

- We create a type from it, and can use it to add type safety to the response body

```ts
type DuckDTO = z.infer<typeof duckSchema>;

const createDuck: RequestHandler<{}, DuckDTO, DuckInputDTO> = async (
	req,
	res
) => {
	const { name, imgUrl, quote, owner } = req.body;

	const newDuck = await Duck.create<DuckInputDTO>({
		name,
		imgUrl,
		quote,
		owner
	});

	res.status(201).json(newDuck);
};
```

- We can then also type the response for all of our controllers

```ts
import type { RequestHandler } from 'express';
import { Duck } from '#models';
import type { z } from 'zod/v4';
import type {
	duckInputSchema,
	duckUpdateInputSchema,
	duckSchema
} from '#schemas';

type DuckInputDTO = z.infer<typeof duckInputSchema>;

type UpdateDuckDTO = z.infer<typeof duckUpdateInputSchema>;

type DuckDTO = z.infer<typeof duckSchema>;

const getAllDucks: RequestHandler<{}, DuckDTO[]> = async (req, res) => {
	const ducks = await Duck.find().lean();

	res.json(ducks);
};
const createDuck: RequestHandler<{}, DuckDTO, DuckInputDTO> = async (
	req,
	res
) => {
	const { name, imgUrl, quote, owner } = req.body;

	const newDuck = await Duck.create<DuckInputDTO>({
		name,
		imgUrl,
		quote,
		owner
	});

	res.status(201).json(newDuck);
};
const getDuckById: RequestHandler<{ id: string }, DuckDTO> = async (
	req,
	res
) => {
	const { id } = req.params;

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	res.json(duck);
};
const updateDuck: RequestHandler<
	{ id: string },
	DuckDTO,
	UpdateDuckDTO
> = async (req, res) => {
	const { name, imgUrl, quote } = req.body;
	const { id } = req.params;
	const { userId } = req;

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	// console.log(duck.owner);
	if (userId !== duck.owner.toString())
		throw new Error('You are not authorized to update this duck', {
			cause: 403
		});

	duck.name = name;
	duck.imgUrl = imgUrl;
	duck.quote = quote;

	await duck.save();
	res.json(duck);
};
const deleteDuck: RequestHandler<{ id: string }, { message: string }> = async (
	req,
	res
) => {
	const { id } = req.params;

	const found = await Duck.findByIdAndDelete(id);

	if (!found) throw new Error('Duck Not Found', { cause: 404 });

	res.json({ message: 'Duck deleted' });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

- Note that we aren't validating the response body with Zod, we're just using it as our single source of truth for our types. You could technically also derive types using Mongoose, but we found Zod made for a nice DX. Typing the response body isn't doing a runtime validation, but rather leaning into TS's type safety features to help us write code that clearly expresses our intentions, and warns us if the code we wrote doesn't match that intention
