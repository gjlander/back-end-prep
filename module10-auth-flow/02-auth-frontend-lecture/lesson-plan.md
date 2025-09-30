# Authentication Frontend Flow

- Add origin and credentials to CORS
- include credentials in fetch

## LMS Lecture Article

- Our main task on the frontend is Token Retrieval, and managing Authentication state. We can then use that state to conditionally render, and add some precautions and user flows based on what permissions the authenticated user has. This flow will be similar in many ways to what we implemented back during the Frontend Auth flow demoed for the Events Scheduler project

- Go through flow image

## Login/Register

- Login and Register have a very similar flow, so let's look at login, and you can use that for registration when you work on the exercise
- Let's also refer to the duckpond example from back then for a refresher

### You open the app

- Go to duck pond site

### If you are not logged in, you log in

- With valid credentials, redirect to dashboard
  - In our case `myPond`
- Conditional rendering to show Allowed pages, and potentially a welcome message

### If you are authenticated, you can make a new post, edit a post etc

- If I'm not signed in, even if I try to go to this page by manually typing thr URL, I get redirected
- This example uses local storage to save the token, then adds it in the headers, with a cookie will look slightly different

### Some types that will come in handy

- We haven't gone much into namespaces, but instead of exporting shared types and importing them, we cna declare a global namespace, and then those types wil be available throughout the project without having to import. I've added in some shared types here so that they're available when we need them

```ts
declare global {
	type Post = {
		_id: string;
		title: string;
		author: string;
		image: string;
		content: string;
	};

	type User = {
		_id: string;
		createdAt: string;
		__v: number;
		email: string;
		firstName?: string;
		lastName?: string;
		roles: string[];
	};

	type AuthContextType = {
		signedIn: boolean;
		user: User | null;
		handleSignIn: () => void;
		handleSignOut: () => void;
	};
}
```

### Authentication State

- Just like we did for the Event Scheduler, we'll want to create an `AuthContext` to manage our auth state
- create context folder
- we first create our context

```ts
import { createContext } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };
```

- Then our provider.

```ts
import { useState, type ReactNode } from 'react';
import { AuthContext } from '.';

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [signedIn, setSignedIn] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	const handleSignIn = () => {
		setSignedIn(true);
	};

	const handleSignOut = () => {
		setSignedIn(false);
		setUser(null);
	};
	const value: AuthContextType = {
		signedIn,
		user,
		handleSignIn,
		handleSignOut
	};
	return <AuthContext value={value}>{children}</AuthContext>;
};

export default AuthProvider;
```

- make our custom hook and re-export Provider

```ts
import { createContext, use } from 'react';
import AuthProvider from './AuthProvider';

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = (): AuthContextType => {
	const context = use(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
};

export { AuthContext, useAuth, AuthProvider };
```

- Wrap our Root Layout in the provider

```ts
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Navbar } from '@/components';
import { AuthProvider } from '@/context';
import 'react-toastify/dist/ReactToastify.css';

const RootLayout = () => {
	return (
		<AuthProvider>
			<div className='container mx-auto'>
				<ToastContainer
					position='bottom-left'
					autoClose={1500}
					theme='colored'
				/>
				<Navbar />
				<Outlet />
			</div>
		</AuthProvider>
	);
};

export default RootLayout;
```

- Then we can consume the context within our `Login` page
  - Now we manage our `signedIn` state, but we're not making a fetch request yet

```ts
import { Link, Navigate } from 'react-router';
import { useAuth } from '@/context';

const Login = () => {
	const { signedIn, handleSignIn } = useAuth();
	//other stuff
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			if (!email || !password) throw new Error('All fields are required');
			setLoading(true);
			console.log(email, password);
			// TODO: Add login logic
			handleSignIn();
			toast.success('Login attempted (not implemented)');
		} catch (error: unknown) {
			const message = (error as { message: string }).message;
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	if (signedIn) return <Navigate to='/create' />;
};
```

