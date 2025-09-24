# Middleware

## Application Middleware

- This middleware will run on every request.
- So if we implement the timestamps logs middleware
  - Looks like a request handler, just add third arg `next`
  - Make sure to call `next` or it won't get passed along and will be left hanging

```js
app.use((req, res, next) => {
	console.log('Time:', Date.now());
	next();
});
```

- Now for any request made, here's our timestamp (it's in seconds since 1970, since that's how computers work)

## Route level middleware

- Since routers work like mini `apps`, we can also specify a middleware for just duck or just user routes

- For a duck only middleware

```ts
const duckMiddleware: RequestHandler = (req, res, next) => {
	console.log('I only appear on the duck routes!');
	next();
};

duckRouter.use(duckMiddleware);
```

### Request specific middleware

- We can also have middleware run on specific methods of specific routes only, but listing the functions separated by commas

```js
const validateDuck = (req, res, next) => {
	// body validation logic here...
	console.log('Validation passed!');
	next();
};

duckRouter.use(duckMiddleware);

duckRouter.route('/').get(getAllDucks).post(validateDuck, createDuck);
```

- We can add as many middlewares as we like/need, as long as we always call `next`

## Built in middleware

- You may have noticed by now we've actually been using middleware already
- Express has several built in middleware, our `app.use(express.json())` is application level middleware that processes the incoming request, and adds the `body` property that we rely on

- There are also several third-party libraries that provide useful middleware for us to work with

## Adding properties to the request object

- A very useful feature of middleware is the ability to add properties to the request object
- Just as the `express.json()` middleware adds the `body` property, we can add our own
- We've seen that an auth flow can include a token from the front-end. Say we want to decrypt that token, and add the userid of whoever it belongs to once it has been verified. We could to that with middleware
  - But for now we'll just hard code it
  - TS will complain but we'll get to that in a moment

```ts
const verifyToken: RequestHandler = (req, res, next) => {
	// token verification logic here...
	req.userId = '68b046de0f7e46123b038d5b';
	next();
};
```

- We can add this middleware to authenticate if a user is the owner of a duck before they are allowed to update it

```js
 .put(verifyToken, updateDuck)
```

- We can destructure the `userId` that we added

```ts
const { userId } = req;

console.log(userId);
```

- Then in update duck we compare the id of the signed in user to the duck's owner, and return a `403` error, that they are forbidden from this action if they don't match
  - Because the owner is an ObjectId, we have to convert it into a string to compare
- This means we'll need to break up our update into 2 parts

```ts
const updateDuck: RequestHandler<{ id: string }, {}, UpdateDuckType> = async (
	req,
	res
) => {
	try {
		if (!req.body)
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });
		const { name, imgUrl, quote } = req.body;
		const { id } = req.params;
		const { userId } = req;

		console.log(userId);

		if (!name || !imgUrl || !quote) {
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });
		}

		if (!isValidObjectId(id))
			return res.status(400).json({ error: 'Invalid ID' });

		const duck = await Duck.findById(id);

		if (!duck) return res.status(404).json({ error: 'Duck Not Found' });
		console.log(duck.owner);
		if (userId !== duck.owner.toString())
			return res
				.status(403)
				.json({ error: 'You are not authorized to update this duck' });

		duck.name = name;
		duck.imgUrl = imgUrl;
		duck.quote = quote;

		await duck.save();
		res.json(duck);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
```

### Telling TS about this new property

- Now this technically works and we don't get any runtime errors. But TS is still complaining at us. This is because in their type declarations, Express has the `Request interface`, and it doesn't have this custom property that we've added. So to let TS know what's going on, we'll use declaration merging

- First we make a new `types` folder in `src`
- Inside of `types` we make a folder for `express` and an `index.d.ts` file. As stated in the LMS, this file only has types, and no actual JS code will come from it
- Here we are entering the Express namespace, and adding an optional property

```ts
declare global {
	namespace Express {
		export interface Request {
			userId?: string;
		}
	}
}
// This empty export makes the file a module, allowing declare global to work properly
export {};
```

- Now we've updated the Request interface from Express to include our custom property. There are technically other ways of doing this, but after some long talks and research we decided on this technique

# Error handling

- A perfect use case for middleware is to have our own custom error handling. Let's start though by looking at Express's built in error handling behaviour

## Express built-in error handler

- Express gives us back an HTML response by default, for our RESTful API we want a JSON response
  - show invalid route in Postman
  - show invalid method

## Create custom error handler

- Just like in starter repo, we'll create a `middleware` folder
  `middleware/errorHandler.ts`
- Add it to imports in `package.json`
- An error handler is a special type of middleware that has an `error` as the first parameter
  - When an error is thrown without a catch block, it gets handled by Express

