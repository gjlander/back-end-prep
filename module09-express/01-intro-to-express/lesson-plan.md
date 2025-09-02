# Intro to Express

# Getting started with Express.js

- Starting with our setup from the HTTP module lecture
- need to install express and it's types

  - `npm i express && npm i -D @types/express`

- Let's clear out `app.ts` and start fresh

```js
import express from 'express';
```

- Declare our `app` and `port`

```js
const app = express();
const port = 3000;
```

- Define a route by using the HTTP method names. The first argument is the path (for root/index we just use `/`)
- The second argument is our route handler, often called a controller by convention
- Express adds methods to the response object, so if we just`res.send` it will set the status to 200 and content header to `text`

```js
app.get('/', (req, res) => res.send('Hello, World!'));
```

- We use the `listen` method to get our server running, just as with vanilla node

```js
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
```

- Make Postman request to demo it works

  - Express even has default error handling behavior where it will send an HTML response

- This basic boilerplate will be used over and over again for each express app

#### Let's compare it to vanilla Node.js

# Dynamic Routes

- Using the lecture demo, now our `posts` endpoint will return the posts
- We can use `res.json` method to stringify our response and add JSON headers

```js
const posts = [
	{ id: 1, title: 'Post 1' },
	{ id: 2, title: 'Post 2' },
	{ id: 3, title: 'Post 3' }
]; // Simple array to represent data
app.get('/', (req, res) => res.send('Hello, World!'));

app.get('/posts', (req, res) => res.json(posts));
```

- Just like with React Router, we can have dynamic routes with Express. No more Regex matching! The syntax even looks the same as React Router, you add `:` to indicate it's dynamic, and then that placeholder becomes the property name

- Also like React Router, this will always be a string, so we need to coerce it into a number first

```js
app.get('/posts/:id', (req, res) => {
	const post = posts.find(post => post.id === parseInt(req.params.id));
	if (!post) return res.status(404).json({ message: 'Post not found' });
	return res.json(post);
});
```

# CRUD Operations

- Starting from the skeleton, let's refactor our RESTful API using express