## Create Login fetch request

- Now let's actually hit those endpoint we made in the backend
- We can create the `fetchInterceptor` file in `utils` and export the URL from there (we'll come back to the actual fetch interceptor)
- .env

```
VITE_APP_TRAVEL_JOURNAL_API_URL=http://localhost:8000
VITE_APP_AUTH_SERVER_URL=http://localhost:3000/auth
```

- utils

```ts
const authServiceURL = import.meta.env.VITE_APP_AUTH_SERVER_URL;
if (!authServiceURL) {
	console.error('No Auth service set');
}
export { authServiceURL };
```

- auth.ts

```ts
import { authServiceURL } from '@/utils';
```

- and make a login function basically the same as the old one

```ts
type LoginInput = { email: string; password: string };

type SuccessRes = { message: string };

const login = async (formData: LoginInput): Promise<SuccessRes> => {
	const res = await fetch(`${authServiceURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(formData)
	});
	if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

	const data = (await res.json()) as SuccessRes;
	// console.log(data);

	return data;
};

export { login };
```

- make sure to re-export

```ts
import { createPost, getPosts, getSinglePost } from './posts';

export * from './auth';

export { createPost, getPosts, getSinglePost };
```

- add to `handleSignin

```ts
import { login } from '@/data';
const handleSignIn = async ({ email, password }: LoginData) => {
	await login({ email, password });
	setSignedIn(true);
	setCheckSession(true);
};
```

- And update the type

```ts
type LoginData = { email: string; password: string };

type AuthContextType = {
	signedIn: boolean;
	user: User | null;
	handleSignIn: ({ email, password }: LoginData) => void;
	handleSignOut: () => void;
};
```

- If we try to login now, we get a CORS error (show in console)

## Cookie considerations (move to travel journal repo)

- Because we are working with cookies, we have a couple of extra considerations to protect from CSRF
- In our API, we are using CORS, and currently origin is set to `*`

```js
app.use(cors({ origin: '*' }));
```

- This is the same as writing `cors()`, and it means that we allow cross-site requests from any origin, meaning any website could interact with our API
- Now that we are sending cookies, we don't want that, we only want requests from our frontend domain to work
- We have to add the same security settings we had in the Auth server
- We store this as an env variable, and import it
  - In development this is our local host, in production you'd change this variable to the URL of your deployed frontend

```
CLIENT_BASE_URL=http://localhost:5173
```

```ts
app.use(cors({ origin: process.env.CLIENT_BASE_URL }));
```

- We also need to be able to pass credentials (our JWT)

```ts
app.use(
	cors({
		origin: process.env.SPA_ORIGIN,
		credentials: true,
		exposedHeaders: ['WWW-Authenticate']
	})
);
```

- Make sure to update your API with these changes, or you'll run into errors. This will also then only work on port 5173. Now if we test our request, it works

### Include credentials in frontend

- we then need to add `credentials: include` to ensure the cookies are sent along in the response

- getting the token from local storage looked like this
  - We have to manually retrieve it, and set it in the headers

```ts
const me = async (): Promise<User> => {
	const token = localStorage.getItem('token');

	if (!token) throw new Error(`Failed to sign in. Please try again.`);

	const res = await fetch(`${authServiceURL}/me`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

	const { user } = (await res.json()) as SuccessRes & { user: User };
	// console.log(data);

	return user;
};
```

- With a cookie, we simply add an option to to configuration to include credentials (and we should update the type to reflect what we get back now)

```js
const me = async (): Promise<User> => {
	const res = await fetch(`${authServiceURL}/me`, {
		credentials: 'include'
	});
	if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

	const { user } = (await res.json()) as SuccessRes & { user: User };
	// console.log(data);

	return user;
};
```

- then we can use me to re-implement our `useEffect`

```ts
useEffect(() => {
	const getUser = async () => {
		try {
			const data = await me();

			setUser(data);
			setSignedIn(true);
		} catch (error) {
			console.error(error);
		} finally {
			setCheckSession(false);
		}
	};

	if (checkSession) getUser();
}, [checkSession]);
```

