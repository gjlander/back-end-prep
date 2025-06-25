# TS Workshop

## Outline

- What is TS and why to use it
- Installing TS globally to experimenting
  - note projects should install it for versioning
- TSC and transpiling to JS
- The basic TS types
- Typing functions
- Intro to config file
- Intro to working with packages

## The What and Why of TS

### What

- JS is a dynamically type language. This means, when you declare a variable, you do not define it's type, and you can reassign it later. So JS has no issues with the following:

```js
let num = 6;

num = 'Not anymore!';
```

- Not all programming languages are like this, in fact many aren't. They require you do declare what type the variable is when you declare it, and will throw an error if you try to reassign it. This (along with some other features) is what TS adds to JS ad shown in the [docs](https://www.typescriptlang.org/)

- This makes TS a superset of JS, it doesn't remove anything from JS, only adds. And in fact, gets compiled (or technically transpiled) into JS

### Why

- TS is designed to help us write cleaner code to catch potential bugs as we write our code. It throws errors during development, so we don't get runtime errors (errors that don't appear in our code, but will cause our app to crash)
- If we try to use an array method on our `num` variable, JS won't say anything is wrong, but during runtime we see this code in fact doesn't work. This will give us an `Uncaught TypeError`

```js
num.forEach(element => {
  console.log(element);
});
```

## Adding in TS

- To work with TS, the first thing we need to do is install it. It is an `npm` package, and should normally be installed on a per-project basis, for correct versioning, but for learning and experimenting purposes, you can also install it globally
  `npm install -g typescript`
- Then we change our `js` to `ts` and already we see some errors popping up in our code
  - `number not assignable to string`
  - `forEach does not exist on type number`
- It's important to note that TS cannot run in the browser, only JS, so we must compile our TS into JS. At a basic level, we can do that with the `tsc` command
- Since we still have errors, when we try to compile we see those errors in the terminal, and the compilation will fail (this is default behaviour that we can later customize)
- For now, let's just comment out the errors, and see what resulting JS we get

### Compiled JS

- What do you notice about our JS file?
- It's using `var`, it defaults to older JS version to be compatible with older browsers (we can also change this later)
- This is the file that we need to connect to with our script tag
- Similar to node, we can use the `--watch` flag to not have to constantly recompile

## Types in TS

### Primitive Types

- TS has all of the primitive JS types (remember JS does HAVE types). You can explicitly type a variable when you declare it. What are the JS types?
- string

```js
let myString: string = 'This is a string';
```

- number

```js
let num: number = 6;
```

- boolean

```js
let bool: boolean = false;
```

- null

```js
let nullVar: null = null;
```

- undefined

```js
let undef: undefined;
```

- TS also has an `any` type, which basically brings it back to being dynamically typed like in JS

```js
let anything: any = 'This can be reassigned';

anything = 42;
```

### Complex types

- You can declare an array of types by simply adding the `[]`

```js
const numArray: number[] = [1, 2, 3, 4];

numArray.push('4');
```

- You can also define the shape of an object

```js
const person: { name: string, age: number } = {
  name: 'Steve',
  age: 72
};

person.name = 54;
```

- For reusability, you can also extract that and declare a type. Then if you try to add a property not on that type you get an error

```js
type Person = { name: string; age: number };

const person: Person = {
  name: 'Steve',
  age: 72
  lastName: 'Rogers'
};
```

- And if we peak back at our JS file, we see all of those type declarations get stripped away
- TS does add some additional types, but they're about more theoretical and outside of the scope of today's workshop

### Implicit vs Explicit typing

- The nice thing is that TS is actually pretty smart about figuring out what type a variable should be. So best practice is to let TS figure it out, and only explicitly type as needed
- And VS Code offers help as well, when we hover

```js
let myString = 'This is a string';
let num = 6;
let bool = false;
let nullVar = null;
```

- But sometimes TS gets it wrong, for `undef` it will see it implicitly as `any`, because it has no idea what type you'll give it later. So if we want it to be `undefined` we have to state it explicitly

```js
let undef;
```

- Similarly with `anything`, it will implicitly type it to a string, so if we want it to be `any` we have to be explicit

  - We would normally want to avoid `any`, but there are use cases for it

- Similarly our `numArray` and `person` could be implicitly typed, but if we want several objects to follow a specific shape, we would still declare a type definition

### Union Types

