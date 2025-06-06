# Outline

- Go over Auth vs Auth article
- Briefly go over session vs token based article
- Go over lecture article
  - Go over JWT and demo on website
  - Move into code implementation
  - Note we're making a flow similar to events API had
- Requirements for Auth exercise
  - `POST` `/signup` - return JWT
  - `POST` `/signin` - verifies credentials and returns a JWT
  - Middleware for token validation and `me` route

## Token Based Authentication (backend)

- Conceptually, we have introduced both Authentication and Authorization, but the practical focus today will be on Authentication
- Walk through authentication flow
- The nice thing is, you've already experienced this basic flow with the events API

#### 1. Login Request

- Make a `POST` request to the `api/auth/login` endpoint
  - Remember the content in the body would be user input from a form

#### 2. Token Generation

- When the request is made, a token is generated on the server if the email/password match a user
  - or a forbidden error if they don't match
    - don't want to tell if it's email or password that was wrong - makes it easier for a potential hacker if they know which was right

#### 3. Token Sent

- With the events API, this is sent in the body of the response
  - Another option that we'll be exploring is sending the token in a cookie, but more on that soon
- The token contains information about the user (such as their id) we can use to authenticate their identity on later requests

#### 4. Subsequent requests

- In the context of Postman, we copy/paste the token, and add it to the headers
  - Remember with the actual project, this was stored in local storage, then retrieved and added to the headers
- Copy token and add to headers of `Get Profile`

#### 5. Token Validation

- Now with the token in the `Authorization` header, the server will validate the token (via a middleware)
- And when we send the request for user profile, we get the appropriate user
- But if the token is missing, or invalid, we get a forbidden error
- Other requests (such as creating or updating an event) also require this token

#### 6. Token Expiration

- Eventually this token would expire, requiring the user to sign in again, and revalidate their identity

## What is a token? (back to article)

- Go through section in article
- Follow JWT link, and copy/paste token into their site

### Signed Tokens vs Encrypted tokens

- Really important to note that we are using SIGNED tokens, not ENCRYPTED tokens
- This means, that you should not put ANY sensitive data in the payload
  - Even having the email here is questionable, the id would be enough
- What makes this actually secure is the signature part
  - The server has a secret that is added to the signature. By using this secret, you can be certain of the origin, and also be confident that it hasn't been tampered with
  - If this secret was somehow leaked, that would be a big security concern, and you would need to generate a new secret (which would also invalidate all current tokens)

## And how to implement it? (back to article)

- Go through rest of the article

# Let's write some code

- This is the same app we've been working with, I just simplified the `User` model to remove the `location`, and `myPond` so we can really focus in on authentication

## Creating auth routes

- I will keep our `User` router, and start migrating functionality to our `auth` routes as they come up
- Let's start with out token generation endpoints `signup` and `signin`
- ` controllers/auth.js`
  - `signUp` will be how we make users now, so let's copy it from `users` and bring in the `createUser` to modify

```js
import { isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import User from '../models/User.js';

const signUp = async (req, res) => {
  const {
    sanitizedBody: { email, password }
  } = req;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exists', { cause: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ ...req.sanitizedBody, password: hashedPassword });

  res.json(user);
};
const signIn = async (req, res) => {};

export { signUp, signIn };
```

- `routers/authRouter.js`

```js
import { Router } from 'express';
import validateBody from '../middleware/validateBody.js';
import { signUp, signIn } from '../controllers/auth.js';
import { userSchema } from '../zod/schemas.js';

const authRouter = Router();

authRouter.route('/signup').post(validateBody(userSchema), signUp);

authRouter.route('/signin').post(validateBody(userSchema), signIn);

export default authRouter;
```

- `index.js`

```js
import authRouter from './routers/authRouter.js';

app.use('/auth', authRouter);
```

- Add endpoints to Postman, and test `signup`

## Generate a cookie instead of responding with user

- Now instead of sending the newly made user in the response, we want to generate a cookie that will hold the JWT token
- First we need to `npm i jsonwebtoken`
- Then import it into `auth.js`

```js
import jwt from 'jsonwebtoken';
```

- Everything up until `User.create` will stay the same

### Sign the JWT token

To sign the token we need 3 things

1. the payload (the actual data we send)
   - We will send the `_id`
2. the secret, for that let's make an env variable
3. token options, where we'll set the expiration date

```js
const payload = { userId: user._id };
const secret = process.env.JWT_SECRET;
const tokenOptions = { expiresIn: '6d' };
```

- Then we call the `sign` method on `jwt`

```js
const token = jwt.sign(payload, secret, tokenOptions);
```

### Attach the cookie

- Following the example in the upcoming exercise we first

1. Check if we're in production
2. set our cookie options
   - `httpOnly` - cookie can only be read by web server, not by JS
3. use the `res.cookie` method and make our cookie

```js
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'None' : 'Lax',
  secure: isProduction
};

res.cookie('token', token, cookieOptions);
```
