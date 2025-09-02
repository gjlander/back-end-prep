import type { RequestHandler } from 'express';
import { isValidObjectId, type ObjectId } from 'mongoose';
import { Duck } from '#models';

type DuckType = {
	name: string;
	imgUrl: string;
	quote: string;
	owner: string;
};

type UpdateDuckType = Omit<DuckType, 'owner'>;

const getAllDucks: RequestHandler = async (req, res) => {
	const ducks = await Duck.find();

	res.json(ducks);
};
const createDuck: RequestHandler<{}, {}, DuckType> = async (req, res) => {
	if (!req.body)
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});

	const { name, imgUrl, quote, owner } = req.body;

	if (!name || !imgUrl || !quote || !owner) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}

	const newDuck = await Duck.create<DuckType>({ name, imgUrl, quote, owner });

	res.json(newDuck);
};
const getDuckById: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	res.json(duck);
};
const updateDuck: RequestHandler<{ id: string }, {}, UpdateDuckType> = async (
	req,
	res
) => {
	if (!req.body) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}
	const { name, imgUrl, quote } = req.body;
	const { id } = req.params;
	const { userId } = req;

	// console.log(userId);

	if (!name || !imgUrl || !quote) {
		throw new Error('Name, image URL, and quote are required', {
			cause: 400
		});
	}

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: 404 });

	// console.log(duck.owner);
	if (userId !== duck.owner.toString())
		throw new Error('You are not authorized to update this duck', {
			cause: 403
		});

	duck.name = name;
	duck.imgUrl = imgUrl;
	duck.quote = quote;

	await duck.save();
	res.json(duck);
};
const deleteDuck: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const found = await Duck.findByIdAndDelete(id);

	if (!found) throw new Error('Duck Not Found', { cause: 404 });

	res.json({ message: 'Duck deleted' });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
