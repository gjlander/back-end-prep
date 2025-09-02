# Middleware

## Application Middleware - come from slide 7

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

- A little hard to see among the SQL query logs, but there's our timestamp (it's in seconds since 1970, since that's how computers work)

## Router level middleware

- Since routers work like mini `apps`, we can also specify a middleware for just duck or just user routes
- For a duck only middleware

```js
const duckMiddleware = (req, res, next) => {
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

### Back to slide 8

## Adding properties to the request object

- A very useful feature of middleware is the ability to add properties to the request object
- Just as the `express.json()` middleware adds the `body` property, we can add our own
- We've seen that an auth flow can include a token from the front-end. Say we want to decrypt that token, and add the userid of whoever it belongs to once it has been verified. We could to that with middleware
  - But for now we'll just hard code it

```js
const verifyToken = (req, res, next) => {
	// token verification logic here...
	req.userId = 1;
	next();
};
```

- We can add this middleware to authenticate if a user is the owner of a duck before they are allowed to update it

```js
 .put(verifyToken, updateDuck)
```

- Then in update duck we compare the id of the signed in user to the duck's owner, and return a `403` error, that they are forbidden from this action

```js
const updateDuck = async (req, res) => {
	try {
		const { userId } = req;
		const { id } = req.params;
		const { name, imgUrl, quote } = req.body;

		console.log('userId', userId);

		if (!name || !imgUrl || !quote)
			return res.status(400).json({ error: 'Missing required fields' });

		const duck = await Duck.findByPk(id, { include: User });

		if (!duck) return res.status(404).json({ error: 'Duck not found' });

		if (userId !== duck.user.id)
			return res
				.status(403)
				.json({ error: 'You are not authorized to update this duck' });

		await duck.update({ name, imgUrl, quote });
		res.json(duck);
	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message || 'Internal server error.'
		});
	}
};
```

### From here read about error handling and body validation, and on Monday we'll have a part 2 where we look at implementing those for the exercise
