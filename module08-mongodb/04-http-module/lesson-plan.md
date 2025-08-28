# HTTP Module

# RESTful Architecture Article

- HATEOAS example: Star Wars API: https://swapi.tech/api/people

# Node: The HTTP Module

- Just as JS in the browser had access to Web APIs like the DOM and Web Storage, JS in the Node environment has access to APIs via modules that allow us work with
  - the file system to read/write files
  - the operating system of the computer it's running on
  - HTTP module, to create a server capable of handling HTTP requests
- Thus far, we've been running our DB queries with hard coded values, or via the CLI. With the HTTP module, we can now translate those queries as endpoints to a RESTful API

## Creating a simple HTTP Server

- We'll continue building off of our mongoose example, but comment out everything in `app.ts` for now
- Node has built-in module, so we have to import `http` from there

```ts
import http from 'node:http';
```

- We use the `createServer` method and pass it a RequestLister function as a parameter

```ts
const server = http.createServer(() => {});
```

- Request Listener functions take 2 parameters
  - Request object - what gets sent from the `fetch` request you make on the client
  - Response object - Yes! The same response object you get back from `fetch`
- These, by convention, are often shortened to `req` and `res`

```ts
const server = http.createServer((req, res) => {});
```

- In our request listener, we need to add things like the
  - status code
  - headers, with information about the body (or later potentially things like auth)
  - and then the actual body of the response

```ts
const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello, World!\\n');
});
```

- We also need to declare a port. A common default is 3000

```ts
const port = 3000;
```

- We then call the `listen` method on our server. This will keep the connection open, and keep it available to incoming HTTP requests
  - It takes an optional second argument, here we can log the port and make an easy clickable link, just like Vite did for us

```ts
server.listen(port, () =>
	console.log(`Server running at http://localhost:${port}/`)
);
```

- The terminal freezes, just like when running the frontend dev server with Vite. And now if we make a get request to our local host server in Chrome
- We see our message! Since this only works for GET requests, better to use Postman instead for testing

## Handling Different HTTP Methods

- Right now our server doesn't differentiate between different methods, or even different endpoints (show in Postman).
- The method used in the request is included in the request object, along with the URL the request was sent to (the path)
- We'll need to check the request object for the `method` and `url` properties, and then change our app's logic based of off them
- Since this is going to get bigger, we can extract our anonymous function, and store it in a variable

```ts
const requestHandler = (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello, World!\\n');
};
const server = http.createServer(requestHandler);
```

- Since we're defining our `requestHandler` outside of `createServer`, TS can't properly infer it anymore. So we can import the type from Node

```ts
import http, { type RequestListener } from 'node:http';

const requestHandler: RequestListener = (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello, World!\\n');
};
```

- From here we can destructure the method and URL
  - Note that logs are going to be in the terminal

```ts
const requestHandler: RequestListener = (req, res) => {
	const { method, url } = req;
	console.log(method, url);
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello, World!\\n');
};
```

- If we get rid of the `res` properties, our request gets left dangling and we have to manually cancel it (or eventually it would time out). This is because we're no longer actually sending any kind of response back anymore

```ts
const requestHandler: RequestListener = (req, res) => {
	const { method, url } = req;
	console.log(method, url);
};
```

### Only allowing specific paths and methods

- Since we can access the path the request is sent to, and the method, we can use that to only allow requests to specific paths, and only allow specific methods

### invalid request

- To start, let's just have our catchall log for invalid requests

```js
return console.log('Not Found');
```

#### `/posts`

- Now we want to allow things to happen on the `/posts` endpoint, so we use an if statement to match it, and use an early return to prevent the rest of the function from running

```js
if (url === '/posts') {
	return console.log('Method not allowed');
}
```

- Then we add logic for the methods we want to handle

```js
if (method === 'GET') {
	return console.log('GET request on /posts');
}
if (method === 'POST') {
	return console.log('POST request on /posts');
}
```

#### Sending a response

- Let's no longer leave our server hanging, and actually send a response. Since we want to always send back JSON in our response, we can write a utility function to help us out
- This utility function will take 3 args

```ts
import http, { type RequestListener, type ServerResponse } from 'node:http';

const createResponse = (
	res: ServerResponse,
	statusCode: number,
	message: unknown
) => {};
```

- We can use the `writeHead` method to set the status code, and tell that the body will be JSON

```ts
res.writeHead(statusCode, { 'Content-Type': 'application/json' });
```

- Then because the message could either be a string, or an object, an array of objects, etc. We check if it's a string, and turn it into JSON format, otherwise we just stringify

```ts
return res.end(
	typeof message === 'string'
		? JSON.stringify({ message })
		: JSON.stringify(message)
);
```

- Now instead of just logging, we can actually see a response

```ts
if (url === '/posts') {
	if (method === 'GET') {
		return createResponse(res, 200, 'GET request on /posts');
	}
	if (method === 'POST') {
		return createResponse(res, 201, 'POST request on /posts');
	}
	return createResponse(res, 405, 'Method Not Allowed');
}

return createResponse(res, 404, 'Not Found');
```

#### `/posts/:id`

#### Regex

- This is what's known as a regular expression (regex for short). It allows for complex pattern matching in strings, and looks very mystical. All you need to know, is this means that the start of the string is `posts/`, then can be following by any alpha-numeric character

```js
const singlePostRegex = /^\/posts\/[0-9a-zA-Z]+$/; // Simple expression to match the pattern /posts/anything
```

- Now for the individual posts endpoint, we use the Regex to check if the path starts with `/posts/` then has something after it (in real life, this would be the id)

```js
if (singlePostRegex.test(url!)) {
    if (method === 'GET') {
      return createResponse(res, 200, `GET request on ${url}`);
    }
    if (method === 'PUT') {
      return createResponse(res, 200, `PUT request on ${url}`);
    }
    if (method === 'DELETE') {
      return createResponse(res, 200, `DELETE request on ${url}`);
    }
    return createResponse(res, 405, 'Method Not Allowed');
  }
```

## Connecting to our DB

- The tutorial goes on to show how we can work with the request body using an in-memory Array, but we've already got a db connection here, so let's use it
- Search and Replace `posts` with `users` and uncomment imports

### GET all users

- Which of our db queries should we add to our GET request?
  - We'll need to make our `requestHandler` async

```ts
const users = await User.find();
console.log(users);
```

- Then we can pass that users array to `createResponse`

```ts
if (method === 'GET') {
	const users = await User.find();
	console.log(users);
	return createResponse(res, 200, users);
}
```

- We have our first API endpoint!