## Refresh token

- We want that whenever our access token is expired, we automatically hit the refresh endpoint. This will be handled by our `fetchInterceptor`. What this is essentially doing is hijacking the native `fetch` function, and setting it to check for that `WWW-Authenticate` header we set on the backend, and hit refresh if it gives us a `token_expired` message

- We store the OG fetch in a variable, and check for the auth URL ( we named this `VITE_APP_AUTH_SERVER_URL`)

```ts
const originalFetch = window.fetch;
const authServiceURL = import.meta.env.VITE_APP_AUTH_SERVER_URL;
if (!authServiceURL) {
	console.error('No Auth service set');
}
```

- We then override the native fetch

```ts
window.fetch = async (url, options, ...rest) => {};
```

- We still want to make the normal fetch request, and get the response. We add credentials to all endpoints

```ts
let res = await originalFetch(
	url,
	{ ...options, credentials: 'include' },
	...rest
);
```

- We then check for the header for our expired token (this is a web standard header)

```ts
const authHeader = res.headers.get('www-authenticate');
```

- If the access token is expired, we hit the `refresh` endpoint, and throw an error if it doesn't work
- We then have to re-send the request now that the token has been refreshed

```ts
if (authHeader?.includes('token_expired')) {
	console.log('ATTEMPT REFRESH');
	const refreshRes = await originalFetch(`${authServiceURL}/refresh`, {
		method: 'POST',
		credentials: 'include'
	});
	if (!refreshRes.ok) throw new Error('Login required');
	res = await originalFetch(
		url,
		{ ...options, credentials: 'include' },
		...rest
	);
}
```

- In the end, we just return the normal fetch response

```ts
return res;
```

- Now with a shorter access token TTL, we can see our auto-refresh!
  - The LMS example includes `_retry`, you can ignore that and use my example

## Logout

- We need to hit the `logout` endpoint to clear the cookies
  - credentials are included with the interceptor

```ts
const logout = async (): Promise<SuccessRes> => {
	const res = await fetch(`${authServiceURL}/logout`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

	const data = (await res.json()) as SuccessRes;
	// console.log(data);

	return data;
};
```

- AuthProvider

```ts
const handleSignOut = async () => {
	await logout();
	setSignedIn(false);
	setUser(null);
};
```

- update the type

```ts
type AuthContextType = {
	signedIn: boolean;
	user: User | null;
	handleSignIn: ({ email, password }: LoginData) => Promise<void>;
	handleSignOut: () => Promise<void>;
};
```

- Use it in `Navbar`

```ts
const { handleSignOut } = useAuth();

const handleLogout = async () => {
	try {
		await handleSignOut();
	} catch (error) {
		if (error instanceof Error) {
			toast.error(error.message);
		} else {
			toast.error('Error logging out');
		}
	}
};

<li>
	<button onClick={handleLogout} className='btn btn-primary'>
		Logout
	</button>
</li>;
```

### Conditionally render Nav buttons

- while we're here, let's add some conditional rendering based on our auth state

```ts
const { handleSignOut, signedIn } = useAuth();

{
	signedIn ? (
		<>
			<li>
				<NavLink to='/create'>Create post</NavLink>
			</li>
			<li>
				<button onClick={handleLogout}>Logout</button>
			</li>
		</>
	) : (
		<>
			<li>
				<NavLink to='/register'>Register</NavLink>
			</li>
			<li>
				<NavLink to='/login'>Login</NavLink>
			</li>
		</>
	);
}
```

- and a welcome message

```ts
const { handleSignOut, signedIn, user } = useAuth();

const welcomeMsg =
	user && user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back';

<div className='flex-none flex items-center'>
	{user && <p>{welcomeMsg}</p>}
</div>;
```

## Register

- Going to look much like `login`. We can move our Type into our types file

