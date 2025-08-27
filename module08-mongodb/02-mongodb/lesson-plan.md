# MongoDB

- MongoSH commands to Node commands
- .toArray()
- creating ObjectID
- Reminder of "" for multi-word args
- Local MongoDB is **bonus**

# MongoDB

## Go through NoSQL Databases article

## Go through MongoDB [slides](https://docs.google.com/presentation/d/15IWjrCTpSN56i1TkjaJARdldWfVSGFbN1EvdJpIq75g/edit?slide=id.p1#slide=id.p1)

## Mongo Atlas and Mongo Compass

### From Mongo Atlas Article

- From homepage signin/signup with Google
- Create an organization

#### Creating a new project

- Click `Create New Project`
- Name the project
- Invite members
  - You will be the project owner, but this is how you would invite group members to have full read/write access
- Create a cluster
  - Select free tier
  - Name the cluster - can be same as project name or different
  - Provider doesn't matter
  - Region should be default Frankfurt, but double check it
- Connect to Cluster
  - Copy password and save it somewhere dfXSZ1N8raJfDblA
  - Choose Compass, and download it
  - Copy connection string
- Add network access from anywhere

#### Connecting to Mongo Compass

- Click the `+` to add a new connection
- Paste the connection string
- Name here can match Cluster/Project name or be something new
- Choose `Save & Connect`

### Using Mongo Compass

- `+` to add new database
- Can name database something generic, or more specific if you have it in mind
- Collections are like tables, so this should be descriptive

#### Adding data

- Can import JSON or CSV files
  - import JSON exported from Neon
- Can also copy/paste documents
- Or run queries in the MongoDB shell
  - Here is where you could run the queries for CRUD Operations with Mongo

#### Updating/deleting data

- Can manually update via the GUI in addition to the shell

## Mongo Compass Checklist

- Installed, and connect to a project
- Copy connection string
- Import/export data
- Manually update a field with GUI

## CRUD Operations with Mongo

- This exercise is tutorial style, so all of the commands you need are there. I recommend using the MongoDB Compass Shell

### Brief demo

- Click on the database you want to work in, then in top right `Open MongoDB Shell`
- You can copy/paste the commands from the tutorial exercise
  - You may need to `refresh` to see the GUI update
- Make note of the response we get back and the properties it has

## CRUD CLI

- The exercise has instructions on how to set up the app.
  - Quickly walk through the changes

### From Shell Commands to Node

- The commands used in the CLI will be very similar to what you have to run in the shell, but there are a couple of minor changes I want to highlight

#### Saving collection in a variable

- We establish our database connection and then import `db`. `db` has a `collection()` method where we can pass the collection we want to use. We can store that in a variable to then call our CRUD methods on

```ts
const products = db.collection('products');
```

#### DB Operations are async

- All of the CRUD commands are async, so make sure to `await` the result

```ts
const result = await products.insertOne();
```

#### Format the input before saving

- Since all arguments will come in as a string, make sure to convert `stock` and `price` into numbers
- You can have multi-word inputs for an arg by wrapping in double quotes. How could you turn a string of comma-separated tags into an array of tags?

#### Use `.toArray()` on `find()` queries

- Queries using `find()` will not return an array of objects as you might expect, but they have a `.toArray()` method you can use for that

```ts
program
	.command('list')
	.description('List all products')
	.action(async () => {
		console.log('CLI application was called with list command');
		const allProducts = await products.find().toArray();
		console.log(allProducts);
	});
```

const allProducts = await products.find().toArray();

#### ObjectId must be converted from string

- The id string must be converted into an ObjectId object to search with it. For `get` by id, you can use `findOne()`

```ts
import { ObjectId } from 'mongodb';
const objId = ObjectId.createFromHexString(id);

program
	.command('get')
	.description('Get product by ID')
	.argument('<id>', 'Product ID')
	.action(async id => {
		console.log('CLI application was called with get command');
		const objId = ObjectId.createFromHexString(id);
		// const product = await products.findOne();
	});
```

- I will fill a skeleton for the commander commands, since the focus is more on the db queries than working with commander

#### Just as with CSS -> Tailwind and Manual DOM Manipulation -> React we'll be abstracting some of these direct interactions away, so the main focus for today is making sure you have Mongo Compass installed, and can interact with a DB. It's also important to see what will be happening under the hood when we abstract some of this away
