# Better password management

### Don't include password with `select: false`

- When we wanted to select all columns except password in SQL we had to list every column we wanted, there was no `exclude this` option
- With `mongoose` there is, we can add `select: false` and then by default the password won't be included when querying our `Users` collection

```js
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false }
  },
  { timestamps: true }
);

export default model('User', userSchema);
```

- We also need to update of Zod schema

```js
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email.'),
  password: z.string().min(8)
});
```

- Drop collection, make new user, show lack of password

### Bringing the password back when needed

- Sometimes we do need the password, for example to sign in we want to compare the password and check if it matches the user password
- To include it in a specific query we use the `select` method

```js
export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  const user = await User.findById(id).select('+password').lean();
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};
```

### Using bcrypt to hash password

- We've also thus far been storing passwords as plain text, which is bad practice!
- A database leak would be disastrous, but you also don't want any employee with database access to be able to see all passwords
- To store passwords, we'll use a process called salting and hashing (more to come next week) and a library called `brcypt` to do that for us
- We must `npm i bcrypt`
- import it - `*` means wildcard, we give it an alias

```js
import * as bcrypt from 'bcrypt';
```

- bcrypt has a `hash` method, and we can say how many rounds to put it through, 10 is a good number

```js
export const createUser = async (req, res) => {
  const {
    sanitizedBody: { email, password }
  } = req;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exists', { cause: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ ...req.sanitizedBody, password: hashedPassword });

  res.json(user);
};
```

- bcrypt also has a `compare` function, but we'll cover that next week when we get to authentication
