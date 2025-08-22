# TS in Node

## Topics to cover

- database articles
- Walk through article
- tsconfig.json

## Running JS Scripts with Node

- You were introduced to Node with the CLI games, but that was a while ago, so let's do a quick refresher
- To run a node program, if you're in the correct directory in the terminal simply run `node <file_name>`
- Our most basic example is in `hello.js` -> run `node hello.js`

## Capturing input

- Remember `sum.js` from way back when? We can use it to capture simple input from the command line

## Running TS Scripts with Node

- Just like the browser, older versions of node could only run JS, so TS had to be transpiled.
- Since Node v22, native TS support was added as an experimental feature, and the next major LTS release, v24, supports it stably
- So running TS in Node can be as simple as renaming your file extension to `ts` (if you have TS globally installed)
  - We do get this `experimental` warning, but we can turn that off
- For a full application though, this isn't very practical. For frontend, Vite took care of a lot of the work of setting up a TS environment. In backend, we'll be now handling a lot of that ourselves

## Setting up a TS in Node Environment

- The most complicated part of working with TS is setting up your environment. So we've figured out some sensible settings and configurations for you, so that you have a guide to follow in setting up your environment

### Initialize the project

- First let's make a directory for our new node app
  - `mkdir my-ts-app`
  - `cd my-ts-app`
- Then to an initialize an npm project, we say `npm init -y` (`-y` to say yes to default options)
- This will make our `package.json`

```json
{
	"name": "my-ts-app",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"type": "commonjs"
}
```

### Install dependencies

- We'll need TS and types declarations for Node, both only in development
  - `npm install -D typescript @types/node`

### Create file structure

- Similar to with Vite, we'll need several files in the root of our project
- `.gitignore`

```
node_modules/
dist/
.env
```

#### tsconfig.json

- Since we're in a different environment now, we have different needs from TS. So this will look a bit different than our Vite setup. Some projects might need slight adjustments, but this configuration should carry you through the backend
- Briefly walk through each of the settings

```json
{
	"compilerOptions": {
		/* Base Options: */
		"esModuleInterop": true, // Enables default imports from CommonJS modules
		"lib": ["ESNext"], // Includes modern ES features in the type system
		"target": "ESNext", // Sets the JavaScript version output
		"skipLibCheck": true, // Skips type checking of declaration files (*.d.ts)
		"allowJs": true, // Allows JavaScript files in the project
		"resolveJsonModule": true, // Allows importing JSON modules
		"moduleDetection": "force", // Treats all files as modules regardless of import/export
		"isolatedModules": true, // Ensures each file can be transpiled independently
		"verbatimModuleSyntax": true, // Keeps import/export syntax as-is for Node.js
		/* Strictness */
		"strict": true, // Enables all strict type-checking options
		"noUncheckedIndexedAccess": true, // Adds 'undefined' to object access via index if type not declared
		"noImplicitOverride": true, // Requires 'override' keyword when overriding methods
		/* Node Options*/
		"allowImportingTsExtensions": true, // Allows importing files with .ts extensions
		"rewriteRelativeImportExtensions": true, // Rewrites relative imports with correct extensions
		"module": "preserve", // Preserves ES module syntax (important for native ESM)
		"noEmit": false, // Enables output generation
		"outDir": "dist", // Output directory for compiled JavaScript
		/* Paths */
		"baseUrl": "./src", // Base path for module resolution
		"paths": {
			"#*": ["*"] // Defines internal path aliases with '#' to avoid conflict with '@'
		}
	},
	"include": ["src"] // Files to include in compilation
}
```

- Just like with we'll have everything in a `src` folder (the one exception with Vite was `index.html`). `app.ts` will be our entry point
  - `mkdir src`
  - touch `src/app.ts`

#### package.json

- We'll need to make several updates to our `package.json` as well
- update `main`

```json
"main": "app.ts",
```

- Change `type` to `module`, to fit modern standards

```json
"type": "module",
```

#### dev script

- To get our `npm run dev` script, our first flag is to add `--watch`. This will put node in `watch mode`, and give us the hot reloading. This way we don't have to stop and restart the server every time we make a file change

```json
	"dev": "node --watch src/app.ts"
```

- Now if we start the server with `npm run dev`, it will check for file changes.

```ts
console.log('Hello Node with TS!');
```

- We can get rid of those experimental warnings as well (this won't be needed anymore within a few months)

### build and start commands

- To build for production, we let the TS compiler run and create our `dist` folder (as defined in our `tsconfig.json`)

```json
"build": "tsc"
```

- Now we can `npm run build` and see our compiled JS that would run in production

- To delete the `dist` folder to make room for the new one, we can add a `prebuild` command that will always run right before `build` runs

```json
 "prebuild": "rm -rf dist",
```

- For `npm run start` (running our production server), we want to run our compiled js

```json
  "start": "node dist/app.js"
```

- And similarly have a `prestart` command that will execute our build

```json
"prestart": "npm run build",
```

- So at this point, our `package.json` looks like this

```json
{
	"name": "my-ts-app",
	"version": "1.0.0",
	"description": "",
	"main": "app.ts",
	"scripts": {
		"dev": "node --watch --experimental-transform-types --disable-warning=ExperimentalWarning src/app.ts",
		"prebuild": "rm -rf dist",
		"build": "tsc",
		"prestart": "npm run build",
		"start": "node dist/app.js"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"type": "module",
	"devDependencies": {
		"@types/node": "^24.3.0",
		"typescript": "^5.9.2"
	}
}
```

### Having clean imports with \#

- Refer back to article
- To allow imports that will work both in development and production at scale, we have to add them to our `package.json`
- If me make a `utils` folder, just like with Vite we need an `index.ts` file at the root
  - `mkdir src/utils`
  - `touch src/utils/index.ts`
- Make a simple utility function

```ts
const print = (content: any) => console.log(content);

export { print };
```

- We list where the imports come from in `package.json`
  - in development, from our TS, in production from our transpiled JS

```json
"imports": {
		"#utils": {
			"development": "./src/utils/index.ts",
			"default": "./dist/utils/index.js"
		}
	},
```

- Now if we run `npm run dev` we get `MODULE_NOT_FOUND`. We have to update our `dev` script to tell Node that we're in development

```json
		"dev": "node --watch --conditions development --experimental-transform-types --disable-warning=ExperimentalWarning src/app.ts",
```

- We restart the server, and we're good to go! We just have to add this anytime we add a new folder

#### We'll continue to build upon and modify this foundational setup as we work through the backend. There's no specific exercise with a correction today, but continue working through the tutorial if you didn't finish it, and experiment a bit with running scripts with this setup