```js
import express from 'express';

const app = express();
const port = 3000;

app.get('/posts', (req, res) => res.json({ message: 'GET all posts' }));
app.post('/posts', (req, res) => res.json({ message: 'POST a new post' }));
app.get('/posts/:id', (req, res) => res.json({ message: 'GET a post by id' }));
app.put('/posts/:id', (req, res) => res.json({ message: 'PUT a post by id' }));
app.delete('/posts/:id', (req, res) =>
	res.json({ message: 'DELETE a post by id' })
);

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

- If we `Ctrl + h` we can search and replace `posts` with `ducks`

## Database setup

- import our DB file and our models again

```ts
import '#db';
import { Duck, User } from '#models';
```

### Get all ducks

- Search and replace `posts` with `ducks`
- Make our controller async, and wrap it in a try catch
- We'll go into more detail on error handling later this week, but for now let's handle it like we did with vanilla Node - a json response with the error message.
  - Since we want an error status, we have to manually set it, but that's easy in express

```ts
app.get('/ducks', async (req, res) => {
	try {
		res.json({ message: 'GET all ducks' });
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
});
```

- Now let's actually get some ducks back, instead of our placeholder message

```js
app.get('/ducks', async (req, res) => {
	try {
		const ducks = await Duck.find();

		res.json(ducks);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
});
```

#### Project organization - controllers folder

- Getting all ducks isn't too long of a function, but some of the others get longer. To make this more readable as our app grows, instead of keeping this as an anonymous function, let's move all of our controllers into a separate folder, then import them
- Make `controllers/ducks.ts`
  - add to imports in `package.json`
  - import Duck model here
  - give controller a name
  - type it as RequestHandler
  - re-export it

```js
import type { RequestHandler } from 'express';
import { Duck } from '#models';

const getAllDucks: RequestHandler = async (req, res) => {
	try {
		const ducks = await Duck.find();

		res.json(ducks);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};

export { getAllDucks };
```

- import it in `app.ts`
- Functionally this is exactly the same, but now if we add more resources they can be organize by file, making our app easier to maintain as it grows
- Using our `getAllDucks` function as a boilerplate, let's export/import our controllers so we can stay in this file

```js
export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

- Right now all of our endpoints just fetch ducks, but that's a solid starting point

```js
import express from 'express';
import {
	getAllDucks,
	createDuck,
	getDuckById,
	updateDuck,
	deleteDuck
} from './controllers/wildDucks.js';

const app = express();
const port = 3000;

app.get('/ducks', getAllDucks);
app.post('/ducks', createDuck);

app.get('/ducks/:id', getDuckById);
app.put('/ducks/:id', updateDuck);
app.delete('/ducks/:id', deleteDuck);

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

### Create duck

- Because the body of a request could in theory contain all kinds of data types, we have to tell our app that we are always expecting JSON. Once we do, express adds a `body` property to the request object that lets us access that data
  - Order matters, this needs to be above all of the individual routes
  - Note that this is for the `request` body, we still have to set if the `response` will be JSON

```js
app.use(express.json());
```

- Now express will handle processing the JSON body, and add it as a `body` property. If there is not body in the request, it will be `undefined`
  - test in Postman with and without body

```ts
const createDuck: RequestHandler = async (req, res) => {
	try {
		console.log(req.body);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
```

#### Typing a RequestHandler generic

- The `RequestHandler` type is actually a generic function type. The generic takes in 4 types in this order
  - Params: this would be the dynamic part of a route
  - ResBody: the type of your response, defaults to `any`
  - ReqBody: the type of the request, defaults to `any`
  - Queries: any queries included in the URL
- Since we know the body should include our duck properties, we can make a type, and pass it to the `ReqBody` parameter

```ts
type DuckType = {
	name: string;
	imgUrl: string;
	quote: string;
	owner: string;
};

const createDuck: RequestHandler<{}, {}, DuckType> = async (req, res) => {};
```

#### Validation checks

- This is still just us telling TS, "Hey trust me bro", but it's a start
- We'll go into more thorough validation checks later, but for now let's just confirm the needed properties exists and do an early return
- First things first, check if there is a `body`
  - 400 means user client error
  - We are returning `void`, but can use the return keyword to stop the function from continuing

```js
if (!req.body)
	return res
		.status(400)
		.json({ error: 'Name, image URL, owner, and quote are required' });
```

- We then verify all of the required properties are there

```ts
if (!name || !imgUrl || !quote || !owner) {
	return res
		.status(400)
		.json({ error: 'Name, image URL, owner, and quote are required' });
}
```

- From here, we can call create, and still pass our `DuckType`

```ts
const newDuck = await Duck.create<DuckType>({ name, imgUrl, quote, owner });

res.json(newDuck);
```

### Get duck by id

- The request object also has a `params` property (short for parameters). Since we have an `id`, we can type that in our generic

```js
const { id } = req.params;
```

- Mongoose has a helpful utility function to test if a string is a valid object id, so let's use it to validate the id here

```ts
if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });
```

- Again, we'll do more robust error handling later, but we can do another early return if no duck is found

```ts
const duck = await Duck.findById(id);

if (!duck) return res.status(404).json({ error: 'Duck Not Found' });

res.json(duck);
```

### Update duck

- For updating a duck, we'll need the body and params, se we type them in our generic

```ts
const updateDuck: RequestHandler<{ id: string }, {}, DuckType> = async (
	req,
	res
) => {};
```

- We validate the body and the id
- Since the owner isn't an updatable property, we remove it

```ts
if (!req.body)
	return res
		.status(400)
		.json({ error: 'Name, image URL, owner, and quote are required' });
const { name, imgUrl, quote } = req.body;
const { id } = req.params;

if (!name || !imgUrl || !quote) {
	return res
		.status(400)
		.json({ error: 'Name, image URL, and quote are required' });
}

if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });
```

- Update our query, and response, and add validation check

```ts
const duck = (await Duck.findByIdAndUpdate)<DuckType>(
	id,
	{
		name,
		imgUrl,
		quote
	},
	{ new: true }
);

if (!duck) return res.status(404).json({ error: 'Duck Not Found' });

res.json(duck);
```

### Delete Duck

- Since our query doesn't return anything, we don't need to store the results in a variable
- Just give a success message

```js
const { id } = req.params;
if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

const found = await Duck.findByIdAndDelete(id);

if (!found) return res.status(404).json({ error: 'Duck Not Found' });

res.json({ message: 'Duck deleted' });
```

## `app.ts` cleanup - using `.route()`

- We could stop here, but there's one more improvement we can make to our code organization.
- Since we have several methods that go to the same route, we're currently copy/pasting the route. Hopefully you're anti-copy/paste instincts are kicking in
- To prevent that, we can use the `route` method to define the route, and then just add the methods, like so

```js
app.route('/ducks').get(getAllDucks).post(createDuck);

app.route('/ducks/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);
```

#### We'll continue to expand on working with Express in the coming weeks, but this is enough to have a basic RESTful API with the same functionality we had in our vanilla Node version. So now your task is to refactor your first RESTful API using Express
