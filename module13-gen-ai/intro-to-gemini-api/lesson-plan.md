# Intro to Gemini API

## Simple server tour

### `package.json`

- Nothing new here just had to add the Gemini SDK library

### `index.js`

- Same basic setup as always, here we have our `chatRouter`

### `chatRouter.js`

- We have our 2 `POST` requests, and a `GET` requests
  - `POST` requests have Zod validation

## Chat controllers

- Where things get interesting is in the controllers
- We import `GoogleGenAI` and create an instance of it using our API key
- We also store the model and systemInstruction in variables
  - For the free tier we'll stick with this model
  - Changing the system instruction is how you change the behaviour of the AI

### `createSimpleChat`

- We destructure the message, as always

```js
const { message } = req.sanitizedBody;
```

- We have a `history` variable to simulate previous messages in the chat history. Important to note here is the structure
  - `role`: either `user` or `model` tells who the message is from, you or the AI
  - `parts`: an array of objects that have a `text` property
    - In working with the text generation API, I've never seen more than one part. I can imagine with other APIs, this could be different

```js
let history = [
  {
    role: 'user',
    parts: [{ text: 'Hello' }]
  },
  {
    role: 'model',
    parts: [{ text: 'Great to meet you. What would you like to know?' }]
  }
];
```

- here is where we create the chat itself
  - it needs the model, history, and config (see again we have a config or options object)

```js
const chat = ai.chats.create({
  model,
  history,
  config: {
    systemInstruction
  }
});
```

- We use the `sendMessage` method, and send our user message, the `aiResponse` gets saved in a variable

```js
const aiResponse = await chat.sendMessage({ message });
```

- The Gemini SDK includes a convenient `getHistory()` method we can use to update our `history` variable with the full history
  - Because this is stored in a variable, that means it's only in memory, so if the server stops, this gets reset

```js
history = chat.getHistory();
```

- We still send back a JSON response, using the `text` property of the `aiResponse`

```js
res.json({ aiResponse: aiResponse.text });
```

- All of this is built and modified from examples in the documentation

## Getting to know the [Gemini docs](https://ai.google.dev/gemini-api/docs)

- Always good to start with the `overview`. They give a basic version in several programming languages
- If we move on to the `quickstart` we get a bit more information, like what to install
  - From there we follow "What's next" to `Text generation`

### Text generation

- We see the same basic example again

#### System instructions and configurations

- Here we see how to add the `systemInstruction`
- There are other options as well, we won't cover them, but they are options for further exploration if you decide to continue working with this API

#### Multimodal inputs

- Here we can see how to upload files as well, again outside the scope of today, but we can see how to work with their API, with working code snippets

#### Streaming responses

- We'll cover this later, but this is how you get that snappy few-words-at-a-time response

#### Multi-turn conversations (Chat)

- Now we see where I got my inspiration from for the API
- We have the `chats.create()` method
  - I just extracted the values as variables

#### SDK reference

- Finding out more takes little more digging
- If we go to `API Reference` we see `SDK references` on the side
- No JS option, so let's go to TS
- under `Chat` we see the methods available, snd some documentation of how the whole thing works, including the `getHistory` method

### Let's play around with this endpoint for a bit

## `createChat`

- Now we're moving from memory storage to an actual database
- We destructure `chatId` now as well

```js
const { message, chatId } = req.sanitizedBody;
```

- Now we query the database for that chat, we store it in `let` so we can update it if now chat is found

```js
let currentChat = await Chat.findById(chatId);
```

- Now instead of validating if `chatId` was passed, and separately if `chatId` was a valid ObjectId, and again if no chat came back, we consolidate that into one check
  - Did `Chat.findById` give us a chat? If not, create one
  - This could be a place to optimize if we ran into performance issues, but for now this is good enough

```js
if (!currentChat) {
  currentChat = await Chat.create({});
}
```

- Now instead of relying on Gemini's `getHistory()` method, we are manually pushing the user message on to our database chat history
  - We still model it after their structure, but now we have more granular control over how it is shaped in our database

```js
currentChat.history.push({
  role: 'user',
  parts: [{ text: message }]
});
```

- Let's diverge here to look at the `Chat` model

  - Nothing crazy, just a `history` property that is an array of messages
  - We use `enum` to ensure we only get `user` or `model`

- I'll admit this took some trial and error, but because `findById` returns an instance of the `Document` class from Mongoose, Gemini doesn't like it
  - One way to `serialize`, or make a deep clone that is a plain JS object is to `stringify` and then `parse`
  - As noted, this gives us the same result as the `lean` option would, but since we later need to save, that won't work for us here

```js
const chat = ai.chats.create({
  model,
  // stringifying and then parsing is like using .lean(). It will turn currentChat into a plain JavaScript Object
  // We don't use .lean(), because we later need to .save()
  history: JSON.parse(JSON.stringify(currentChat.history)),
  config: {
    systemInstruction
  }
});
```

- Sending the message is the same
- We then manually add the AI message to our database history, and save it

```js
// add AI message to database history
currentChat.history.push({
  role: 'model',
  parts: [{ text: aiResponse.text }]
});

await currentChat.save();
```

- In our response, we add a `chatId`

```js
res.json({ aiResponse: aiResponse.text, chatId: currentChat._id });
```

#### Let's play around a bit, and see what gets stored now

## `getChatHistory`

- Nothing exciting here, let's test the endpoint
- This endpoint means that we can have persistence with the chat. A user could refresh the page, and not lose their chat history

# Your task: use the API to build a Chatbot with React

- Go over README and starter repo, ask for questions
- Go to DaisyUI docs
- Run server and show current version
