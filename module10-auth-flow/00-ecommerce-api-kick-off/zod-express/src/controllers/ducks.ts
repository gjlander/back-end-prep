import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import type { z } from 'zod/v4';
import type {
	duckInputSchema,
	duckUpdateInputSchema,
	duckSchema,
	populatedUserSchema
} from '#schemas';
import { Duck } from '#models';

type DuckInputDTO = z.infer<typeof duckInputSchema>;

type UpdateDuckDTO = z.infer<typeof duckUpdateInputSchema>;

type PopulatedUserDTO = z.infer<typeof populatedUserSchema>;

type DuckDTO = z.infer<typeof duckSchema>;

const getAllDucks: RequestHandler<{}, DuckDTO[]> = async (req, res) => {
	const { owner } = req.query;
	let ducks: DuckDTO[];

	if (owner) {
		ducks = await Duck.find({ owner })
			.populate<{ owner: PopulatedUserDTO }>(
				'owner',
				'firstName lastName email'
			)
			.lean();
	} else {
		ducks = await Duck.find()
			.populate<{ owner: PopulatedUserDTO }>(
				'owner',
				'firstName lastName email'
			)
			.lean();
	}

	res.json(ducks);
};
const createDuck: RequestHandler<{}, DuckDTO, DuckInputDTO> = async (
	req,
	res
) => {
	const newDuck = await Duck.create<DuckInputDTO>(req.body);

	const populatedDuck = await newDuck.populate<{ owner: PopulatedUserDTO }>(
		'owner',
		'firstName lastName email'
	);

	res.json(populatedDuck);
};
const getDuckById: RequestHandler<{ id: string }, DuckDTO> = async (
	req,
	res
) => {
	const { id } = req.params;

	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });

	const duck = await Duck.findById(id).populate<{ owner: PopulatedUserDTO }>(
		'owner',
		'firstName lastName email'
	);

	if (!duck) throw new Error('Duck Not Found', { cause: { status: 404 } });

	res.json(duck);
};
const updateDuck: RequestHandler<
	{ id: string },
	DuckDTO,
	UpdateDuckDTO
> = async (req, res) => {
	const { name, imgUrl, quote } = req.body;
	const { id } = req.params;
	const { userId } = req;

	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });

	const duck = await Duck.findById(id);

	if (!duck) throw new Error('Duck Not Found', { cause: { status: 404 } });

	if (userId !== duck.owner.toString())
		throw new Error('You are not authorized to update this duck', {
			cause: { status: 403 }
		});

	duck.name = name;
	duck.imgUrl = imgUrl;
	duck.quote = quote;

	await duck.save();
	const populatedDuck = await duck.populate<{ owner: PopulatedUserDTO }>(
		'owner',
		'firstName lastName email'
	);

	res.json(populatedDuck);
};
const deleteDuck: RequestHandler<{ id: string }, { message: string }> = async (
	req,
	res
) => {
	const { id } = req.params;
	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });

	const found = await Duck.findByIdAndDelete(id);

	if (!found) throw new Error('Duck Not Found', { cause: { status: 404 } });

	res.json({ message: 'Duck deleted' });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
