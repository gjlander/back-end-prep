## Token Based Authentication (backend)

- Conceptually, we have introduced both Authentication and Authorization, but the practical focus today will be on Authentication
- Walk through authentication flow
- The nice thing is, you've already experienced this basic flow with the events API
  - We will be using a micro-services architecture, but the general flow will be similar

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

## Microservices Architecture

- Unlike the events planner, we will use microservices. We will have a separate server purely dedicated to our auth logic, which can make it more scalable, etc. but also make it easier to potentially replace it with a more robust solution from a third-party library later. And since our auth operations aren't totally stateless, it allows our API layer to still conform to RESTful principles

## And how to implement it? (back to article)

- Go through rest of the article

# Auth server

- Most of our time and effort will be spent in the auth server, then we will simply add a middleware in the api to authenticate users

## Tour of the app

- We're still following our MVC model, so the structure will look the same as our API

### package.json

#### Dependencies

- bcrypt - a library to hash (encrypt) passwords, so we're not saving plain text passwords in the DB
- cookie-parser - now that we'll be working with cookies, this library will process them for us
- cors - stands for Cross Origin Resource Sharing. Since our API and our SPA are deployed separately, they have different origins. The cors library helps us do that securely, and prevent CORS errors
- jsonwebtoken - this is the library from Auth0 we'll use to sign and verify our JWT
- zod - needs to be moved from dev dependencies since we need it in production
- types libraries when needed to TS

### Config folder

- Previously, when working with .env files, we would simply import the variables as needed with `process.env`. Since we're working with quite a few env variables now that also need to fit certain requirements, we can use Zod to validate our env variables.
- We will also add on additional variable, for the length of our Access token
- Based on what we see here, we should end up with a `.env.development.local` file that looks something like this (using some default values from Zod)

```
MONGO_URI=mongodb+srv://dbUser:verysecurepassword@express.93nc620.mongodb.net/
DB_NAME=travel-journal
ACCESS_JWT_SECRET=ce8dbacbb0459ba342690a48332595592e34203c1aa7c676faac43853ccac642
CLIENT_BASE_URL=http://localhost:5173
```

### Middleware

- Our Zod middleware looks the same
- Not found looks the same as well
- Error handler looks the same too, but we will make some updates as we go

### app.ts

- We have our usual setup, with a couple of extras

#### cors

- We use `cors` middleware to only allow requests from our frontend origin (localhost in dev, Render deployed site in production)
- credentials true means we can send/receive our secure cookies
- we also expose the header so we can trigger a refresh

#### cookie parser

- We also include cookie parser as global middleware

## Database Models

- Based on our Zod user schema, we can make a pretty standard looking Mongoose model

```ts
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
	{
		firstName: { type: String, required: [true, 'First name is required'] },
		lastName: { type: String, required: [true, 'Last name is required'] },
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			require: true
		},
		roles: {
			type: [String],
			default: ['user']
		}
	},
	{
		timestamps: { createdAt: true, updatedAt: false }
	}
);

const User = model('User', userSchema);

export default User;
```

- We'll circle back later to the `RefreshToken` model

## API Endpoints

### Register

- In the past this would be our `createUser` endpoint. Without taking into consideration the additional logic we'll need for authenticating, what needs to happen when we create a new user?

  - check if the email is registered (exists is faster than `findOne` since it only returns the \_id)

```ts
const userExists = await User.exists({ email });
if (userExists)
	throw new Error('Email already exists', { cause: { status: 409 } });
```

- create the user in the database

```ts
const user = await User.create({ email, password, firstName, lastName });
```

- send user in the response

```ts
res.status(201).json(user);
```

- Now we can register a user in Postman, just as we've done before. First problem to solve is that the password is saved in plain text

#### bcrypt

- Through a process called salting and hashing, we can encrypt the user password so keep it secure
- We import it

```ts
import bcrypt from 'bcrypt';
```

