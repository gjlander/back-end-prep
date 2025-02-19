# Intro to Node

## Topics to cover

-   Refresh Node concepts from earlier
-   CommonJS vs ES6 modules
-   Node modules
    -   fs - sync and promises
        -   read and write files
    -   http

## Running Scripts with Node

-   You were introduced to Node with the CLI games, but that was a while ago, so let's do a quick refresher
-   To run a node program, if you're in the correct directory in the terminal simply run `node <file_name>`
-   Our most basic example is in `hello.js` -> run `node hello.js`

## Capturing input

-   Let's rebuild the `sum.js` example from way back when
-   To add user input, we add them to the end of the command
-   Then we can access them via the process.argv array
    -   index 0 is always a path to where `node` is installed
    -   index 1 is always a path to the file executing the command
    -   Anything after that is user input

```js
console.log(process.argv);
```

-   Because the first 2 indexes are constant, we can slice them away to just get the user input

```js
const args = process.argv.slice(2);
```

-   We will want 2 numbers when this program runs, so we can validate and check if the user gave 2 inputs

```js
if (args.length !== 2) {
    console.error('Please provide exactly two numbers!');
    return;
}
```

-   Since input always comes as a string, to do math, we have to coerce it into a number

```js
const num1 = parseFloat(args[0]);
const num2 = parseFloat(args[1]);
```

-   And then validate that the input is actually numbers

```js
if (isNaN(num1) || isNaN(num2)) {
    console.error('Both arguments must be numbers!');
    return;
}
```

-   Finally we can run the actual logic

```js
const sum = num1 + num2;
```

-   Then print it to the console
    -   remember the 'console' for node (and backend in general) is the terminal

```js
console.log(`The sum of ${num1} and ${num2} is ${sum}`);
return;
```

## Node Modules

-   Just like we had modules for browser JavaScript, we can also use modules for Node
-   Node has been around since before our familiar ES6 modules, and had it's own solutions, with CommonJS modules
-   By default, node uses CommonJS syntax

### CommonJS Modules

-   Let's add some more operations and have more complete calculator, but each operation is a separate module
-   Let's create a few new files `math.js`, `difference.js`
-   `sum.js`
    -   Move our validation into `math.js` and just have a function to add that returns our message output
    -   To export with CommonJS syntax

```js
const add = (num1, num2) => {
    const sum = num1 + num2;
    return `The sum of ${num1} and ${num2} is ${sum}`;
};

module.exports = { add };
```

-   Let's do the same for difference

```js
const difference = (num1, num2) => {
    const difference = num1 - num2;
    return `The difference of ${num1} and ${num2} is ${difference}`;
};

module.exports = { subtract };
```

-   Back in `math.js` to import we use this weird looking `require` function
-   Note that for ES6, we need the file extension. For CommonJS we don't

```js
const { add } = require('./sum');
const { subtract } = require('./difference');
```

-   Update our validation to check for three arguments

```js
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Please provide exactly two numbers and an operation!');
    return;
}
```

-   Put the operation in between, like it would be in an actual math operation

```js
const num1 = parseFloat(args[0]);
const op = args[1];
const num2 = parseFloat(args[2]);
```

-   And add a validation check for our operation

```js
if (op !== '+' && op !== '-') {
    console.error('Use + to add, or - to subtract');
    return;
}
```

-   Finally we get to our logic

```js
let msg = '';
if (op === '+') {
    msg = add(num1, num2);
} else {
    msg = subtract(num1, num2);
}
console.log(msg);
return;
```

-   Now we run our program and it works!

### ES6 Modules

-   You may see this CommonJS syntax sometimes in documentation, so I wanted to cover it, but from here on out, we'll continue to use ES6 modules, as it has become the standard
-   Now, if we update everything to use ES6 syntax...
-   We get this `Illegal return statement` error
-   It turns out, ES6 modules only allow for a `return` inside of a function, so we can use `process.exit(1)` to end the program early
    -   Search/replace `return` with `process.exit(1)`
-   Now everything works!

### Explicitly defining Module syntax

-   Newer versions are smart enough to detect ES6 syntax, and automatically change your files to ES6 modules, but best practice is explicitly state your module type in one of 2 ways
    1. (Preferred) If you have a `package.json` you can add a line `"type": "module";`
    2. If you don't have a `package.json`, or need a single file to differ from the `type`, so can state it in the file extension `.mjs` or `.cjs`
-

## Node Environment

-   Running JS in the browser, we had access to Web APIs such as the DOM, Web Storage, and Fetch
-   In Node, we no longer have access to these APIs (though since v21 Node does have it's own Fetch API). But we do now have access to several Node APIs, accessible via built-in modules
-   As mentioned in the article, some we might interact with more often are
    -   fs: For file system operations.
    -   http: For creating HTTP servers and making HTTP requests. (this will be our main one we work with)
    -   path: For handling and transforming file paths.
    -   os: For accessing operating system-related utility methods and properties.

## http module

-   The exercise today/tomorrow will focus on the `fs` module, but I want to very quickly introduce the `http` module
-   If we break down the example in the lecture article...
-   First we have to import the http object from the `http` module

```js
import http from 'http';
```

-   If we log it, we can see that it's an object with a bunch of different properties, including a method called `createServer`

```js
console.log(http);
```

-   As the name implies, we can use this to create a server
-   The server takes a callback function as an argument
-   This callback function takes 2 arguments
    1. the request object, shortened to req by convention
    2. the response object, shortened to res by convention
-   We'll dive into this structure into more detail in the coming days

```js
const server = http.createServer((req, res) => {});
```

-   This `res` is the actual response object that we get back from the fetch API on the frontend
-   We can update different properties on it, such as the status code

```js
res.statusCode = 200;
```

-   And we can add headers
    -   With our RESTful APIs we'll be returning JSON, but we can also respond with HTML

```js
res.setHeader('Content-Type', 'text/html');
```

-   And then we can set what actually comes back in the response.
-   In this case, as simple HTML page

```js
res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Document</title>
    </head>
    <body>
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center">Here's a dog!</h1>
        <p class="text-center">This code came from a Node-powered server!</p>
        <img src="https://placedog.net/500/280" alt="Dog" class="mx-auto mt-4">
      </div>
    </body>
    </html>
    `);
```

-   Then to use it, we need a port, just as the Events API server, the OpenAI proxy server, or the development server for Vite projects

```js
const port = 3000;
```

-   Finally we tell it to listen, and can add a message to the console to confirm success

```js
server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}/`)
);
```

-   Now if we rune `node server.mjs` is starts up our server on port 3000!
-   And if we follow the link, we can see the webpage

### Shipping out fully formed HTML is what's known as server-side rendering.

-   Your Vanilla projects deployed on GitHub pages operate on a similar principle
-   React is based on client-side rendering, no actual HTML is shipped out, and then everything is rendered on the client
    -   Though new updates in React support SSR, and it's starting to make a comeback. With meta-frameworks like Next.js allowing for a mix of CSR and SSR
-   You'll dive into the http module in much more detail in the coming days, but for today, let's focus on...

## fs module

-   We've got three flavours

### Synchronous

-   As the name implies, this will create synchronous code. Your code will wait until the file is written to execute the next line
