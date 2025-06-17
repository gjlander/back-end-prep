# Events API Kick-off

## Points to cover

-   Fetch options
-   Authentication/Authorization
-   -   Signing in and saving a token
-   -   Protecting routes

#### Let's see what this would look like in the frontend now

## Tour of the app

-   This is modified from our `useOutletContext-example`

### App.jsx

-   I added `SignIn`, `Register` `NotFound` pages. The \* for the `NotFound` path acts as a wildcard, so basically anything that isn't a defined path will use that
-   Show what the pages look like
    -   Sign In button is now a Link to signin page
    -   handleSignOut has some additional logic

### MainLayout.jsx

-   We have added 2 pieces of state. One to hold the user data when we have it, and a boolean that defaults to true, telling us if we should revalidate the user session
-   We'll also pass the user state and setter to our Navbar so we can display a welcome message, and sign them out

```js
const MainLayout = () => {
    // signedIn state is used in the Navbar, and by the MyPond page, so we define it in the layout
    const [signedIn, setSignedIn] = useState(false);
    const [user, setUser] = useState();
    const [checkSession, setCheckSession] = useState(true);
    return (
        <div className='bg-slate-600 text-gray-300 flex flex-col min-h-screen'>
            <Navbar
                signedIn={signedIn}
                setSignedIn={setSignedIn}
                user={user}
                setUser={setUser}
            />
            <main className='flex-grow flex flex-col justify-between py-4'>
                <Outlet
                    context={{
                        signedIn,
                        setSignedIn,
                        user,
                        setUser,
                        setCheckSession,
                    }}
                />
            </main>
            <Footer />
        </div>
    );
};
```

### SignIn.jsx

-   We have a form state, and deconstruct the values. We can shorten that, by doing it directly when we define the state

```js
const [{ email, password }, setForm] = useState({
    email: '',
    password: '',
});
```

-   We also have a loading state to prevent multiple submissions while we're still waiting for a response
-   We have our change handler to control our inputs, as always
-   handleSubmit
    -   async, so we can await inside of it
    -   inside of try, we prevent default as always
    -   Validation to make sure no fields are empty
    -   If we pass validation, set loading to true, and for now just log our input values
    -   In catch, for now just consoling the error
    -   finally is something we haven't used much. This will run even if the catch block happens. So the last thing, no matter what, is to set loading to false again
-   To prevent resubmitting while loading, our button is disabled while loading is true
-   Register page looks very similar

## Sign In - from Postman to Frontend

-   Show signing in Susan Storm in Postman

    -   Note again the token we get in the response

-   To achieve the same result in our app, we'll have to write a function
-   In our `data` folder, let's make a new `auth.js` file, for our functions related to authentication
    -   We could technically add these to our `ducks.js` folder, but this organization works for my brain

### Options object in fetch

-   With GET requests, we can usually get away with just passing the URL endpoint to fetch, but there is an optional second argument
-   This second argument is an object for configuring your request, you saw this when working with TMDB
-   It allows us to
-   specify the HTTP method: ` method: 'POST',`
-   add headers: `headers: {
    'Content-Type': 'application/json',
},`
-   add info to the body: `body: JSON.stringify(formData),` (note we have to stringify it into JSON)
-   and more...

```js
const BASE_URL = 'https://duckpond-89zn.onrender.com/auth';

const signIn = async (formData) => {
    const res = await fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

    const data = await res.json();
    // console.log(data);

    return data;
};

export { signIn };
```

-   Now we import it to our SignIn page, and use it in our submit handler

```js
import { signIn } from '../data/auth';
// other stuff...

const handleSubmit = async (e) => {
    try {
        e.preventDefault();

        if (!email || !password) throw new Error('All fields are required');

        setLoading(true);

        console.log(email, password);

        const signInRes = await signIn({ email, password });

        console.log(signInRes);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};
```

-   We can see we get exactly the same response we got in Postman.

#### Now what do we do with it?