- We generate a salt for it, and then hash it, and save the hashed password to the DB

```ts
const salt = await bcrypt.genSalt(SALT_ROUNDS);
const hashedPW = await bcrypt.hash(password, salt);

const user = await User.create({
	email,
	password: hashedPW,
	firstName,
	lastName
});

res.status(201).json(user);
```

- Now when we save a user, their password is safe against potential leaks
- I will keep our `User` router, and start migrating functionality to our `auth` routes as they come up

#### Generate a cookie instead of responding with user

- Now instead of sending the newly made user in the response, we want to generate a cookie that will hold the JWT access token
- import it into `auth.ts`

```js
import jwt from 'jsonwebtoken';
```

- Everything up until `User.create` will stay the same

#### Sign the JWT token

To sign the token we need 3 things

1. the payload (the actual data we send)
   - We will send the user's roles
2. the secret, for that let's make an env variable
3. token options, where we'll set the expiration date, and include the subject (our user's id)

```js
const payload = { roles: user.roles };
const secret = ACCESS_JWT_SECRET;
const tokenOptions = {
	expiresIn: ACCESS_TOKEN_TTL,
	subject: user._id.toString()
};
```

- Then we call the `sign` method on `jwt`

```js
const accessToken = jwt.sign(payload, secret, tokenOptions);
```

#### Setting the Access token cookie

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
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction
  };

res.cookie('accessToken', accessToken, cookieOptions);
```

- Since the JWT payload is included in the cookie, in our body we just give a generic `success` type message

```js
res.status(201).json({ message: 'Registered' });
```

- Now if we test the endpoint, we see our welcome message
- And if we check Mongo Compass we see our new user
- Back in Postman, we see that a cookie has also been sent
  - Name: `accessToken` - the name we gave it in `res.cookie()`
  - Value: the JWT token we signed
  - Other meta information

### Managing the Refresh token

- In addition to the short-lived access token, we will save a refresh token in the DB. This is where we add a splash of session management. This is what will allow for a `remember me` type option, where the user can stay signed in on a device for a longer time

#### RefreshToken Model

- In the model, we'll save the token itself, the userId associated with it, and an expiration date

```ts
import { Schema, model } from 'mongoose';
import { REFRESH_TOKEN_TTL } from '#config';

const refreshTokenSchema = new Schema(
	{
		token: {
			type: String,
			required: true,
			unique: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		expireAt: {
			type: Date,
			default: () => new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
		}
	},
	{
		timestamps: { createdAt: true, updatedAt: false }
	}
);

const RefreshToken = model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
```

- Indexing a property is a way to speed up read queries (at the cost of slowing down write queries), but we can also use it in conjunction with the `expireAt` field to have it automatically be deleted after the time designated

```ts
// Creates a TTL (Time-To-Live) Index. Document will be removed automatically after <REFRESH_TOKEN_TTL> seconds.
refreshTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.index({ userId: 1 });
```

#### Create Refresh token and send in cookie

- We can just use `randomUUID` to generate a random token for us, then save it to the DB

```ts
import { randomUUID } from 'node:crypto';
import { User, RefreshToken } from '#models';
//other stuff...

// refresh token
const refreshToken = randomUUID();

await RefreshToken.create({
	token: refreshToken,
	userId: user._id
});
```

- We then also need to send the refresh token in it's own cookie

```ts
res.cookie('refreshToken', refreshToken, {
	...cookieOptions,
	maxAge: REFRESH_TOKEN_TTL * 1000 // in milliseconds
});
```

### Creating utility functions

- Our register controller is starting to get a bit long, but more importantly, everything we're doing to create the refresh and access tokens, along with setting the cookies will need to be repeated in our `login` endpoint. Let's extract the logic for each into some utility functions, so we can reuse that logic
- First we need to create a `utils` folders and add it to imports

#### createTokens util

- Let's have one function generate both tokens, since we'll need both anytime we make them
- We will also need our imports, and to pass then user data as an argument

```ts
import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET, ACCESS_TOKEN_TTL } from '#config';
import type { Types } from 'mongoose';