```ts
type RegisterFormState = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};
```

- And add our register fetch request

```ts
const register = async (formData: RegisterFormState): Promise<SuccessRes> => {
	const res = await fetch(`${authServiceURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(formData)
	});
	if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

	const data = (await res.json()) as SuccessRes;
	// console.log(data);

	return data;
};

export { login, me, logout, register };
```

### Add it to our AuthProvider

- make a new function to handle registering

```ts
const handleRegister = async (formState: RegisterFormState) => {
	await register(formState);
	setSignedIn(true);
	setCheckSession(true);
};

const value: AuthContextType = {
	signedIn,
	user,
	handleSignIn,
	handleSignOut,
	handleRegister
};
```

- update our type

```ts
type AuthContextType = {
	signedIn: boolean;
	user: User | null;
	handleSignIn: ({ email, password }: LoginData) => Promise<void>;
	handleSignOut: () => Promise<void>;
	handleRegister: (formState: RegisterFormState) => Promise<void>;
};
```

### Add logic to Register page

```ts
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'react-toastify';
import { useAuth } from '@/context';

const { signedIn, handleRegister } = useAuth();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	try {
		e.preventDefault();
		if (!firstName || !lastName || !email || !password || !confirmPassword)
			throw new Error('All fields are required');
		if (password !== confirmPassword) throw new Error('Passwords do not match');
		setLoading(true);
		// console.log(firstName, lastName, email, password, confirmPassword);
		// TODO: Implement registration logic
		await handleRegister({
			firstName,
			lastName,
			email,
			password,
			confirmPassword
		});
		toast.success('Registration successful');
	} catch (error: unknown) {
		const message = (error as { message: string }).message;
		toast.error(message);
	} finally {
		setLoading(false);
	}
};

if (signedIn) return <Navigate to='/create' />;
```

## Protect `create` page

- We also want it so that only authenticated users can visit the `create` page, so we create our `ProtectedLayout`

```ts
import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/context';

const ProtectedLayout = () => {
	const { signedIn } = useAuth();

	if (signedIn) {
		return <Outlet />;
	} else {
		return <Navigate to='/login' />;
	}
};

export default ProtectedLayout;
```

- re-export

```ts
export { default as RootLayout } from './RootLayout';
export { default as ProtectedLayout } from './ProtectedLayout';
```

- wrap our protected routes in it

```ts
import { BrowserRouter, Routes, Route } from 'react-router';
import { RootLayout, ProtectedLayout } from '@/layouts';
import { CreatePost, Home, Login, NotFound, Post, Register } from '@/pages';

const App = () => (
	<BrowserRouter>
		<Routes>
			<Route path='/' element={<RootLayout />}>
				<Route index element={<Home />} />
				<Route path='login' element={<Login />} />
				<Route path='register' element={<Register />} />
				<Route path='post/:id' element={<Post />} />
				<Route path='create' element={<ProtectedLayout />}>
					<Route index element={<CreatePost />} />
				</Route>
				<Route path='*' element={<NotFound />} />
			</Route>
		</Routes>
	</BrowserRouter>
);

export default App;
```

## Update `createPost`

- Now when we create a post, we want the author to come from our signed in user id, not from the form, so we remove the `author` property and input
- Instead, we get it from the signed in user we have in state

```ts
import { useAuth } from '@/context';
setLoading(true);
const newPost: Post = await createPost({
	title,
	image,
	content,
	author: user._id
});
setForm({ title: '', image: '', content: '' });
```

- If we try to post, we see that I have a bug in my solution for `hasRole`, but we can fix it. We only add the post if we have params

```ts
let post: InstanceType<typeof Post> | null = null;