```js
import { type ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	process.env.NODE_ENV !== 'development' &&
		console.error(`\x1b[31m${err.stack}\x1b[0m`);
	res.status(500).json({ message: err.message });
};

export default errorHandler;
```

- Re-export

```ts
export { default as errorHandler } from './errorHandler.ts';
```

- Because order matters, we put the error handler after all of our routes
  - Having it before any route, means that for that route our custom error handler wouldn't be used

```ts
import express from 'express';
import '#db';
import { duckRouter, userRouter } from '#routers';
import { errorHandler } from '#middleware';

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
	console.log('Time:', Date.now());
	next();
});

app.use('/ducks', duckRouter);
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
```

- Now if we throw an error anywhere in our application. it will get handled by our custom `errorHandler`

### Getting rid of the try/catch blocks

- Since Express is handling our errors, we no longer need try/catch blocks, just to throw an error when something goes wrong
- This simplifies our code quite a bit
- Remove try/catch blocks from duck and user controllers

### Adding a cause to a thrown error

- Now errors thrown during DB operations will be handled by our custom error handler, but we have a bunch of early returns where we are currently handling other potential errors
- Instead of returning, we can throw an error, and add a `cause` to indicate the appropriate status code. Here the number is given directly, but in all future examples, it comes as an object with a `status` property, so let's already use it in that way for consistency.

### Adding type safety and cause as status

- We should first update our errorHandler to get the status code from the cause

```ts
res.status(err.cause?.status || 500).json({ message: err.message });
```

- TS isn't complaining since the error is of type `any`, but let's do some more robust type checks to ensure our error handler doesn't accidentally crash our application with it's own runtime error

```ts
import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	process.env.NODE_ENV !== 'production' &&
		console.error(`\x1b[31m${err.stack}\x1b[0m`);
	if (err instanceof Error) {
		if (err.cause) {
			const cause = err.cause as { status: number };
			res.status(cause.status).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: err.message });
		return;
	}
	res.status(500).json({ message: 'Internal server error' });
	return;
};

export default errorHandler;
```

### Update controllers

- Then update our duck controllers

```ts
import type { RequestHandler } from 'express';
import { isValidObjectId, type ObjectId } from 'mongoose';
import { Duck } from '#models';

type DuckType = {
	name: string;
	imgUrl: string;
	quote: string;
	owner: string;
};

type UpdateDuckType = Omit<DuckType, 'owner'>;

const getAllDucks: RequestHandler = async (req, res) => {
	const ducks = await Duck.find();

	res.json(ducks);
};
const createDuck: RequestHandler<{}, {}, DuckType> = async (req, res) => {
	if (!req.body)
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});

	const { name, imgUrl, quote, owner } = req.body;

	if (!name || !imgUrl || !quote || !owner) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}

	const newDuck = await Duck.create<DuckType>({ name, imgUrl, quote, owner });

	res.json(newDuck);
};
const getDuckById: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	res.json(duck);
};
const updateDuck: RequestHandler<{ id: string }, {}, UpdateDuckType> = async (
	req,
	res
) => {
	if (!req.body) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}
	const { name, imgUrl, quote } = req.body;
	const { id } = req.params;
	const { userId } = req;

	// console.log(userId);

	if (!name || !imgUrl || !quote) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

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
	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const found = await Duck.findByIdAndDelete(id);

	if (!found) throw new Error('Duck Not Found', { cause: 404 });

	res.json({ message: 'Duck deleted' });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

- Same in our `user` controllers

```js
import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { User } from '#models';

type UserType = {
	firstName: string,
	lastName: string,
	email: string
};

const getAllUsers: RequestHandler = async (req, res) => {
	const users = await User.find();

	res.json(users);
};
const createUser: RequestHandler<{}, {}, UserType> = async (req, res) => {
	if (!req.body)
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});

	const { firstName, lastName, email } = req.body;

	if (!firstName || !lastName || !email) {
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	}

	const newUser =
		(await User.create) < UserType > { firstName, lastName, email };

	res.json(newUser);
};
const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const user = await User.findById(id);

	if (!user) throw new Error('User Not Found', { cause: 404 });

	res.json(user);
};
const updateUser: RequestHandler<{ id: string }, {}, UserType> = async (
	req,
	res
) => {
	if (!req.body)
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	const { firstName, lastName, email } = req.body;
	const { id } = req.params;

	if (!firstName || !lastName || !email) {
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	}

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const user =
		(await User.findByIdAndUpdate) <
		UserType >
		(id,
		{
			firstName,
			lastName,
			email
		},
		{ new: true });

	if (!user) throw new Error('User Not Found', { cause: 404 });

	res.json(user);
};
const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const found = await User.findByIdAndDelete(id);

	if (!found) throw new Error('User Not Found', { cause: 404 });

	res.json({ message: 'User deleted' });
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
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

#### For the error handling exercise, just refactor to use the same error handling middleware from the lecture example. Remove try/catch blocks and early returns, then test all of your endpoints. Creating the file etc requires working with the filesystem, and can be fun exercise, but not something we'll be working with outside of that. I'll share some resources to help with it, for those who would like the challenge, and will post a full solution in addition to the correction