-   In Postman, we just copy/pasted the token and added it the the Headers of our Create Duck request. In our app, we'll need a couple more steps

## Authentication in the frontend

-   Our first step is to save the token in local storage, so that if the user came back to our site later they would stay signed in (because the token is a string, we don't need to stringify)
-   We also update our signed in state, and tell the app we need to check the session again

```js
//in handleSubmit
console.log(signInRes);
localStorage.setItem('token', signInRes.token);
setSignedIn(true);
setCheckSession(true);
setForm({
    email: '',
    password: '',
});
```

## Getting user profile

-   Once the token has been created, the next step is to get the actual user profile
-   By convention, this endpoint is often called `me`, though in the events-api, this would be the `profile` endpoint
-   Make request in Postman. Note in the response we don't send the user's password.

### Getting me in our app

-   A second function in `auth.js`

```js
const me = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

    const data = await res.json();
    // console.log(data);

    return data;
};
```

-   Now we back in MainLayout.jsx, we can put this in a useEffect, and call it any time we want to check the session

```js
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

```js
//inside submit handler
const signInRes = await signIn({ email, password });

console.log(signInRes);
localStorage.setItem('token', signInRes.token);

const userData = await me();

console.log(userData);

setForm({
    email: '',
    password: '',
});
```

-   Now in our MainLayout, let's add a state for our user, and pass it to the context

```js
const MainLayout = () => {
    // signedIn state is used in the Navbar, and by the MyPond page, so we define it in the layout
    const [signedIn, setSignedIn] = useState(false);
    const [user, setUser] = useState();
    return (
        <div className='bg-slate-600 text-gray-300 flex flex-col min-h-screen'>
            <Navbar signedIn={signedIn} setSignedIn={setSignedIn} />
            <main className='flex-grow flex flex-col justify-between py-4'>
                <Outlet context={{ signedIn, setSignedIn, user, setUser }} />
            </main>
            <Footer />
        </div>
    );
};
```

-   Now getUser() will always run the first time you visit the page, and if a user signs in.

-   To sign out, you simply update the needed state, and remove the token from local storage

```js
const handleSignOut = () => {
    localStorage.removeItem('token');
    setSignedIn(false);
    setUser(null);
    setTimeout(() => {
        navigate('/');
    }, 1000);
};
```

## Protected Routes

-   The LMS has an article on protected layouts, I want to demo a possible execution of this
-   Only a signed in user can make a new duck. We have protected this endpoint on the backend, but we want to prevent users from even seeing the MyPond Page if they're not signed in
-   First we can conditionally render it, so it only appears when a user is signed in

```js
{
    signedIn ? (
        <>
            <li>
                <NavLink to='/mypond'>My Pond</NavLink>
            </li>
            <li>
                <button className='btn btn-primary' onClick={handleSignOut}>
                    Sign Out
                </button>
            </li>
        </>
    ) : (
        <li>
            <Link to='/signin'>
                <button
                    className='btn btn-primary'
                    // onClick={handleSignIn}
                >
                    Sign In
                </button>
            </Link>
        </li>
    );
}
```

-   But it's still accessible if some were to manually type the URL
-   We have some protection here already, but instead of text, we could simply redirect the user to the signin page by using react-router `<Navigate>` component
-   It works similar to the Link component, but simply redirects right away

```js
if (!signedIn) return <Navigate to='/signin' />;
```

-   Now if someone signed out happens upon the page, they get redirected.
-   This can be done with pages, or entire layouts
-   On our signin page we can do the opposite. If we are signed in, the redirect to mypond

```js
if (signedIn) return <Navigate to='/mypond' />;
```

## Events API Docs

-   You had a chance to familiarize yourself with the events api yesterday, but I want to cover a couple of things in the docs
-   You can also paste the toke into the `Authorize` button on the top right. Then in the docs themselves you can also test out endpoints
-   The docs also tell you what's required, and give demonstrations of each end point
