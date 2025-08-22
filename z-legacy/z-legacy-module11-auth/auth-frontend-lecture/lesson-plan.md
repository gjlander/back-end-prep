# Authentication Frontend Flow

- Add origin and credentials to CORS
- include credentials in fetch

## You open the app

- Go to duck pond site

## If you are not logged in, you log in

- With valid credentials, redirect to dashboard
  - In our case `myPond`
- Conditional rendering to show Allowed pages, and

## If you are authenticated, you can make a new post, edit a post etc

- If I'm not signed in, even if I try to go to this page by manually typing thr URL, I get redirected
- This example uses local storage to save the token, then adds it in the headers, with a cookie will look slightly different

## Authentication State

- Go through Article, then move through exercise
- Show examples from duckpond as working through

# Cookie considerations (move to travel journal repo)

- Because we are working with cookies, we have a couple of extra considerations to protect from CSRF
- In our API, we are using CORS, and currently origin is set to `*`

```js
app.use(cors({ origin: '*' }));
```

- This is the same as writing `cors()`, and it means that we allow cross-site requests from any origin, meaning any website could interact with our API
- Now that we are sending cookies, we don't want that, we only want requests from our frontend domain to work
- We store this as an env variable, and import it
  - In development this is our local host, in production you'd change this variable to the URL of your deployed frontend

```
SPA_Origin=http://localhost:5173
```

```js
app.use(cors({ origin: process.env.SPA_ORIGIN }));
```

- We also need to be able to pass credentials (our JWT)

```js
app.use(cors({ origin: process.env.SPA_ORIGIN, credentials: true }));
```

- Make sure to update your API with these changes, or you'll run into errors

### Include credentials in frontend

- getting the token from local storage looked like this
  - We have to manually retrieve it, and set it in the headers

```js
const me = async () => {
  const token = localStorage.getItem('token');

  if (!token) throw new Error(`Failed to sign in. Please try again.`);

  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

  const data = await res.json();
  // console.log(data);

  return data;
};
```

- With a cookie, we simply add an option to to configuration to include credentials

```js
const me = async () => {
  const res = await fetch(`${BASE_URL}/me`, {
    credentials: 'include'
  });

  if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

  const data = await res.json();
  // console.log(data);

  return data;
};
```

- There are some other subtle differences in application, and the exercise has you add some additional improvements not found in the original example, but I think this gives you a rough guide to follow along with the instructions for the exercise

## Bonus: Authorization

- This is optional but encouraged. If you manage to finish the Auth frontend exercise, this is a good addition.
- It's all conditional rendering, and things you've worked with before - recycle/reference code from older group work
- Depending on how the checkpoint goes, we can include this in the correction, but either way, I will post a possible solution after the correction
