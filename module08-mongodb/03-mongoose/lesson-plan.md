# Mongoose

## Topics to cover

- Mongoose and Data Modelling articles
- Schemas
- subdocuments vs referencing
- CRUD methods
- TS types with `create` generic

## Mongoose ODM

- MongoDB doesn't enforce that all documents in a collection have the same shape, but often we will want that. Mongoose is a library that will help us enforce that shape, and simplify queries for us
- Cover points for making a schema/model

### Setting Up Mongoose

- Starting from our node-ts template, we need to install `mongoose` via npm
  - Since `mongodb` is a dependency of `mongoose`, we don't need to install it separately
    `npm i mongoose`
- Then we need to get our connection string from Mongo Compass and store it in a `.env` file
  - If we are also planning to build for production, we use `.env.development.local`

```
MONGO_URI=<connection_string>
```

- To access this environmental variable, we need to add it to our `dev` and `start` scripts, to tell node where to look for it

```json
"scripts": {
		"dev": "node --env-file=.env.development.local --watch --conditions development src/app.ts",
		"prebuild": "rm -rf dist",
		"build": "tsc",
		"prestart": "npm run build",
		"start": "node --env-file=.env.production.local dist/app.js"
	},
```

- From here, we connect with our database through mongoose, and establish that connection in `db/index.ts`
- We need to import `mongoose`

```ts
import mongoose from 'mongoose';
```

- The database connection is async, and could throw an error, so we use a try/catch block, and top level await
  - Since `MONGO_URI` can be undefined, we can assert that it's here

```ts
try {
	// Connect
	await mongoose.connect(process.env.MONGO_URI!);
	console.log('mMongoDB connected via Mongoose');
} catch (error) {
	console.error(error);
}
```

- Since the connection string just connects us to a project that potentially has several databases, we can specify which DB to connect to with an optional second argument

```ts
import mongoose from 'mongoose';
try {
	// Connect
	await mongoose.connect(process.env.MONGO_URI!, {
		dbName: 'mongoose'
	});
	console.log('MongoDB connected via Mongoose');
} catch (error) {
	console.error('MongoDB connection error:', error);
	process.exit(1);
}
```

- We have to add it to our imports

```json
"imports": {
		"#utils": {
			"development": "./src/utils/index.ts",
			"default": "./dist/utils/index.js"
		},
		"#db": {
			"development": "./src/db/index.ts",
			"default": "./dist/db/index.js"
		}
	},
```

- Running this file will establish the connection, but we don't need any actual variables from it. So to run the file, we can simply import the whole file

```ts
import '#db';
```

- At this point, we can run `npm run dev` and we will see the log letting us know that the connection has been established

#### Adding colors to our console logs

- Unlike the console in the browser, the terminal by default isn't adding any colors or styles to our logs. There are some libraries that can help us out, but there are also special characters we can pass to add colors
- We can make our message here purple

```ts
console.log('\x1b[35mMongoDB connected via Mongoose\x1b[0m');
```

## Models

- Now that we have our db connection, for each collection we want to have, we need to create first a schema, and then a model based on that schema
- To start, we make a new `models` folder, `index.ts` and add it to our imports

```json
	"imports": {
		"#utils": {
			"development": "./src/utils/index.ts",
			"default": "./dist/utils/index.js"
		},
		"#db": {
			"development": "./src/db/index.ts",
			"default": "./dist/db/index.js"
		},
		"#models": {
			"development": "./src/models/index.ts",
			"default": "./dist/models/index.js"
		}
	},
```

### Users collection

- So if we want a collection of users, we make a new file for it `User.ts`
- We need to import `Schema` and `model` from mongoose

```ts
import { Schema, model } from 'mongoose';
```

- We define our `userSchema` be creating an instance of the `Schema` class from mongoose

```ts
const userSchema = new Schema({});
```

- Here we can add properties with different data types. These types come from Mongoose, so will have some differences to our TS/JS types. Let's look at the [docs](https://mongoosejs.com/docs/schematypes.html)
  - Most commonly, we'll use `String`, `Number`, or `ObjectId`
