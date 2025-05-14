# Sequelize

## Setup - slide 5

-   Add `user` routes

```js
app.route('/users')
    .get((req, res) => res.json({ message: 'GET /' }))
    .post((req, res) => res.json({ message: 'POST /' }));
app.route('/users/:id')
    .get((req, res) => res.json({ message: 'GET /:id' }))
    .put((req, res) => res.json({ message: 'PUT /:id' }))
    .delete((req, res) => res.json({ message: 'DELETE /:id' }));
```

-   Let's update our Express application to use Sequelize based on the tutorial, then make a new `Ducks` table where they have an owner
-   First we have to install it `npm i sequelize`
    -   We already have `pg` installed, so we're good to go there
-   Update `db/index.js` using the same connection string
    -   import `Sequelize`
    -   Create an instance of it
    -   export it
-   Same basic process we had with `pg pool`

```js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.PG_URI);

export default sequelize;
```

-   What's slightly different is we then import the whole file, that will cause it to run. We do this when we want side effects (i.e. a database connection)

```js
import './db/index.js';
```

#### Back to slide 6

## Models - slide 7

-   We'll start with the `User` model from the tutorial, then look at adding a `Duck` model
-   Make `models/User.js`
-   The tutorial starts with the full model, but let's break it down
-   We need to import the `DataTypes` object to define the types, and our instance of `sequelize` for db connection

```js
import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';
```

-   We can use the `define` method to make our `User` model
    -   first arg is name of the model (name of table will default to plural version of that)
        -   I'll change this to lowercase, so the table is `users`
    -   second arg is an object that defines the attributes

```js
const User = sequelize.define('User', {});
```

-   Now we `CREATE TABLE` in a JS way
-   Each property has an object with several options, this will convert to data types and constraints in SQL
    -   by setting `allowNull` to false, we're saying `NOT NULL`
    -   we also export it
-   We'll leave `User.sync()` commented out for now, and circle back to it

```js
const User = sequelize.define('user', {
    // Model attributes are defined here
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// User.sync();
export default User;
```

