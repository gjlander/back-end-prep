# HTTP Module Walkthrough

## Creating a simple HTTP Server

-   Make request in Postman
-   Note the `console.logs`
-   Go through bullets in breakdown
-   What does 200 status mean?
-   How have we interacted with headers already?
-   Make `GET` request in Browser and show network tab in dev tools

## Handling Different HTTP Methods

-   Older versions of node needed nodemon, may still see in some tutorials
-   The scripts are the same principle as with React, it gives us something short an easy to remember, but is the same effect as typing the string for that script

### The code

-   Instead of anonymous function, storing in variable. It's about to get long, so good to have it in a variable
-   `method` and `url` are properties on the request object. We could dot notate, or deconstruct to access them
-   Make a few requests in Postman and show the logs
-   Because we never send a response, the request just stays open, we have to manually cancel it

### Only allowing specific paths and methods

-   Since we can access the path the request is sent to, and the method, we can use that to only allow requests to specific paths, and only allow specific methods

#### Regex

-   This is what's known as a regular expression (regex for short). It allows for complex pattern matching in strings, and looks very mystical. All you need to know, is this means that the start of the string is `posts/`, then can be following by any alpha-numeric character

```js
const singlePostRegex = /^\/posts\/[0-9a-zA-Z]+$/; // Simple expression to match the pattern /posts/anything
```

### invalid request

-   To start, let's just have our catchall log for invalid requests

```js
return console.log('Invalid request');
```

#### `/posts`

-   Now we want to allow things to happen on the `/posts` endpoint, so we use an if statement to match it, and use an early return to prevent the rest of the function from running

```js
if (url === '/posts') {
    return console.log('Invalid method');
}
```

-   Then we add logic for the methods we want to handle

```js
if (method === 'GET') {
    return console.log('GET request on /posts');
}
if (method === 'POST') {
    return console.log('POST request on /posts');
}
```

#### `/posts/:id`

-   Now for the individual posts endpoint, we use the Regex to check if the path starts with `/posts/` then has something after it (in real life, this would be the id)

```js
if (singlePostRegex.test(url)) {
    if (method === 'GET') {
        return console.log(`GET request on ${url}`);
    }
    if (method === 'PUT') {
        return console.log(`PUT request on ${url}`);
    }
    if (method === 'DELETE') {
        return console.log(`DELETE request on ${url}`);
    }
    return console.log('Invalid method');
}
```

-   This is our basic boilerplate to then add logic to. We're still not sending a response, but we have control over the paths/methods we want to use, and a default for invalid requests

### Adding actual logic

-   In our next lecture we'll look at connecting to an actual database, but for demonstration purposes, today we'll just use an array. This means if we stop the server, it resets to the value of our variable
-   `/posts` GET isn't so bad, we just
    -   set the status code to 200,
    -   set the header to `application/json` since we're now sending a JSON response (this is what we'll usually be doing)
    -   end with a response, where we stringify the posts

```js
if (method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(posts));
}
```

-   POST requests get a little more complicated, first we have to handle the actual response. It comes to us in a readable stream, which we'll talk more about when we get into the AI content

```js
let body = '';
// The body of the request is received in chunks
req.on('data', (chunk) => {
    body += chunk.toString();
});
```

-   The last chunk will indicate it's the end, so once we have the end, we
    -   Store the new post in an object, and give it an id. We have to parse it, since it's still in JSON
    -   Add the new post to our array
    -   Set status code to `201` to indicate a new resource was successfully created
    -   set the header to JSON
    -   End the response with the new post

```js
if (method === 'POST') {
    let body = '';
    // The body of the request is received in chunks
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    // Once all the data is collected
    req.on('end', () => {
        const newPost = { id: crypto.randomUUID(), ...JSON.parse(body) };
        posts.push(newPost);
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(newPost));
    });
}
```

### Now, because this is a pain, we'll only be working with the vanilla HTTP module for 2 days. It's good to have a basic understanding of the vanilla tools before adding a layer of abstraction with a library, but don't feel like you need to do a deep dive on this. Understand enough to be able to work with it and complete the exercises.