if (id) {
	post = await Post.findById(id);

	if (!post)
		return next(new Error('Post not found', { cause: { status: 404 } }));
	req.post = post;
}
```

- Because of our `fetchInterceptor` credentials are included in the request

# Authorization

- We now want the ability for users to edit their posts, so we'll need fetch requests to hit the edit and delete endpoints (but you know how that works)
- We also want some conditional rendering to reflect if we are allowed to edit a post
- To simplify things a bit, we're not longer going to `populate` our posts, it's also not needed for our use case
- We can start by adding buttons to our PostCard component

```ts
const PostCard = ({ _id, content, image, title }: PostCardProps) => {
	return (
		<div className='card bg-base-100 shadow-xl'>
			<figure className='bg-white h-48'>
				<img src={image} alt={title} className='object-cover h-full w-full' />
			</figure>
			<div className='card-body h-56'>
				<h2 className='card-title'>{title}</h2>
				<p className='truncate text-wrap'>{content}</p>
				<Link to={`/post/${_id}`} className='btn btn-primary mt-4'>
					Read More
				</Link>
				<div className='card-actions justify-center gap-6'>
					<button className='btn btn-success'>Edit</button>

					<button className='btn btn-error'>Delete</button>
				</div>
			</div>
		</div>
	);
};
```

- We'll need to include the `author` now as well, to compare to our signed in user

```ts
<PostCard
	key={post._id}
	_id={post._id}
	content={post.content}
	image={post.image}
	title={post.title}
	author={post.author}
/>;

type PostCardProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
};
```

- Now how could we figure out the signed in user's id? How did we do it for creating a post?

```ts
{
	user?._id === author && (
		<div className='card-actions justify-center gap-6'>
			<button className='btn btn-success'>Edit</button>

			<button className='btn btn-error'>Delete</button>
		</div>
	);
}
```

## Edit Modal

- We now want, that when we click on the `Edit` button, it opens up a modal, where we can edit the form. We'll use the DaisyUI modal component
- Make the new component

```ts
const EditModal = () => {
	return (
		<dialog id={`edit-modal`} className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					{/* if there is a button in form, it will close the modal */}
					<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>Edit your post</h3>
			</div>
		</dialog>
	);
};

export default EditModal;
```

- re-export
- Add `onClick` to show the modal

```ts
{
	user?._id === author && (
		<div className='card-actions justify-center gap-6'>
			<button
				onClick={() =>
					document.querySelector<HTMLDialogElement>(`#edit-modal`)!.showModal()
				}
				className='btn btn-success'
			>
				Edit
			</button>
			<EditModal />

			<button className='btn btn-error'>Delete</button>
		</div>
	);
}
```

- We want a unique modal for each card, and to prepopulate the form with the current info, so we add the id as a suffix to the modal id, and pass all of the info via props

```ts
<button
							onClick={() =>
								document
									.querySelector<HTMLDialogElement>(`#edit-modal-${_id}`)!
									.showModal()
							}
							className='btn btn-success'
						>
							Edit
						</button>
						<EditModal
							_id={_id}
							image={image}
							title={title}
							content={content}
							author={author}
						/>
```

- Destructure those values, and pass them as an initial value to our form state

```ts
import { useState } from 'react';
type EditModalProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
};

const EditModal = ({ _id, content, image, title, author }: EditModalProps) => {
	const [{ newTitle, newImage, newContent }, setForm] = useState({
		newTitle: title,
		newImage: image,
		newContent: content
	});

	const handleChange = (e) =>
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	return (
		<dialog id={`edit-modal-${_id}`} className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					{/* if there is a button in form, it will close the modal */}
					<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>Edit your post</h3>
			</div>
		</dialog>
	);
};

export default EditModal;
```

- And create a controlled form

```ts
import { useState } from 'react';
type EditModalProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
};