const createTokens = async (userData: {
	roles: string[];
	_id: Types.ObjectId;
}) => {
	// access token
	const payload = { roles: userData.roles };
	const secret = ACCESS_JWT_SECRET;
	const tokenOptions = {
		expiresIn: ACCESS_TOKEN_TTL,
		subject: userData._id.toString()
	};

	const accessToken = jwt.sign(payload, secret, tokenOptions);
};

export { createTokens };
```

- Then we create the refresh token, and return them as a tuple

```ts
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET, ACCESS_TOKEN_TTL } from '#config';
import { RefreshToken } from '#models';
import type { Types } from 'mongoose';

type UserData = {
	roles: string[];
	_id: Types.ObjectId;
};

const createTokens = async (userData: UserData): Promise<[string, string]> => {
	// refresh token
	const refreshToken = randomUUID();

	await RefreshToken.create({
		token: refreshToken,
		userId: userData._id
	});

	// access token
	const payload = { roles: userData.roles };
	const secret = ACCESS_JWT_SECRET;
	const tokenOptions = {
		expiresIn: ACCESS_TOKEN_TTL,
		subject: userData._id.toString()
	};

	const accessToken = jwt.sign(payload, secret, tokenOptions);

	return [refreshToken, accessToken];
};

export { createTokens };
```

#### setAuthCookies util

```ts
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type { Response } from 'express';
import {
	ACCESS_JWT_SECRET,
	ACCESS_TOKEN_TTL,
	REFRESH_TOKEN_TTL
} from '#config';
import { RefreshToken } from '#models';

const setAuthCookies = (
	res: Response,
	refreshToken: string,
	accessToken: string
) => {
	// set cookies
	const isProduction = process.env.NODE_ENV === 'production';
	const cookieOptions = {
		httpOnly: true,
		sameSite: isProduction ? ('none' as const) : ('lax' as const),
		secure: isProduction
	};

	res.cookie('refreshToken', refreshToken, {
		...cookieOptions,
		maxAge: REFRESH_TOKEN_TTL * 1000 // in milliseconds
	});
	res.cookie('accessToken', accessToken, cookieOptions);
};
```

## Doing the same in our `login` endpoint

```ts
export const login: RequestHandler = async (req, res) => {
	// get email and password from request body
	const { email, password } = req.body;

	// query the DB to find user with that email
	const user = await User.findOne({ email }).select('+password').lean();

	// if not user is found, throw a 401 error and indicate invalid credentials
	if (!user)
		throw new Error('Incorrect credentials', { cause: { status: 401 } });

	// compare the password to the hashed password in the DB with bcrypt
	const match = await bcrypt.compare(password, user.password!);

	// if match is false, throw a 401 error and indicate invalid credentials
	if (!match)
		throw new Error('Incorrect credentials', { cause: { status: 401 } });

	// delete all Refresh Tokens in DB where userId is equal to _id of user
	await RefreshToken.deleteMany({ userId: user._id });

	// create new tokens with util function
	const [refreshToken, accessToken] = await createTokens(user);

	// set auth cookies with util function
	setAuthCookies(res, refreshToken, accessToken);

	// send generic success response in body of response
	res.status(200).json({ message: 'Logged in' });
};
```

## Let's skip ahead to `me`

```ts
export const me: RequestHandler = async (req, res, next) => {
	// get accessToken from request cookies
	const { accessToken } = req.cookies;

	// if there is no access token throw a 401 error with an appropriate message
	if (!accessToken)
		throw new Error('Access token is required.', { cause: { status: 401 } });

	try {
		// verify the access token
		const decoded = jwt.verify(
			accessToken,
			ACCESS_JWT_SECRET
		) as jwt.JwtPayload;
		// console.log(decoded)
		//
		// if there is now decoded.sub if false, throw a 403 error and indicate Invalid or expired token
		if (!decoded.sub)
			throw new Error('Invalid or expired access token.', {
				cause: { status: 403 }
			});

		// query the DB to find user by id that matches decoded.sub
		const user = await User.findById(decoded.sub).lean();

		// throw a 404 error if no user is found
		if (!user) throw new Error('User not found', { cause: { status: 404 } });

		// send generic success message and user info in response body
		res.status(200).json({ message: 'Valid token', user });
	} catch (error) {
		// if error is an because token was expired, call next with a 401 and `ACCESS_TOKEN_EXPIRED' code
		if (error instanceof jwt.TokenExpiredError) {
			next(
				new Error('Expired access token', {
					cause: { status: 401, code: 'ACCESS_TOKEN_EXPIRED' }
				})
			);
		} else {
			// call next with a new 401 Error indicated invalid access token
			next(new Error('Invalid access token.', { cause: { status: 401 } }));
		}
	}
};
```

## Let's move over to the Travel Journal API to look at how we can implement the `authenticate` middleware

- We first need to update our `errorHandler` to also handle expired tokens

```ts
import type { ErrorRequestHandler } from 'express';

