import '#db';
import { User, Duck } from '#models';
import http, {
	type RequestListener,
	type ServerResponse,
	type IncomingMessage
} from 'node:http';

type UserType = {
	firstName: string;
	lastName: string;
	email: string;
};

const parseJsonBody = <T>(req: IncomingMessage): Promise<T> => {
	return new Promise((resolve, reject) => {
		let body = '';

		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				resolve(JSON.parse(body) as T);
			} catch (error) {
				reject(new Error('Invalid JSON'));
			}
		});
	});
};

const createResponse = (
	res: ServerResponse,
	statusCode: number,
	message: unknown
) => {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	return res.end(
		typeof message === 'string'
			? JSON.stringify({ message })
			: JSON.stringify(message)
	);
};

const requestHandler: RequestListener = async (req, res) => {
	const singlePostRegex = /^\/users\/[0-9a-zA-Z]+$/; // Simple expression to match the pattern /users/anything
	const { method, url } = req;
	console.log(method, url);
	if (url === '/users') {
		if (method === 'GET') {
			const users = await User.find();
			console.log(users);
			return createResponse(res, 200, users);
		}
		if (method === 'POST') {
			const body = await parseJsonBody<UserType>(req);
			// console.log(body);
			const newUser = await User.create(body);
			return createResponse(res, 201, newUser);
		}
		return createResponse(res, 405, 'Method Not Allowed');
	}
	if (singlePostRegex.test(url!)) {
		if (method === 'GET') {
			return createResponse(res, 200, `GET request on ${url}`);
		}
		if (method === 'PUT') {
			return createResponse(res, 200, `PUT request on ${url}`);
		}
		if (method === 'DELETE') {
			return createResponse(res, 200, `DELETE request on ${url}`);
		}
		return createResponse(res, 405, 'Method Not Allowed');
	}

	return createResponse(res, 404, 'Not Found');
};
const server = http.createServer(requestHandler);

const port = 3000;

server.listen(port, () =>
	console.log(`Server running at http://localhost:${port}/`)
);

// try {
// 	// CREATE
// 	// const newUser = new User({
// 	// 	firstName: 'Aang',
// 	// 	lastName: 'Air',
// 	// 	email: 'aang@air.com'
// 	// });
// 	// await newUser.save();
// 	// console.log(newUser);
// 	// const newUser = await User.create({
// 	// 	firstName: 'Katara',
// 	// 	lastName: 'Water',
// 	// 	email: 'katara@water.com'
// 	// });
// 	// console.log(newUser);
// 	// READ
// 	// const users = await User.find();
// 	// console.log(users);
// 	// const usersAir = await User.find({ lastName: 'Air' });
// 	// console.log(usersAir);
// 	// const firstAir = await User.findOne({ lastName: 'Air' });
// 	// console.log(firstAir);
// 	// const user = await User.findById('68b03fe2e6eb41ed56a5b6af');
// 	// console.log(user);
// 	// UPDATE
// 	// const updatedAang = await User.findByIdAndUpdate(
// 	// 	'68b03fe2e6eb41ed56a5b6af',
// 	// 	{
// 	// 		firstName: 'Aang',
// 	// 		lastName: 'Air',
// 	// 		email: 'aang@air.com'
// 	// 	},
// 	// 	{ new: true }
// 	// );
// 	// console.log(updatedAang);
// 	// DELETE
// 	// await User.findByIdAndDelete('68b03fe2e6eb41ed56a5b6af');
// 	// console.log('User deleted');
// 	// const newDuck = await Duck.create({
// 	// 	name: 'The Mad Quacker',
// 	// 	imgUrl:
// 	// 		'https://duckycity.com/cdn/shop/products/SG-REYTD-JCNYO_1024x1024_clipped_rev_1-min_540x.jpeg?v=1505504539',
// 	// 	quote: 'Be careful, or I might just make your bugs into SUPER bugs!',
// 	// 	owner: '68b046de0f7e46123b038d5b'
// 	// });
// 	// console.log(newDuck);
// 	// const newUser = await User.create<UserType>({
// 	// 	firstName: 'Zuko',
// 	// 	lastName: 'Fire',
// 	// 	email: 'zuko@fire.com'
// 	// });
// 	// console.log(newUser);
// 	// const ducks = await Duck.find().populate('owner', 'firstName lastName email');
// 	// console.log(ducks);
// } catch (error) {
// 	console.error(error);
// }