const EditModal = ({ _id, content, image, title, author }: EditModalProps) => {
	const [{ newTitle, newImage, newContent }, setForm] = useState({
		newTitle: title,
		newImage: image,
		newContent: content
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	return (
		<dialog id={`edit-modal-${_id}`} className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					{/* if there is a button in form, it will close the modal */}
					<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>Edit your post</h3>
				<form className='md:w-1/2 mx-auto flex flex-col gap-3'>
					<div className='flex gap-2 justify-between'>
						<label className='form-control grow'>
							<div className='label-text'>Title</div>
							<input
								name='newTitle'
								value={newTitle}
								onChange={handleChange}
								placeholder='A title for your post...'
								className='input input-bordered w-full'
							/>
						</label>
					</div>
					<label className='form-control w-full'>
						<div className='label-text'>Image URL</div>
						<input
							name='newImage'
							value={newImage}
							onChange={handleChange}
							placeholder='The URL of an image for your post...'
							className='input input-bordered w-full'
						/>
					</label>
					<label className='form-control'>
						<div className='label-text'>Content</div>
						<textarea
							name='newContent'
							value={newContent}
							onChange={handleChange}
							className='textarea textarea-bordered h-24'
							placeholder='The content of your post...'
						></textarea>
					</label>

					<button className='btn btn-primary self-center'>Edit Post</button>
				</form>
			</div>
		</dialog>
	);
};

export default EditModal;
```

- We want when we click, that we get asked for confirmation, we can control that with a piece of state

```ts
{
	!isConfirmed ? (
		<button
			onClick={() => setIsConfirmed(true)}
			className='btn btn-primary self-center'
		>
			Edit Post
		</button>
	) : (
		<>
			<p>Are you sure?</p>

			<button type='submit' className='btn btn-success'>
				Confirm
			</button>
		</>
	);
}
```

- add in a submit handler, and a loading state

```ts
const [loading, setLoading] = useState(false);
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	try {
		e.preventDefault();

		if (!newTitle || !newImage || !newContent)
			throw new Error('All fields are required');
		setLoading(true);
	} catch (error) {
		const message = (error as { message: string }).message;
		toast.error(message);
	} finally {
		setIsConfirmed(false);
		setLoading(false);
		document.querySelector<HTMLDialogElement>(`#edit-modal-${_id}`)!.close();
	}
};
<form
	onSubmit={handleSubmit}
	className='md:w-1/2 mx-auto flex flex-col gap-3'
></form>;
```

- create out edit fetch request
  - our API is giving a message property, so we can use that in our error handling

```ts
export const updatePost = async (
	id: string,
	formData: PostData
): Promise<Post> => {
	const res = await fetch(`${baseURL}/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(formData)
	});
	if (!res.ok) {
		const errorData = await res.json();
		if (!errorData.message) {
			throw new Error('An error occurred while updating the post');
		}
		throw new Error(errorData.message);
	}
	const data = await res.json();
	return data;
};
```

- re-export

```ts
export * from './posts';
export * from './auth';
```

- import and call in submit handler

```ts
import { updatePost } from '@/data';
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	try {
		e.preventDefault();

		if (!newTitle || !newImage || !newContent)
			throw new Error('All fields are required');
		setLoading(true);
		await updatePost(_id, {
			title: newTitle,
			author,
			image: newImage,
			content: newContent
		});
	} catch (error) {
		const message = (error as { message: string }).message;
		toast.error(message);
	} finally {
		setIsConfirmed(false);
		setLoading(false);
		document.querySelector<HTMLDialogElement>(`#edit-modal-${_id}`)!.close();
	}
};
```

- Now we can only see the new results when we refresh the page, so we'll need to update our state, which means we'll need to pass the setter down
- Home.tsx

```ts
{
	posts.map((post) => (
		<PostCard
			key={post._id}
			_id={post._id}
			content={post.content}
			image={post.image}
			title={post.title}
			author={post.author}
			setPosts={setPosts}
		/>
	));
}
```

- PostCard.tsx

```ts
import type { Dispatch, SetStateAction } from 'react';
type PostCardProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
	setPosts: Dispatch<SetStateAction<Post[]>>;
};
const PostCard = ({
	_id,
	content,
	image,
	title,
	author,
	setPosts
}: PostCardProps) => {
	return (
		<EditModal
			_id={_id}
			image={image}
			title={title}
			content={content}
			author={author}
			setPosts={setPosts}
		/>
	);
};
```

- EditModal.tsx
  - We iterate over our `prev` state, and replace the updated post

```ts
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
type EditModalProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
	setPosts: Dispatch<SetStateAction<Post[]>>;
};