type ErrorPayload = {
	message: string;
	code?: string;
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	process.env.NODE_ENV !== 'production' && console.error(err.stack);
	if (err instanceof Error) {
		const payload: ErrorPayload = { message: err.message };
		if (err.cause) {
			const cause = err.cause as { status: number; code?: string };
			if (cause.code === 'ACCESS_TOKEN_EXPIRED')
				res.setHeader(
					'WWW-Authenticate',
					'Bearer error="token_expired", error_description="The access token expired"'
				);
			res.status(cause.status ?? 500).json(payload);
			return;
		}
		res.status(500).json(payload);
		return;
	}
	res.status(500).json({ message: 'Internal server error' });
	return;
};

export default errorHandler;
```

### Authenticate middleware

- We'll need to install cookie-parser and jsonwebtoken
  - `npm i cookie-parser jsonwebtoken`
- And their types packages for dev (we can also delete dotenv)
  - `npm i -D @types/cookie-parser @types/jsonwebtoken`
- use `cookie-parser` middleware

```ts
import cookieParser from 'cookie-parser';
app.use(express.json(), cookieParser());
```

- import our type and jwt

```ts
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
```

- Since we don't have the config setup here, we import and validate the key. It must match the secret key from the auth server

```
MONGO_URI=mongodb+srv://dbUser:verysecurepassword@express.93nc620.mongodb.net/
ACCESS_JWT_SECRET=ce8dbacbb0459ba342690a48332595592e34203c1aa7c676faac43853ccac642
```

- Validate env secret

```ts
const secret = process.env.ACCESS_JWT_SECRET;
if (!secret) {
	console.log('Missing access token secret');
	process.exit(1);
}
```

- Then we make our classic middleware signature
  - adding `_` is a convention to indicate that we won't be using this parameter

```ts
const authenticate: RequestHandler = (req, _res, next) => {};

export default authenticate;
```

- re-export

- The beginning of this is going to look just like our `me` endpoint
- We check for the accessToken and throw an error if it's not there

```ts
const { accessToken } = req.cookies;
if (!accessToken)
	throw new Error('Not authenticated', { cause: { status: 401 } });