- Sometimes we want to allow more than 1 type, but not `any` for that we can use union types. It's like the logical `||` but with just 1 `|`

```js
let numOrBool: number | boolean = 32;

numOrBool = true;
```

- We can use this on our `Person` type definition too

```js
type Person = { name: string, age: number | string };
```

- We can also string them together to have several options

```js
let strOrNumOrBool: string | number | boolean = '45';
```

### Typing functions

- We can type both the parameters of a function, and the return. TS can implicitly type these as well, but it can be good to explicitly type if needed
- Parameter types go next to the parameters, and the return type after the `()`

```js
const addNums = (num1: number, num2: number): number => {
  return num1 + num2;
};
```

- Here, since we typed the parameters, we can let TS implicitly type the return also as a `number`

```js
const addNums = (num1: number, num2: number) => {
  return num1 + num2;
};
```

#### There is lots more to talk about with types in TS, but this is enough to get you started

## `tsconfig.json` file

- TS has some default behaviors, but we can adjust those with a `tsconfig.json` file. In my opinion, getting this right is one of the most challenging parts of TS. We won't go super deep into it, but the nice thing is that normally a more senior dev would make this, and/or tools like Vite will generate a pretty good one for something like a React project

- We can run `npx tsc --init` to generate one for us, with some sensible presets
- Now that we have a `config` file, we don't need to specify the file when running `tsc`

### config settings

- As you can see, there are a lot of options. Most are commented out, and have a short description of what they do, we're going to clear out most of them, and focus on a few

#### Projects

- It's all commented out, and not something we need to worry about, so let's clear it out

#### Language and Environment

- target
  - This tells TS what JS version to emit
  - Let's update this to `es2022` to get most modern JS features, but still get good browser compatibility
  - Now in our JS we see `let` and arrow functions
- lib
  - Includes type declarations for the environment we're working in. By default includes DOM, but if we were in Node, we wouldn't want those
- There's other setting related to what to do with `jsx` and some other things that we're not concerned with for today

#### Modules

- This is related to the type of modules we use, and things like import aliases. We'll stick to a single file, but still update `module` to `esnext`, to use `import` syntax
- rootDir
  - This tells TS where to check. common practice is to move TS files into a `src` folder, like how you saw with React
  - Now that error about shared names will go away

```json
 "rootDir": "./src" /* Specify the root folder within your source files. */,
```

- We can ignore the rest for now

#### JavaScript Support

- This can allow you to still include JS files or not, for example if you're incrementally adapting TS. You can also have it check your JS files, or not
- Remember this is only for where you tell TS to check, so inside of `src`
- We can ignore these for today

### Emit

- This is related to how the JS gets emitted (or written). You may have noticed `index.js` is in our `src` folder too, so we need to declare the `outDir`
  - We then need to update our `script src` path

```json
    "outDir": "./dist" /* Specify an output folder for all emitted files. */,
```

- by setting `sourceMap` to true, it will make a `map` file, without getting to deep into, this file tracks the JS to TS, and can make debugging easier

- We can explicitly say `noEmitOnError`, so don't make the JS if a TS error is found

```json
    "noEmitOnError": true /* Disable emitting files if any type checking errors are reported. */,
```

#### Interop Constraints

- This defines how to let different module types interact, mainly for working with libraries that might use CommonJS, or a different module syntax
- We'll keep the defaults

#### Type Checking

- This tells us how strict to be, by setting `strict: true` we say yes to all of them

#### Completeness

- This essentially says to skip `node_modules` when checking

##### The needs for each project means you might adjust these settings. This is where trying to implement TS into an actual project can become a pain, and why further education via docs and/or tutorials is definitely needed before trying to do a full project in TS

## Third-party libraries

- Many modern libraries are built TS first, meaning they are built in TS, or with TS in mind, so the package includes the needed TS types by default. But many older libraries, or any library that doesn't maintain their own type declarations, you have to install them separately

### With express

- If we get an express boilerplate going, we an error with out `express` import
- But it tells us what to do. Because express is built in JS, the maintainers of the library didn't declare any types. Luckily, any package that widely used has type declarations, so we just install them
- There's much more to consider when trying to use TS with Express, so definitely find a more in depth course before trying it yourself - learn from my pain

### React Project with Vite

- To setup React with TS, you just choose it from Vite
- It will generate the config file with reasonable presets

#### This is just introduction, but gives you a general overview of the principles involved when working with TS
