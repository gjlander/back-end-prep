import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { User } from '#models';

type UserType = {
	firstName: string;
	lastName: string;
	email: string;
};

const getAllUsers: RequestHandler = async (req, res) => {
	const users = await User.find();

	res.json(users);
};
const createUser: RequestHandler<{}, {}, UserType> = async (req, res) => {
	if (!req.body)
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});

	const { firstName, lastName, email } = req.body;

	if (!firstName || !lastName || !email) {
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	}

	const newUser = await User.create<UserType>({ firstName, lastName, email });

	res.json(newUser);
};
const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const user = await User.findById(id);

	if (!user) throw new Error('User Not Found', { cause: 404 });

	res.json(user);
};
const updateUser: RequestHandler<{ id: string }, {}, UserType> = async (
	req,
	res
) => {
	if (!req.body)
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	const { firstName, lastName, email } = req.body;
	const { id } = req.params;

	if (!firstName || !lastName || !email) {
		throw new Error('First name, last name, and email are required', {
			cause: 400
		});
	}

	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const user = await User.findByIdAndUpdate<UserType>(
		id,
		{
			firstName,
			lastName,
			email
		},
		{ new: true }
	);

	if (!user) throw new Error('User Not Found', { cause: 404 });

	res.json(user);
};
const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) throw new Error('Invalid ID', { cause: 400 });

	const found = await User.findByIdAndDelete(id);

	if (!found) throw new Error('User Not Found', { cause: 404 });

	res.json({ message: 'User deleted' });
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