- So we can create a user with the following fields:

```ts
const userSchema = new Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String }
});
```

- We can also add additional constraints to each property, such as `required` or `unique`

```ts
const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true }
});
```

- We can also easily customize the error message by passing an array, with the second item as the message

```ts
const userSchema = new Schema({
	firstName: { type: String, required: [true, 'First name is required'] },
	lastName: { type: String, required: [true, 'last name is required'] },
	email: { type: String, required: [true, 'Email is required'], unique: true }
});
```

- Schema also takes an optional second arg where you can include things like `timestamps` for `createdAt` and `updatedAt` properties that it will manage for us

```ts
const userSchema = new Schema(
	{
		firstName: { type: String, required: [true, 'First name is required'] },
		lastName: { type: String, required: [true, 'last name is required'] },
		email: { type: String, required: [true, 'Email is required'], unique: true }
	},
	{ timestamps: true }
);
```

- Now that we have defined our schema, we pass it to the `model` function, along with singular version of the name we'd like for our collection

```ts
model('User', userSchema);
```

- We can then export that by default

```ts
export default model('User', userSchema);
```

- We can re-export from our `index.ts` file

```ts
export { default as User } from './User.ts';
```

- Then import in `app.ts`

```ts
import '#db';
import { User } from '#models';
```

## Queries

### Create

- We have 2 options for creating a new user now

#### create new instance of user, and call `.save()` on it

```ts
try {
	const newUser = new User({
		firstName: 'Aang',
		lastName: 'Air',
		email: 'aang@air.com'
	});

	await newUser.save();
	console.log(newUser);
} catch (error) {
	console.error(error);
}
```

- If we go to Mongo Compass and refresh, we can see the `users` collection, and our new user

#### use the `create()` method on `User`

- More often, though, we'll simply call the `create` method on our `User` class

```ts
const newUser = await User.create({
	firstName: 'Katara',
	lastName: 'Water',
	email: 'katara@water.com'
});

console.log(newUser);
```

- Again, if we refresh we can see our new user

### Querying/Read

- We can use `find` with no arguments to get all of our users. Mongoose makes it into an array of objects for us, so no need for `toArray()`

```ts
const users = await User.find();
console.log(users);
```

- We can pass in search parameters
  - Note this will still give us an array even if only 1 item meets the query

```ts
const usersAir = await User.find({ lastName: 'Air' });
console.log(usersAir);
```

- We can use `findOne` to find the first match of our query

```ts
const firstAir = await User.findOne({ lastName: 'Air' });
console.log(firstAir);
```

- Or `findById` to search by ObjectId. We can simply pass a string, and Mongoose handles converting it into an ObjectId for us

```ts
const user = await User.findById('68b03fe2e6eb41ed56a5b6af');
console.log(user);
```

### Update

- There's a few options for update (refer to article), but most of the time, you'll be using `findByIdAndUpdate` since we want to return the newly updated item
- It's possible to only pass the properties we want to update, but a common convention is to pass the object. While this might seem to increase potential errors now, once the data is coming from the DB this reduces errors

```ts
const updatedAang = await User.findByIdAndUpdate('68b03fe2e6eb41ed56a5b6af', {
	firstName: 'Aang',
	lastName: 'Avatar',
	email: 'aang@air.com'
});

console.log(updatedAang);
```

- The log still has the old value, but if we refresh Mongo Compass, we see that it has indeed been updated. If we want the updated version of the resource, we have to pass `new: true` to the config object

```ts
const updatedAang = await User.findByIdAndUpdate(
	'68b03fe2e6eb41ed56a5b6af',
	{
		firstName: 'Aang',
		lastName: 'Air',
		email: 'aang@air.com'
	},
	{ new: true }
);

console.log(updatedAang);
```

### DELETE

- We also have a few options for deleting, but we'll mostly use `findByIdAndDelete`

```ts
await User.findByIdAndDelete('68b03fe2e6eb41ed56a5b6af');
console.log('User deleted');
```

