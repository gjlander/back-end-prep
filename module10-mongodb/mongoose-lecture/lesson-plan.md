# Mongoose with Express

- It's going to be very similar to working with Sequelize

## Zod schemas

- I added actual body validation logic to the skeleton from the last lecture
- Walk through schemas

## Migrating to Mongoose

- I can delete `pg` and `sequelize` from dependencies
- `npm i mongoose`
  - Unlike sequelize, Mongoose includes the driver as well, since it only connects to one database
- Let's delete our `package-lock.json` and `node_modules` to clear out `pg` and `sequelize`
  - then run `npm i` to install them all again

### Database connection

- We can delete `associations.js`
- In `index.js`, let's copy the code snippet from the tutorial, and break it down
  - We import the `mongoose` object
  - Because we are using ES6 modules, we can use top-level await
  - We await the connection, and catch and log the error if one happens
  - Note we're not exporting anything anymore

```js
import mongoose from 'mongoose';

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
} catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}
```

- In our root `index.js` we import the whole file, just as before, so that the file will run and establish our connection

```js
import './db/index.js';
```

- From here we need to update our `.env` file

  - Get the connection string from Mongo Compass
  - The connection string will put us in a `test` database, so we can simply add the database we want to the end

- Now if we try to `npm run dev` it will get mad, since we need to update the controllers, but if we comment them out for new, we can see in our console logs that we do have a database connection
- Unlike Sequelize, Mongoose won't make a collection until we actually try to query it
  - show in Mongo Compass

### Updating to mongoose models

#### User model

- Next we need to update our `User` model
- Update our imports

```js
import { Schema, model } from 'mongoose';
```

- With Mongoose, we first define the schema by making a new instance of the `Schema` class
  - just one argument, which is the object defining the shape of our schema

```js
const userSchema = new Schema({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
```

- The syntax is slightly different, but same principle, we define a `type`, and want to make it `NOT NULL` or `required`

```js
firstName: {
    type: String,
    required: true
  },
```

- We can also pass a custom error message

```js
firstName: {
    type: String,
    required: [true, 'First name is required']
  }

```

- Last name will look the same

```js
  lastName: { type: String, required: [true, 'Last name is required'] },
```

- We can also require a property to be unique

```js
email: { type: String, required: [true, 'Email is required'], unique: true },
```

- Mongoose doesn't add timestamps by default, so we can either add `createdAt` and `updatedAt` properties, or simply add a second optional argument to add timestamps

```js
{
  timestamps: true;
}
```

- To turn this schema into an actual model, we have to pass it to the `model` function, and here is where we will name the collection that will use this model
  - We could store it in a variable, or simply export it by default

```js
export default model('User', userSchema);
```

### Update our controllers

- No longer need `Duck` model

#### `getUsers`

- replace `findAll` with `find`

```js
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
```

- Uncomment the router and test the endpoint

#### `createUser`

- Body validation is still handled by Zod in our middleware
- If body validation check passes, we can add a check to make sure that email doesn't already exist
- method still called `create`
- Can either pass whole sanitized body, or individual properties

```js
export const createUser = async (req, res) => {
  const {
    sanitizedBody: { firstName, lastName, email }
  } = req;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exists', { cause: 400 });

  const user = await User.create(req.sanitizedBody);

  res.json(user);
};
```

- Show it in Mongo Compass

#### If mongoose schema has unique property, why bother checking here?

- Especially since we're outside of an SQL database, if we want date consistency we really have to check for it. MongoDB doesn't care if the documents hold a certain shape, but we do. So we use Mongoose, but also Zod and other validation checks
- Mongoose is our last line of defense, but ideally no request makes it that far that won't be accepted

### A special note about ObjectIds

- As mentioned, an ObjectId is a special object from MongoDB. The string from params will get converted into an ObjectId by Mongoose, but that only works if it follows Object Id rules
  - It is 24 characters long
  - It is hexadecimal (uses 0-9 and A-F to represent 0-15 )
- Because we know the pattern it's supposed to match, we could write a complex regex to test against, but luckily `mongoose` provides a helpful utility function to test if something is a valid Object Id
  - aptly named `isValidObjectId`

