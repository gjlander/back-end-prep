# Subdocuments

- We've had relatively simple models so far, but a benefit to MongoDB is the ability to embed documents
- With our Mongoose model, this is as simple as creating a nested object
- Let's add a `location` property to our model

```js
const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    location: {
      type: {
        country: String,
        zipCode: String,
        city: String
      },
      default: { country: 'Germany', zipCode: '', city: '' }
    }
  },
  { timestamps: true }
);
```

- And update `zod`

```js
const locationSchema = z.object({
  country: z.string(),
  zipCode: z.string(),
  city: z.string()
});

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email.'),
  password: z.string().min(8),
  location: locationSchema.optional()
});
```

- Now if we create a user, we see the `location` with default values, and it has it's own `ObjectId`
- Subdocuments have a unique identifier, but they can only exist within the document they are a part of, this is different than populating, where we had a full separate collection, and just populate the data

#### If this feels crowded, we can extract the nested document and make it's own schema

- This would be functionally the exact same

```js
const locationSchema = new Schema({
  country: String,
  zipCode: String,
  city: String
});

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    location: {
      type: locationSchema,
      default: { country: 'Germany', zipCode: '', city: '' }
    }
  },
  { timestamps: true }
);
```

- As with any other data types, you can set the property to an array of them by simply wrapping in `[]`

### Array of subdocuments with a ref

- Our ducks have a reference to their owner, but the user doesn't reference the ducks, this can stay is it is - we want to save the relationship on one side
- But let's say that we want the ability to have a duck pond, where we can add ducks from other users to our pond
- We can have an array of refs

```js
const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    location: {
      type: locationSchema,
      default: { country: 'Germany', zipCode: '', city: '' }
    },
    myPond: {
      type: [Schema.Types.ObjectId],
      ref: 'Duck',
      default: []
    }
  },
  { timestamps: true }
);
```

- But let's say I also want to write some additional notes about the duck. MongoDB doesn't have `JOIN`s, so instead of an array of just ObjectIds, I could have an array of subdocuments that have a property with the ObjectId.
  - Because of how Mongoose uses subdocuments, to default to an empty array we now need to use a function that returns an empty array

```js
const pondDuckSchema = new Schema({
  duckId: { type: Schema.Types.ObjectId, ref: 'Duck' },
  notes: { type: String, default: '' }
});

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    location: {
      type: locationSchema,
      default: { country: 'Germany', zipCode: '', city: '' }
    },
    myPond: {
      type: [pondDuckSchema],
      default: () => []
    }
  },
  { timestamps: true }
);
```

- and update zod
  - We'll export this schema as we'll need it later
  - instead of making `notes` optional, let's have it default to an empty string

```js
const pondDuckSchema = z.object({
  duckId: z.string().length(24),
  notes: z.string().default('')
});

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email.'),
  password: z.string().min(8),
  location: locationSchema.optional(),
  myPond: z.array(pondDuckSchema).optional()
});

export { userSchema, duckSchema, pondDuckSchema };
```

## Endpoints to manage my pond

- In theory, adding ducks to your pond could be on the `updateUser` endpoint, but let's save that for updating user profile information.
- This `myPond` array has become complex enough to warrant it's own controllers, to manage just the pond

### Write new controllers

- We want to have new controllers for CRUD operations to the duck pond (or at least RUD)

```js
export const addDuckToPond = async (req, res) => {};

export const updateDuckInPond = async (req, res) => {};

export const deleteDuckInPond = async (req, res) => {};
```

### Add new endpoints

- Let's add endpoints for those controllers
- update imports

```js
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  addDuckToPond,
  updateDuckInPond,
  deleteDuckFromPond
} from '../controllers/users.js';
```

### Adding duck to pond

- Since we'll need the user id we'll need to start with `/:id`, but we want this to be a new endpoint, so let's add a segment after
  - And that will have a `POST` request to add a new duck
  - And we'll validate with our Zod `pondDuckSchema`

```js
userRouter.route('/:id/ducks').post(addDuckToPond);
```

- Now let's add some logic to our controller
  - Check that user `id` and `duckId` are both valid ObjectIds
  - Remember we had 2 options for updating - we'll use the second here
  - Find the user, throw a 404 if not found
  - Because the default for `myPond` is an empty array, we can simply `push` onto it
  - Then `.save()`

```js
export const addDuckToPond = async (req, res) => {
  const { id } = req.params;
  const { duckId } = req.sanitizedBody;

  if (!isValidObjectId(id) || !isValidObjectId(duckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  user.myPond.push(req.sanitizedBody);

  await user.save();

  res.json(user);
};
```

- Now if we test the endpoint, we see the duck gets added, and this subdocument now has it's own unique identifier
- Just like with the ducks, we can also now populate and use dot notation to get to the nested `duckId`

```js
export const addDuckToPond = async (req, res) => {
  const { id } = req.params;
  const { duckId } = req.sanitizedBody;

  if (!isValidObjectId(id) || !isValidObjectId(duckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  user.myPond.push(req.sanitizedBody);

  await user.save();

  const userWithDucks = await user.populate('myPond.duckId');

  res.json(userWithDucks);
};
```

- And voila! We can use population to get the duck info, and a subdocument to add additional information specific to the user
- We can then also populate on `getUserById`

```js
export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findById(id).select('+password').lean().populate('myPond.duckId');
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};
```

### Update duck in pond

- Because the subdocument has it's own unique `_id`, we can use that to then only update one specific duck
- Let's check out [the docs](https://mongoosejs.com/docs/subdocs.html)
  - We can use the `id` method to find the specific duck we want to update
- So we'll need a second dynamic part of our route for our `pondDuck` id. This is where our `update` and `delete` controller will go
  - Since we're getting the `duckId` from params, we don't need it in the body, rather than make it optional, since we want it required in the `POST` request, we can simply omit it

```js
userRouter
  .route('/:id/ducks/:pondDuckId')
  .put(validateBody(pondDuckSchema.omit({ duckId: true })), updateDuckInPond)
  .delete(deleteDuckFromPond);
```

- We can copy our start from`addDuckToPond` then modify
  - we are using the subdoc's unique id NOT the duck id from the `ducks` collection
  - because we are using Zod we can be confident that there will be a `notes` property, even if it's an empty string
  - We now use `.id()` to find the duck to update and throw a 404 if not found
  - dot notate to update `notes`

```js
export const updateDuckInPond = async (req, res) => {
  const { id, pondDuckId } = req.params;
  const { notes } = req.sanitizedBody;

  if (!isValidObjectId(id) || !isValidObjectId(pondDuckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  const pondDuck = user.myPond.id(pondDuckId);

  if (!pondDuck) throw new Error('Duck not found in pond', { cause: 404 });

  pondDuck.notes = notes;

  await user.save();

  const userWithDucks = await user.populate('myPond.duckId');

  res.json(userWithDucks);
};
```

### Delete duck from pond

- We can recycle most of the same logic to then delete a duck using [deleteOne](https://mongoosejs.com/docs/subdocs.html#removing-subdocs)
- remove body
- send a success message

```js
export const deleteDuckFromPond = async (req, res) => {
  const { id, pondDuckId } = req.params;

  if (!isValidObjectId(id) || !isValidObjectId(pondDuckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  const pondDuck = user.myPond.id(pondDuckId);

  if (!pondDuck) throw new Error('Duck not found in pond', { cause: 404 });

  pondDuck.deleteOne();

  await user.save();

  res.json({ message: 'Duck removed from pond' });
};
```