- We can always verify on Mongo Compass

#### Each of these queries will eventually connect to a URL endpoint of your API. Based on the APIs you've worked with, think about the HTTP method and endpoint that could correspond to each of these

# Data Modelling

- Go through article up until "Relationships" in MongoDB, note additional constraints and default values

## "Relationships" in MongoDB

### Subdocuments

- As really useful feature of MongoDB's document structure, is that we can embed subdocuments. So essentially, we have nested objects in our document
- For our users, imagine we also store their location. We can simply have a nested object for the type, and we can still set default values

```ts
location: {
			type: { country: String, zipCode: String, city: String },
			default: { country: 'Germany', zipCode: '', city: '' }
		}
```

- For readability, we can extract this subdocument into it's own schema
  - Here is where the distinction between schema and model becomes important. We won't have a `locations` collection, since it has no model. The `location` schema is embedded as part of the `userSchema`

```ts
const locationSchema = new Schema({
	country: String,
	zipCode: String,
	city: String
});
const userSchema = new Schema(
	{
		firstName: { type: String, required: [true, 'First name is required'] },
		lastName: { type: String, required: [true, 'last name is required'] },
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true
		},
		location: {
			type: locationSchema,
			default: { country: 'Germany', zipCode: '', city: '' }
		}
	},
	{ timestamps: true }
);
```

- But now if we create a new user

```ts
const newUser = new User({
	firstName: 'Aang',
	lastName: 'Air',
	email: 'aang@air.com'
});
await newUser.save();
console.log(newUser);
```

- We see the default values of `location`, and we see that `location` gets it's own unique ObjectId

### Referenced documents

- Subdocuments are useful for tightly coupled information. But if you want to top-level documents to be connected, we reference them
- Let's make a second collection of `Ducks`. That's right, we're making the duck pond!
  - we can also set a `maxLength`

```ts
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

- To define an `owner` for each duck, simply save the ObjectId of the `User`, and tell Mongoose which collection to search in
  - Note that the `user` has no reference to the ducks it owns. Relationships are defined one-sided.

```ts
owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
```

- Re-export from `index.ts`

```ts
export { default as User } from './User.ts';
export { default as Duck } from './Duck.ts';
```

- import and make new duck

```ts
const newDuck = await Duck.create({
	name: 'The Mad Quacker',
	imgUrl:
		'https://duckycity.com/cdn/shop/products/SG-REYTD-JCNYO_1024x1024_clipped_rev_1-min_540x.jpeg?v=1505504539',
	quote: 'Be careful, or I might just make your bugs into SUPER bugs!',
	owner: '68b046de0f7e46123b038d5b'
});
console.log(newDuck);
```

- Now to query our ducks

```ts
const ducks = await Duck.find();

console.log(ducks);
```

- If we want to include information about the owner, Mongoose makes that really easy for us with the `populate()` method. The first arg is the name of the property we want to populate

```ts
const ducks = await Duck.find().populate('owner');
```

- By default this will include the whole user, if we only want certain fields, we can pass them as a second arg to populate
  - You pass the properties you want separated by a space

```ts
const ducks = await Duck.find().populate('owner', 'firstName lastName email');
```

#### Refer to article chart on when to use which

### What about TypeScript?

- Mongoose is TS friendly, we don't have to separately install the `@types` for it, and it will automatically create types for our schema for us.
- The only place it needs some help is for creating users. If we try to create a new user with missing required fields, we do get our validation error, so thankfully the query is unsuccessful, but we get no warning from TS

```ts
const newUser = await User.create({
	firstName: 'Zuko',
	lastName: 'Fire'
});
console.log(newUser);
```

- To get that warning, we can create a type for the fields we need

```ts
type UserType = {
	firstName: string;
	lastName: string;
	email: string;
};
```

- And then use `create` with a generic. The error message is a bit crazy, but at least it's letting us know something is off

```ts
const newUser = await User.create<UserType>({
	firstName: 'Zuko',
	lastName: 'Fire',
	email: 'zuko@fire.com'
});
console.log(newUser);
```