const EditModal = ({
	_id,
	content,
	image,
	title,
	author,
	setPosts
}: EditModalProps) => {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();

			if (!newTitle || !newImage || !newContent)
				throw new Error('All fields are required');
			setLoading(true);
			const updatedPost = await updatePost(_id, {
				title: newTitle,
				author,
				image: newImage,
				content: newContent
			});
			setPosts((prev) =>
				prev.map((post) => (post._id === _id ? updatedPost : post))
			);
		} catch (error) {
			const message = (error as { message: string }).message;
			toast.error(message);
		} finally {
			setIsConfirmed(false);
			setLoading(false);
			document.querySelector<HTMLDialogElement>(`#edit-modal-${_id}`)!.close();
		}
	};
};
```

## Delete Modal

- We can go through much the same process with the delete modal, we'll even add in a fancy check to confirm deletion

```ts
import { useState } from 'react';
import { toast } from 'react-toastify';

type DeleteModalProps = {
	_id: string;
	setPosts: SetPosts;
};

const DeleteModal = ({ _id, setPosts }: DeleteModalProps) => {
	const [value, setValue] = useState('');
	const [isValid, setIsValid] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			console.log('Delete!');
		} catch (error) {
			const message = (error as { message: string }).message;
			toast.error(message);
		} finally {
			setValue('');
			document
				.querySelector<HTMLDialogElement>(`#delete-modal-${_id}`)!
				.close();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		if (e.target.value === 'DELETE') {
			setIsValid(true);
		} else {
			setIsValid(false);
		}
	};
	return (
		<dialog id={`delete-modal-${_id}`} className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					{/* if there is a button in form, it will close the modal */}
					<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>
					Are you sure you want to delete? This action is permanent
				</h3>
				<form
					onSubmit={handleSubmit}
					className='flex flex-col items-center mt-2'
				>
					<label className='form-control w-full max-w-xs'>
						<input
							type='text'
							placeholder='Type here'
							className={`input input-bordered w-full max-w-xs ${
								isValid ? '' : 'input-error'
							}`}
							value={value}
							onChange={handleChange}
						/>
						<div className='label'>
							<span className='label-text-alt'>Type DELETE to confirm</span>
						</div>
					</label>
					<button
						disabled={!isValid || value === ''}
						className='btn btn-error self-end'
					>
						Delete
					</button>
				</form>
			</div>
		</dialog>
	);
};

export default DeleteModal;
```

- re-export
- import and use in `PostCard`

```ts
	<button
							onClick={() =>
								document
									.querySelector<HTMLDialogElement>(`#delete-modal-${_id}`)!
									.showModal()
							}
							className='btn btn-error'
						>
							Delete
						</button>
						<DeleteModal _id={_id} setPosts={setPosts} />

```

- make the new delete fetch request

```ts
export const deletePost = async (id: string) => {
	const res = await fetch(`${baseURL}/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) {
		const errorData = await res.json();
		if (!errorData.message) {
			throw new Error('An error occurred while updating the post');
		}
		throw new Error(errorData.message);
	}
	const data = await res.json();
	return data;
};
```

- Import and use it, and then update our state too

```ts
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	e.preventDefault();
	try {
		// console.log('Delete!');
		await deletePost(_id);
		setPosts((prev) => prev.filter((post) => post._id !== _id));
	} catch (error) {
		const message = (error as { message: string }).message;
		toast.error(message);
	} finally {
		setValue('');
		document.querySelector<HTMLDialogElement>(`#delete-modal-${_id}`)!.close();
	}
};
```

- And there we have it!