#### So we can add a validation check on our dynamic routes to see if it's a valid id

- import it

```js
import { isValidObjectId } from 'mongoose';
```

#### `getUserById`

- `findByPK` becomes `findById`

```js
export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findById(id);
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};
```

#### `updateUser`

- can do in one step with `findByIdAndUpdate`
- in order to get back the updated resource, have to add third argument and set `new` to `true`

```js
export const updateUser = async (req, res) => {
  const {
    sanitizedBody: { firstName, lastName, email },
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findByIdAndUpdate(id, req.sanitizedBody, { new: true });
  if (!user) throw new Error('User not found', { cause: 404 });

  res.json(user);
};
```

#### `deleteUser`

- can also move to one step

```js
export const deleteUser = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findByIdAndDelete(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  res.json({ message: 'User deleted' });
};
```

### Adding a reference to a Model

- Now let's update our duck model
- We can also set a `maxLength`, and give a `default`

```js
import { Schema, model } from 'mongoose';

const duckSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 255
    },
    imgUrl: {
      type: String,
      required: true,
      maxLength: 510
    },
    quote: {
      type: String,
      default: "I'm here to help!",
      maxLength: 1000
    }
  },
  { timestamps: true }
);

export default model('Duck', duckSchema);
```

- There are no relationships, but we can populate data from another collection by referencing it's id

```js
owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    }
```

### Update duck controllers

- Can delete `User` model import
- add `ObjectId` import

#### `getAllDucks`

- instead of `include` we now `populate` and name of the property where we stored the ref

```js
const getAllDucks = async (req, res) => {
  const ducks = await Duck.find().populate('owner');
  res.json(ducks);
};
```

#### `createDuck`

```js
const createDuck = async (req, res) => {
  const newDuck = await Duck.create(req.sanitizedBody);
  res.status(201).json(newDuck);
};
```

- We will need to update our Zod `duckSchema` to include an owner instead of `userId`
  - Basic check that it is 24 characters long before final check from `isValidObjectId`

```js
owner: z.string().length(24);
```

- Uncomment and test

#### Only populating certain fields

- Now on `getAllDucks`, we get all of the user info, but we can also specify which properties to include by passing a second argument to `populate`
  - simple string, separated by spaces

```js
const getAllDucks = async (req, res) => {
  const ducks = await Duck.find().populate('owner', 'firstName lastName');
  res.json(ducks);
};
```

#### `getDuckById`

```js
const getDuckById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const duck = await Duck.findById(id).populate('owner', 'firstName lastName');

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json(duck);
};
```

#### `updateDuck`

- populate after updating

```js
const updateDuck = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const duck = await Duck.findByIdAndUpdate(id, req.sanitizedBody, { new: true });

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  const duckWithOwner = await duck.populate('owner', 'firstName lastName');
  res.json(duckWithOwner);
};
```

#### `deleteDuck`

```js
const deleteDuck = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByIdAndDelete(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json({ message: `Duck deleted successfully` });
};
```

## A note on read only queries (`GET` requests)

- By default, using Mongoose to query our database it will return an instance of the `Mongoose Document` class
- These can be pretty heavy, much heavier than plain old Vanilla JavaScript objects, because they keep track of internal state, and give us access to all of the class methods to update the document
- For editing (updating or deleting) we need this, but for read-only operations (i.e. GET requests), we don't need this overhead.
- Mongoose gives us the (lean option)[https://mongoosejs.com/docs/tutorials/lean.html] for this
- add it to `getUsers` and `getUserById`

```js
export const getUsers = async (req, res) => {
  const users = await User.find().lean();
  res.json(users);
};

export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  const user = await User.findById(id).lean();
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};
```

- and `getAllDucks` and `getDuckById`
  - goes before `populate`

```js
const getAllDucks = async (req, res) => {
  const ducks = await Duck.find().lean().populate('owner', 'firstName lastName');
  res.json(ducks);
};
const getDuckById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const duck = await Duck.findById(id).lean().populate('owner', 'firstName lastName');

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json(duck);
};
```
