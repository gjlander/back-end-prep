# Streaming Responses

- Thus far, we've been sending back a JSON response, just like any other API endpoint that we've made. As you may have noticed, this can be a little slow sometimes, since the AI needs time to "think"
- You can make a nice loading UI, but most AI Chat bots send things back in a few words at a time
  - [Gemini](https://gemini.google.com/)
  - [GhatGPT](https://chatgpt.com/)
- In order to create this effect, they are streaming their response

## Streaming and [SSE](https://learn.wbscodingschool.com/courses/full-stack-web-app/lessons/%f0%9f%97%9e%ef%b8%8f-server-sent-events-sse/)

- Instead of processing the whole message on the server, and sending the full thing back, with streaming (more specifically Server-Sent events), the connection stays open, and the server continues to send pieces as they come
- Server-Sent Events follow a specific standardized format that we'll look into as we implement this

## Adding streaming to `createChat`

- Let's add a `stream` option to our `createChat` endpoint
- We first need to add it to our Zod schema

```js
export const userMessageSchema = z.object({
  message: z.string().min(1, 'Must have a message'),
  stream: z.boolean().default(false),
  chatId: z.string().length(24).nullish()
});
```

- Then destructure it in `createChat`

```js
const { message, chatId, stream } = req.sanitizedBody;
```

- Everything up until sending the message will remain the same, from there we'll add an if check

```js
if (stream) {
  // process stream
} else {
  const aiResponse = await chat.sendMessage({ message });

  // add AI message to database history
  currentChat.history.push({
    role: 'model',
    parts: [{ text: aiResponse.text }]
  });

  await currentChat.save();

  res.json({ aiResponse: aiResponse.text, chatId: currentChat._id });
}
```

- Now if we hit the endpoint with streaming set to false (or left out), it behaves just as before

## Processing the stream

- first, we send message as stream from Gemini

```js
const aiResponse = await chat.sendMessageStream({ message });
```

- From here, we go a bit low level, and use some of the vanilla node methods we saw in the HTTP module, specifically `writeHead`. This is how we will set the headers
  - status `200`
  - `Connection: 'keep alive`: don't close the connection right away
  - don't cache data here
  - content no longer `json` but `text/event-stream`

```js
res.writeHead(200, {
  Connection: 'keep-alive',
  'Cache-Control': 'no-cache',
  'Content-Type': 'text/event-stream'
});
```

- From here, let's visit the [Gemini docs](https://ai.google.dev/gemini-api/docs/text-generation#multi-turn-conversations) to see how they handle the streamed response
- We see them using `for await`, we've seen `for of` loops, and we've seen `await`, but this is the first time seeing it together
  - It allows us to resolve the promise of each `chunk` (which is the common term for each piece that is coming in the stream)
- So we can use a `for of` loop to process each chunk as it comes, let's for now just log it as they do

```js
for await (const chunk of aiResponse) {
  console.log(chunk.text);
  console.log('_'.repeat(80));
}
```

- If we hit the endpoint with `stream: true` we see each chunk as it comes!
- Now if we have an empty string, we can collect the entire response

```js
let fullResponse = '';
for await (const chunk of aiResponse) {
  console.log(chunk.text);
  console.log('_'.repeat(80));
  fullResponse += chunk.text;
}
console.log(fullResponse);
```

- We can then add this full response to our database history
  - After some trial and error I found that Gemini adds each chunk as an individual message, which is not what we want, so that's why we do it manually

```js
currentChat.history.push({
  role: 'model',
  parts: [{ text: fullResponse }]
});
```

## Formatting our response to SSE standards

- Now we want to send each chunk of text in the response as it comes, for that we will stream, and follow the SEE standards
- This requires us to preface each line with `data: ` and end it with 2 lines breaks: `\n\n`
- In order to properly format the response, we will still use JSON in between for the actual data
- We use the `res.write` method to send each piece

```js
for await (const chunk of aiResponse) {
  // console.log(chunk.text);
  // console.log('_'.repeat(80));
  res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
  fullResponse += chunk.text;
}
```

- Now if we hit the endpoint in Postman, we can see each chunk coming through as JSON. Nice!

### Including the chatId

- But, if you remember, we also need to include the `chatId`. So once our stream is done, we can send another chunk with the chatId

```js
res.write(`data: ${JSON.stringify({ chatId: currentChat._id })}\n\n`);
```

- Now we're done, so we can close the connection

```js
res.end();
```

- Once the connection is ended, either intentionally (because we've sent all of the data) or accidentally (use navigated away from the page midstream, or the connection was interrupted) we want to handle that
- For that, we use `res.on('close')`, then pass a callback as the second argument. Here is when we will now save the new chat
  - we also make sure that the connection won't be left dangling by adding `res.end()` here as well

```js
res.on('close', async () => {
  await currentChat.save();
  res.end();
});
```

- Now if we ping the endpoint, and check the database: and we see the whole streaming response saved as one message in the history - and we're ready to move to the frontend!

## Processing SSE with Fetch

- Let's add a streaming option to our form. For that we'll need
  - a checkbox input
  - state to control the input
  - a change handler
- Let's first make our state - it will be a boolean for the `checked` property of the checkbox

```js
const [isStream, setIsStream] = useState(false);
```

- And a function to toggle it from true to false and back

```js
const toggleChecked = () => setIsStream(prev => !prev);
```

- And we can use a daisyUI checkbox, and control the input
- We also need to add it to the body of our request

```js
const response = await createChat({ message: prompt, chatId, stream: isStream });
```

### Adding a `fetchChat` function

- For our streaming option, we want the initial response object, so let's extract that piece, and use that in `createChat`, then export it to use if we're streaming

```js
const fetchChat = async body => {
  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    // If the response is not ok, throw an error by parsing the JSON response
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }

  return response;
};

const createChat = async body => {
  const response = await fetchChat(body);

  const data = await response.json();

  return data;
};

export { createChat, getChatHistory, fetchChat };
```

- And then import our new function

```js
import { createChat, fetchChat } from '../data/gemini';
```

### Structuring the streamed response

- Just as in the backend, let's have an if statement to handle things differently based on if we are streaming - for this we'll use our `isStream` state

```js
if (isStream) {
  //process stream
} else {
  const response = await createChat({ message: prompt, chatId, stream: isStream });
  const asstMsg = {
    _id: crypto.randomUUID(),
    parts: [{ text: response.aiResponse }],
    role: 'model'
  };
  setPrompt('');
  setMessages(prev => [...prev, asstMsg]);
  localStorage.setItem('chatId', response.chatId);
  setChatId(chatId);
}
```

- This is gonna get messy, but we can reduce some repetition by declaring `asstMsg` before the if statement, then updating it as needed

```js
setMessages(prev => [...prev, userMsg]);
const asstMsg = {
  _id: crypto.randomUUID(),
  parts: [{ text: '' }],
  role: 'model'
};

if (isStream) {
  //process stream
} else {
  const response = await createChat({ message: prompt, chatId, stream: isStream });
  asstMsg.parts[0].text = response.aiResponse;
  setPrompt('');
  setMessages(prev => [...prev, asstMsg]);
  localStorage.setItem('chatId', response.chatId);
  setChatId(chatId);
}
```

- Now, if stream is true, let's use `fetchChat` to work directly with the `response` object as it comes in

```js
const res = await fetchChat({ message: prompt, stream: true, chatId });
console.log(res);
```

- Since we haven't written any code to handle the stream, we don't see anything in the UI, but in the network tab we can see a continuous stream of information
- Compare this to the json response where it all comes at once

### Handling the stream

- If we `console.log()` the response object, we can see that meta data we've been getting
- You'll notice the body is a `readable stream`. We've seen that before, now we can work with it.
- If we look at the Prototype, there's a body property. And this body property has a method called `getReader`. This creates a reader object that will lock into the stream, and allow us to, well, read it

```js
const reader = res.body.getReader();
```

- This reader has a .read() method that returns a promise, so we await it, and get our result

```js
const result = await reader.read();
console.log('result: ', result);
```

- If we log the result, we can see a few things that our interesting
  - there is a `done` property that is a boolean. This will tell us if the stream is done
  - the value property is this array of numbers. We see it's called "Uint8Array"
- We'll take more about the value property in a second, but this false property tells us that the stream isn't done. There's more coming.
- Right now we are only processing the first chunk, we want to repeat this logic for every chunk, until this property comes back as true
- Because we know we have a `done` property and a `value`, we can destructure them

```js
const { done, value } = await reader.read();
console.log('done, value ', done, value);
```

- Right now we are only processing the first chunk, we want to repeat this logic for every chunk, until this property comes back as true
- We can create an infinite loop by setting `while (true)`, and then `break` out when we're done - the last chunk will have `done: true`
  - This isn't a pattern we've worked with much, but it's commonly used in SE
  - If we move the log below the break, we don't ever see the `true` result since we `break` out of the loop

```js
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('done, value ', done, value);
}
```

- Now we're processing every chunk, but it's not in readable format yet
- Luckily JS has a built in `TextDecoder` we can use to, well, decode this`

```js
const decoder = new TextDecoder();
```

- This decoder has an aptly named decode method that will take 2 arguments
  - The value to decode
  - an object to tell it that this is a stream, so data will come in chunks

```js
const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // console.log('done, value ', done, value);
  const chunk = decoder.decode(value, { stream: true });
  console.log(chunk);
}
```

- From here we can see we're getting a string that always starts with `data: `
- What maybe isn't super clear, is that we still have the `\\n\\n` at the end. And it's hard to manufacture, but sometimes we get 2 chunks together in a single trunk
- What we can do, is `split` the string based on the line breaks to get each line

```js
const lines = chunk.split('\n');
console.log('lines: ', lines);
```

- We mostly get an array with 3 items
  - 1 with the data
  - 2 for the line breaks at the end
- But this isn't ALWAYS the case, and believe me, I spent hours trying to find a simpler way to process the string, but because it SOMETIMES has multiple chunks at once, this is what we're left with

- What can now do is iterate over the lines array, and if it starts with `data: ` we know it's a chunk to process
  - And that after the `data: ` will be JSON

```js
lines.forEach(line => {
  // Check if the line starts with data:, that's how Open AI sends the data
  if (line.startsWith('data:')) {
    // Get the JSON string without the data: prefix
    const jsonStr = line.replace('data:', '');
    const data = JSON.parse(jsonStr);
    console.log(data);
  }
});
```

- Now we have some JS objects we can work with!
- We can see we either get an object with a `text` property or a `chatId` property. We can use that in our `if` statement to either
  - update our `chatId` state, and add it to local storage
  - or update our messages state
- When updating the messages state, we need to either
  - make a new message if one doesn't exist
  - add it to an existing message to it will continue to build up

#### That's for you to accomplish! Building off of your current chatbot, add an option for streaming, and properly update the UI