```

- in a try/catch block we try to decode the token, and handle errors in the same way

```ts
try {
	const decoded = jwt.verify(accessToken, secret) as jwt.JwtPayload;
	// console.log(decoded)
	//
	// if there is now decoded.sub if false, throw a 403 error and indicate Invalid or expired token
	if (!decoded.sub)
		throw new Error('Invalid or expired access token.', {
			cause: { status: 403 }
		});
} catch (error) {
	// if error is an because token was expired, call next with a 401 and `ACCESS_TOKEN_EXPIRED' code
	if (error instanceof jwt.TokenExpiredError) {
		next(
			new Error('Expired access token', {
				cause: { status: 401, code: 'ACCESS_TOKEN_EXPIRED' }
			})
		);
	} else {
		// call next with a new 401 Error indicated invalid access token
		next(new Error('Invalid access token.', { cause: { status: 401 } }));
	}
}
```

- We store the userId and user roles that came from the token, and add them to the request object and call `next()`

```ts
const user = {
	id: decoded.sub,
	roles: decoded.roles
};
req.user = user;

next();
```

- Add the type so TS is happy

```ts
namespace Express {
	interface Request {
		user?: {
			id: string;
			roles: string[];
		};
	}
}
```

- We add it to protected endpoints

```ts
import { authenticate } from '#middlewares';

const postsRouter = Router();

postsRouter
	.route('/')
	.get(getAllPosts)
	.post(authenticate, validateZod(postSchema), createPost);

postsRouter
	.route('/:id')
	.get(getSinglePost)
	.put(authenticate, validateZod(postSchema), updatePost)
	.delete(authenticate, deletePost);

export default postsRouter;
```

- Now when you are signed in you can make a new post. Currently any signed in user can edit or delete anyone's post, but we'll fix that later

## Now for logging out

```ts
export const logout: RequestHandler = async (req, res) => {
	// get refreshToken from request cookies
	const { refreshToken } = req.cookies;

	// if there is a refreshToken cookie, delete corresponding RefreshToken from the DB
	if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });

	// clear the refreshToken cookie
	res.clearCookie('refreshToken');

	// clear the accessToken cookie
	res.clearCookie('accessToken');

	// send generic success message in response body
	res.json({ message: 'Successfully logged out' });
};
```

## And finally our refresh endpoint

- We'll do some fancy stuff on the frontend so that any time our access token is expired, we'll automatically hit this endpoint to generate new tokens

```ts
export const refresh: RequestHandler = async (req, res) => {
	// get refreshToken from request cookies
	const { refreshToken } = req.cookies;

	// if there is no refresh token throw a 401 error with an appropriate message
	if (!refreshToken)
		throw new Error('Refresh token is required.', { cause: { status: 401 } });

	// query the DB for a RefreshToken that has a token property that matches the refreshToken
	const storedToken = await RefreshToken.findOne({
		token: refreshToken
	}).lean();

	// if no storedToken is found, throw a 403 error with an appropriate message
	if (!storedToken) {
		throw new Error('Refresh token not found.', { cause: { status: 403 } });
	}

	// delete the storedToken from the DB
	await RefreshToken.findByIdAndDelete(storedToken._id);

	// query the DB for the user with _id that matches the userId of the storedToken
	const user = await User.findById(storedToken.userId).lean();

	// if not user is found, throw a 403 error
	if (!user) {
		throw new Error('User not found.', { cause: { status: 403 } });
	}

	// create new tokens with util function
	const [newRefreshToken, newAccessToken] = await createTokens(user);

	// set auth cookies with util function
	setAuthCookies(res, newRefreshToken, newAccessToken);

	// send generic success response in body of response
	res.json({ message: 'Refreshed' });
};
```

- And with that we have the logic for our controllers! As a final polish, we can look at...

### Adding type safety to our controllers

- Import z and schemas to infer types for our DTOs, and add a type for our generic success responses

```ts
import type { z } from 'zod/v4';
import type { registerSchema, loginSchema } from '#schemas';

type RegisterDTO = z.infer<typeof registerSchema>;
type LoginDTO = z.infer<typeof loginSchema>;
type SuccessResBody = {
	message: string;
};
```

- register

```ts
export const register: RequestHandler<{}, SuccessResBody, RegisterDTO> = async (
	req,
	res
) => {};
```