-   Server is running as expected, and if we check out our [Neon database](https://console.neon.tech/app/projects/red-scene-36768975/branches/br-lucky-wood-a2qm8e29/tables) no `users` table has been added

#### Back to slide 8

## Querying - slide 11

-   Let's make our `controllers.users.js` file, and copy/paste the tutorial skeleton
-   This follows the same basic structure as our `wildDuck` controllers, just the logic we add will look a little different

```js
import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
        // Some logic here
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        // Some logic here
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        // Some logic here
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        // Some logic here
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        // Some logic here
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Then we import them all into `index.js`, and replace our placeholder controllers

```js
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from './controllers/users.js';

//other stuff...

app.route('/users').get(getUsers).post(createUser);
app.route('/users/:id').get(getUserById).put(updateUser).delete(deleteUser);
```

-   Now at this point let's uncomment the sync and see what happens
-   Our `console.log` shows us the SQL queries Sequelize is executing for us
    -   By running `User.sync()`, and simply importing the `User` in a file that's being used, it creates the table for us
-   Now if we go back to [Neon](https://console.neon.tech/app/projects/red-scene-36768975/branches/br-lucky-wood-a2qm8e29/tables) we see a `users` table
    -   And if we look at the schema there, we see the results of our model

## CRUD Operations

-   Now getting all users is as simple as `User.findAll()`

```js
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Creating a user has some basic validation, like with the `wildDucks`

```js
export const createUser = async (req, res) => {
    try {
        const {
            body: { firstName, lastName, email },
        } = req;
        if (!firstName || !lastName || !email)
            return res
                .status(400)
                .json({ error: 'firstName, lastName, and email are required' });
        const user = await User.create(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Getting a user by id

```js
export const getUserById = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Updating a user

```js
export const updateUser = async (req, res) => {
    try {
        const {
            body: { firstName, lastName, email },
            params: { id },
        } = req;
        if (!firstName || !lastName || !email)
            return res
                .status(400)
                .json({ error: 'firstName, lastName, and email are required' });
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Deleting a user

```js
export const deleteUser = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Test the endpoints

## Taming our ducks

-   Now our ducks will no longer be wild, we're taming them! SO let's quickly search/replace `wild-ducks` to ducks

    -   `index.js` - rename import, and routes
    -   while we're here, let's use the route method to clean up our duck routes a little

    ```js
    app.route('/ducks').get(getAllDucks).post(createDuck);

    app.route('/ducks/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);
    ```

    -   Rename `controllers/wildDucks.js`

### Duck Model

-   Let's make our duck model, we want it to match our schema from [Neon](https://console.neon.tech/app/projects/red-scene-36768975/branches/br-lucky-wood-a2qm8e29/tables)
-   Let's look at [Datatypes](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types)
-   `models/Duck.js`

```js
import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Duck = sequelize.define(
    'duck',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imgUrl: {
            type: DataTypes.STRING(510),
            allowNull: false,
        },
        quote: {
            type: DataTypes.TEXT,
            defaultValue: "I'm here to help!",
        },
    },
    { paranoid: true }
);
Duck.sync();

export default Duck;
```

#### One last thing: [paranoid](https://sequelize.org/docs/v6/core-concepts/paranoid/)

-   In a database, you often don't want to really delete something permanently.
-   If we add this paranoid option, the destroy method won't delete it, but it will hide it. We'll look at that more when we get to our delete route

### Updating our Controllers

-   Instead of `pool`, we import our `Duck` model
    -   Already our `ducks` table has been made

#### Get All ducks

-   simply replace the raw query with out `findAll()` method
    -   For now this gives us an empty array

```js
const ducks = await Duck.findAll();
res.json(ducks);
```

#### Create Duck

-   Same deal, no more raw SQL queries

```js
const newDuck = await Duck.create({ name, imgUrl, quote });
```

#### Get Duck by Id

```js
const duck = await Duck.findByPk(id);
```

#### Update duck

-   slightly different, we need 2 steps for this one

```js
const duck = await Duck.findByPk(id);

if (!duck) return res.status(404).json({ error: 'Duck not found' });

await duck.update({ name, imgUrl, quote });
```

#### Delete duck

-   With paranoid on, duck still exists, but won't show up in our endpoints

```js
const duck = await Duck.findByPk(id);

if (!duck) return res.status(404).json({ error: 'Duck not found' });

await duck.destroy();
```

## Creating Relationships/[associations](https://sequelize.org/docs/v6/core-concepts/assocs/)

-   Pay special attention to this, since it's not in the LMS
-   We will want a one-to-many relationship
-   In order for this to work, we'll have to restructure some things
-   We'll comment out `User.sync()` and `Duck.sync()` and put our associations in a separate file

### `db/associations.js`

-   import our models and `sequelize` instance

```js
import User from '../models/User.js';
import Duck from '../models/Duck.js';
import sequelize from './index.js';
```

-   User has many ducks

```js
User.hasMany(Duck);
```

-   Duck belongs to User with config
    -   must have relationship (FK)
    -   on delete cascade

```js
Duck.belongsTo(User, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'CASCADE',
});
```

-   Then sync all models at once using the instance

```js
sequelize.sync();
```

### `index.js`

-   Import assocations for the side effect of creating the association, and syncing our models

```js
// import './db/index.js';
import './db/associations.js';
```

## Let's drop our ducks table now, and make some adjustments to createDuck

-   We'll also drop users and make a new one
-   We have a userId property now, that cannot be null, so let's add it to the body

```js
const createDuck = async (req, res) => {
    try {
        const { userId, name, imgUrl, quote } = req.body;

        if ((!userId, !name || !imgUrl)) {
            return res
                .status(400)
                .json({ error: 'name and imgUrl are required' });
        }
        const newDuck = await Duck.create({ userId, name, imgUrl, quote });
        res.status(201).json(newDuck);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Let's make a duck

```json
{
    "userId": 1,
    "name": "Captain Quack Sparrow",
    "imgUrl": "https://www.veniceduckstore.it/cdn/shop/products/Captain-Quack-Rubber-Duck-slant.jpg",
    "quote": "You'll always remember this as the day you almost squeezed Captain Quack Sparrow!"
}
```

-   And a second duck

```json
{
    "userId": 1,
    "name": "Sir Quacks-a-lot",
    "imgUrl": "https://cdn11.bigcommerce.com/s-nf2x4/images/stencil/1280x1280/products/430/7841/Knight-Rubber-Duck-Yarto-2__93062.1576270637.jpg?c=2"
}
```

## Now let's populate our user

### First we have to import the user

```js
import Duck from '../models/Duck.js';
import User from '../models/User.js';
```

### The include keyword will populate our data:

```js
const getDucks = async (req, res) => {
    try {
        const ducks = await Duck.findAll({ include: User });
        res.json(ducks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   It adds a new propery
-   We can add that to any route we want

## And do the same for users

### Initially, user doesn't show any data about ducks

-   Import the duck model
-   Use include

```js
import User from '../models/User.js';
import Duck from '../models/Duck.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: Duck });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

-   Adds property that is plural version of the model name

### If we look at the logs we can see how complicated the queries are getting, nice to have an ORM huh?
