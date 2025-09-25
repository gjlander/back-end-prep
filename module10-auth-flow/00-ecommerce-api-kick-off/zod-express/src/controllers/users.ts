import { type RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { type z } from 'zod/v4';
import { User } from '#models';
import type { userInputSchema, userSchema } from '#schemas';

type UserInputDTO = z.infer<typeof userInputSchema>;

type UserDTO = z.infer<typeof userSchema>;

const getUsers: RequestHandler<{}, UserDTO[]> = async (req, res) => {
	const users = await User.find().lean();
	res.json(users);
};

const createUser: RequestHandler<{}, UserDTO, UserInputDTO> = async (
	req,
	res
) => {
	const found = await User.exists({ email: req.body.email });

	if (found) throw new Error('User already exists', { cause: { status: 400 } });

	const user = await User.create<UserInputDTO>(req.body);
	res.json(user);
};

const getUserById: RequestHandler<{ id: string }, UserDTO> = async (
	req,
	res
) => {
	const {
		params: { id }
	} = req;
	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });

	const user = await User.findById(id);
	if (!user) throw new Error('User not found', { cause: { status: 404 } });
	res.json(user);
};

const updateUser: RequestHandler<
	{ id: string },
	UserDTO,
	UserInputDTO
> = async (req, res) => {
	const {
		body,
		params: { id }
	} = req;
	const { firstName, lastName, email } = body;

	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });
	const user = await User.findById(id);

	if (!user) throw new Error('User not found', { cause: { status: 404 } });

	user.firstName = firstName;
	user.lastName = lastName;
	user.email = email;
	await user.save();
	res.json(user);
};

const deleteUser: RequestHandler<{ id: string }, { message: string }> = async (
	req,
	res
) => {
	const {
		params: { id }
	} = req;
	if (!isValidObjectId(id))
		throw new Error('Invalid ID', { cause: { status: 400 } });

	const user = await User.findByIdAndDelete(id);

	if (!user) throw new Error('User not found', { cause: { status: 404 } });

	res.json({ message: 'User deleted' });
};

export { getUsers, createUser, getUserById, updateUser, deleteUser };
