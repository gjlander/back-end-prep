# Basic setup - slide 6

- Let's initialize an npm project `npm init -y`
  - Change type to `module`
  - install express `npm i express `
  - Add scripts `"dev": "node --watch index.js", "start": "node index.js"`
- Import express

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

#### Back to slide 7

# Dynamic Routes - slide 8

- Using the lecture demo, now our `posts` endpoint will return the posts

```js
//imports and variable declaration...
const posts = [
  { id: 1, title: 'Post 1' },
  { id: 2, title: 'Post 2' },
  { id: 3, title: 'Post 3' }
];
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

- Starting from the skeleton, let's make a simple API for our Ducks database that we made during SQL week

```js
import express from 'express';

const app = express();
const port = 3000;

app.get('/posts', (req, res) => res.json({ message: 'GET all posts' }));
app.post('/posts', (req, res) => res.json({ message: 'POST a new post' }));
app.get('/posts/:id', (req, res) => res.json({ message: 'GET a post by id' }));
app.put('/posts/:id', (req, res) => res.json({ message: 'PUT a post by id' }));
app.delete('/posts/:id', (req, res) => res.json({ message: 'DELETE a post by id' }));

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

- If we `Ctrl + h` we can search and replace `posts` with `wild-ducks`

## Database setup

- Install dependencies `npm i pg dotenv`
- Create our `.env` file and add our database connection string
- Update our `package.json` to access our env variable `"dev": "node -r dotenv/config --watch index.js",`
- For connecting to the database, we'll use a slightly more advanced method of connecting, and create a separate folder for db
- Make `db/index.js`
  - Remember `index` is just a convention for naming the main js file of a folder
  - Instead of using `Client` from pg, we'll use `Pool`. This saves us from manually have to connect, and end the connection with each query
  - Then we export it so we can use it as needed in our application

```js
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PG_URI });

export default pool;
```

### Get all ducks

- Firs import our pool

```js
import pool from './db/index.js';
```

- Make our controller async, and wrap it in a try catch
- We'll go into more detail on error handling later this week, but for now let's handle it like we did with vanilla Node - a json response with the error message.
  - Since we want an error status, we have to manually set it, but that's easy in express

```js
app.get('/wild-ducks', async (req, res) => {
  try {
    res.json({ message: 'GET all wild-ducks' });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Internal server error.'
    });
  }
});
```

- Now let's actually get some ducks back, instead of our placeholder message

```js
app.get('/wild-ducks', async (req, res) => {
  try {
    const results = await pool.query('SELECT * from wild_ducks;');
    res.json(results.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || 'Internal server error.'
    });
  }
});
```

- Since we're only interested in the `rows` property, we can also just deconstruct it instead of dot notating

```js
app.get('/wild-ducks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * from wild_ducks;');
    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || 'Internal server error.'
    });
  }
});
```

#### Project organization - controllers folder

- Getting all ducks isn't too long of a function, but some of the others get longer. To make this more readable as our app grows, instead of keeping this as an anonymous function, let's move all of our controllers into a separate folder, then import them
- Make `controllers/wildDucks.js`
  - import pool here instead and correct path
  - give controller a name
  - export it

```js
import pool from '../db/index.js';

const getAllDucks = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * from wild_ducks;');
    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || 'Internal server error.'
    });
  }
};

export { getAllDucks };
```

- import it in `index.js`
- Functionally this is exactly the same, but now if we add more resources they can be organize by file, making our app easier to maintain as it grows
- Using our `getAllDucks` function as a boilerplate, let's export/import our controllers so we can stay in this file

```js
export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
```

- Right now all of our endpoints just fetch ducks, but that's a solid starting point

```js
import express from 'express';
import { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck } from './controllers/wildDucks.js';

const app = express();
const port = 3000;

app.get('/wild-ducks', getAllDucks);
app.post('/wild-ducks', createDuck);

app.get('/wild-ducks/:id', getDuckById);
app.put('/wild-ducks/:id', updateDuck);
app.delete('/wild-ducks/:id', deleteDuck);

app.listen(port, () => console.log(`Server is running on port ${port}`));
```

### Create duck

- Because the body of a request could in theory contain all kinds of data types, we have to tell our app that we are always expecting JSON. Once we do, express adds a `body` property to the request object that lets us access that data
  - Order matters, this needs to be above all of the individual routes
  - Note that this is for the `request` body, we still have to set if the `response` will be JSON

```js
app.use(express.json());
```

```js
const { name, imgUrl, quote } = req.body;
```

- We'll go into more thorough validation checks later this week, but for now let's just confirm the needed properties exists and do an early return
  - 400 means user client error
  - Since quote has a default value, it is not required and we don't need to check for it

```js
if (!name || !imgUrl) return res.status(400).json({ error: 'Missing required fields' });
```

- From here, we can write our SQL statement, store the results, and return the new duck, with a 201 status

```js
const results = await pool.query(`INSERT INTO wild_ducks (name, img_url, quote) VALUES ($1, $2, $3) RETURNING *`, [
  name,
  imgUrl,
  quote
]);
res.status(201).json(results.rows[0]);
```

- How could I rewrite this using destructuring syntax?

```js
const {
  rows: [newDuck]
} = await pool.query(`INSERT INTO wild_ducks (name, img_url, quote) VALUES ($1, $2, $3) RETURNING *`, [
  name,
  imgUrl,
  quote
]);
res.json(newDuck);
```

- Either syntax is fine, it's up to you which feels more readable

### Get duck by id

- The request object also has a `params` property (short for parameters). This is where the dynamic portion of a route will be found

```js
const { id } = req.params;
```

- Again, we'll do more robust error handling later, but we can do another early return if no duck is found

```js
const {
  rows: [duck]
} = await pool.query('SELECT * from wild_ducks WHERE id=$1;', [id]);

if (!duck) return res.status(404).json({ error: 'Duck not found' });

res.json(duck);
```

### Update duck

- For updating a duck, we'll need the body and params
  - We could also use nested destructuring, but personally I prefer the first way

```js
// const { id } = req.params;
// const { name, imgUrl, quote } = req.body;

const {
  param: { id },
  body: { name, imgUrl, quote }
} = req;
```

- Check for body content
  - This time we need all updatable properties

```js
if (!name || !imgUrl || !quote) return res.status(400).json({ error: 'Missing required fields' });
```

- Update our query, and response, and add validation check

```js
const {
  rows: [duck]
} = await pool.query('UPDATE wild_ducks SET name = $1, img_url = $2, quote = $3 WHERE id = $4 RETURNING *;', [
  name,
  imgUrl,
  quote,
  id
]);

if (!duck) return res.status(404).json({ error: 'Duck not found' });

res.json(duck);
```

### Delete Duck

- Since our query doesn't return anything, we don't need to store the results in a variable
- Just give a success message

```js
const { id } = req.params;

await pool.query('DELETE from wild_ducks WHERE id=$1;', [id]);

res.json({ message: `Duck deleted successfully` });
```

## `index.js` cleanup - using `.route()`

- We could stop here, but there's one more improvement we can make to our code organization.
- Since we have several methods that go to the same route, we're currently copy/pasting the route. Hopefully you're anti-copy/paste instincts are kicking in
- To prevent that, we can use the `route` method to define the route, and then just add the methods, like so

```js
app.route('/wild-ducks').get(getAllDucks).post(createDuck);

app.route('/wild-ducks/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);
```

#### We'll continue to expand on working with Express in the coming weeks, but this is enough to have a basic RESTful API with the same functionality we had in our vanilla Node version. So now your task is to refactor your first RESTful API using Express
