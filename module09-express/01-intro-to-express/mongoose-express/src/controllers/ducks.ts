import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { Duck } from '#models';

type DuckType = {
	name: string;
	imgUrl: string;
	quote: string;
	owner: string;
};

const getAllDucks: RequestHandler = async (req, res) => {
	try {
		const ducks = await Duck.find();

		res.json(ducks);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
const createDuck: RequestHandler<{}, {}, DuckType> = async (req, res) => {
	try {
		if (!req.body)
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });

		const { name, imgUrl, quote, owner } = req.body;

		if (!name || !imgUrl || !quote || !owner) {
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });
		}

		const newDuck = await Duck.create<DuckType>({ name, imgUrl, quote, owner });

		res.json(newDuck);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
const getDuckById: RequestHandler<{ id: string }> = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id))
			return res.status(400).json({ error: 'Invalid ID' });

		const duck = await Duck.findById(id);

		if (!duck) return res.status(404).json({ error: 'Duck Not Found' });

		res.json(duck);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
const updateDuck: RequestHandler<{ id: string }, {}, DuckType> = async (
	req,
	res
) => {
	try {
		if (!req.body)
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });
		const { name, imgUrl, quote, owner } = req.body;
		const { id } = req.params;

		if (!name || !imgUrl || !quote || !owner) {
			return res
				.status(400)
				.json({ error: 'Name, image URL, owner, and quote are required' });
		}

		if (!isValidObjectId(id))
			return res.status(400).json({ error: 'Invalid ID' });

		const duck = await Duck.findByIdAndUpdate<DuckType>(
			id,
			{
				name,
				imgUrl,
				quote,
				owner
			},
			{ new: true }
		);

		if (!duck) return res.status(404).json({ error: 'Duck Not Found' });

		res.json(duck);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};
const deleteDuck: RequestHandler<{ id: string }> = async (req, res) => {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id))
			return res.status(400).json({ error: 'Invalid ID' });

		const found = await Duck.findByIdAndDelete(id);

		if (!found) return res.status(404).json({ error: 'Duck Not Found' });

		res.json({ message: 'Duck deleted' });
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'An unknown error occurred' });
		}
	}
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
