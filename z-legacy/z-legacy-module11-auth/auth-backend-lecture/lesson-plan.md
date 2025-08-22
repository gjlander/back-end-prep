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
- `sameSite` - While in production set to `None`, this designates this cookie as `Cross-site`
  - Since our API and client have different domains we are using `cross-site` cookies. This is also why we need to add the `CORS` header
  - Choosing `None` means we must also include the `secure: true` option, meaning only HTTPS requests are allowed
  - Since we use `HTTP` in dev, we set it to `Lax`
- `secure` - `true` while in production to only allow HTTPS requests

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

- Since the JWT payload is included in the cookie, in our body we just give a generic `success` type message

```js
res.status(201).json({ message: 'Welcome' });
```

- Now if we test the endpoint, we see our welcome message
- And if we check Mongo Compass we see our new user
- Back in Postman, we see that a cookie has also been sent
  - Name: `token` - the name we gave it in `res.cookie()`
  - Value: the JWT token we signed that will contain the `userId`
  - Other meta information

## Doing the same in our `signIn` route

- Now we need users with existing accounts to be able to sign in
  - Let's copy the logic in `signUp` as a starting point
- We'll still need to destructure `email` and `password` from the `sanitizedBody`

```js
const {
  sanitizedBody: { email, password }
} = req;
```

- Let's rename `found` to `user`, and make sure we `select` the password
  - We can also delete the `user` that is returned from `User.create()`

```js
const user = await User.findOne({ email }).select('+password');
```

- Change our validation check to if a user doesn't exist

```js
if (!user) throw new Error('User not found', { cause: 404 });
```

- Instead of hashing the password, we now need to `compare`

```js
const passwordMatch = await bcrypt.compare(password, user.password);
```

- Throw an error if they don't match
  - Don't let potentially malicious users know if email or password was wrong

```js
if (!passwordMatch) throw new Error('Invalid email or password', { cause: 401 });
```

- From here, signing the JWT and the cookie logic are exactly the same
  - Since we want are JWT and cookie options to be the same for both, we can extract those pieces
  - Since they are (currently) only used in this file, we can co-locate. If the app grew we could consider moving these to a config file
- Keep the payload inside, since we need the local variable

```js
const secret = process.env.JWT_SECRET;
const tokenOptions = { expiresIn: '6d' };
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'None' : 'Lax',
  secure: isProduction
};
```

- Move the repeated values out of `signUp` too
- It may feel counterintuitive to make this a `POST` request, but we are making a new resource - the cookie

```js
res.status(201).json({ message: 'Welcome back' });
```

- Try to sign in with email and password and we'll get a `Zod` error
- We can create a `signInSchema` by omitting the unneeded fields (similar to the `pondDuck`)

```js
const signInSchema = userSchema.omit({ firstName: true, lastName: true });

export { userSchema, duckSchema, signInSchema };
```

- Import and use on `signin` route

```js
import { userSchema, signInSchema } from '../zod/schemas.js';

authRouter.route('/signin').post(validateBody(signInSchema), signIn);
```

- Now our request works, and we get our cookie

## Token verification

- Now that we have signed a token and are sending it with a cookie to the client, we need a way to verify that token when new requests are made
- One such request is the `me` endpoint, this is where we will actually get the user profile information
- make the `verifyToken middleware`
  - Let's hardcode a `userId` for now, and add it to the `req` object

```js
const verifyToken = (req, res, next) => {
  console.log('Passed through token verification');
  req.userId = '6843f9271ecc0c5e0d0b31b7';
  next();
};
```

- Move `getUserById` to `me`
  - not using dynamic URL anymore, destructure our new `userId` property
  - don't include the password

```js
const me = async (req, res) => {
  const { userId } = req;

  if (!isValidObjectId(userId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(userId).lean();

  if (!user) throw new Error('User not found', { cause: 404 });

  res.json(user);
};

export { signUp, signIn, me };
```

- create `me` endpoint
  - This will be our `GET` request, we are reading the profile info

```js
import verifyToken from '../middleware/verifyToken.js';
import { signUp, signIn, me } from '../controllers/auth.js';

authRouter.route('/me').get(verifyToken, me);
```

- Test our endpoint, and we should get our user info

## Getting `userId` from JWT in cookie

- We obviously don't want the `userId` hardcoded, we want to get it from the cookie
- This is found on the `req.headers.cookie` property, let's first log it to see what we're working with

```js
console.log(req.headers.cookie);
```

- We currently have a string, with a single cookie `token=value`
- In postman, we can manually add more cookies, and control which cookies are sent in the request
- Let's add a second random cookie to simulate what potentially dealing with several cookies could look like

### Shaping our cookies

- We get a string, and see the cookies are separated by a `;` and a space
- First we can make this an array of individual cookies by using the `split` method
  - since each cookie is separated by a `;` then a space, we can set that as our separator

```js
const cookies = req.headers.cookie?.split('; ');

console.log(cookies);
```

- Now we get an array of strings, where each item has the full cookie
- We can then split these strings based on the '='

```js
const cookieArrays = cookies.map(cookie => cookie.split('='));
console.log(cookieArrays);
```

- And with an array of paired arrays, we can use the `Object.fromEntries` method to turn this array of arrays into an object

```js
const cookiesObj = Object.fromEntries(cookieArrays);

console.log(cookiesObj);
```

- Now we can destructure to access the cookie we want, which is our token

```js
const { token } = cookiesObj;

console.log(token);
```

- We can save ourselves all of this trouble, by adding a check if cookies exist, calling next with an error if there aren't any
  - Remember calling next with an argument will land us in our error handler
  - As of express v5 this is the same behaviour as openly throwing an error

```js
if (!req.headers.cookie) {
  next(new Error('Unauthorized, please sign in', { cause: 401 }));
}
```

- Similarly, if there is no token, we can call the same

```js
if (!token) {
  next(new Error('Unauthorized, please sign in', { cause: 401 }));
}
```

- Now if we pass validation, we need to decode the token, so we import `jwt` and use the `verify` method

```js
import jwt from 'jsonwebtoken';
// rest of function
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded);
```

- Our decoded token has the `userId` property, so we can destructure it, and set it instead our hard coded value

```js
const { userId } = jwt.verify(token, process.env.JWT_SECRET);
//   console.log(userId);

req.userId = userId;
```

- Now we get the actually signed in user!
  - Show signing in another user and getting different profile
