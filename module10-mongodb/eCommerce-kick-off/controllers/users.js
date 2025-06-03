import { isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
  const users = await User.find().lean();
  res.json(users);
};

export const createUser = async (req, res) => {
  const {
    sanitizedBody: { email, password }
  } = req;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exists', { cause: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ ...req.sanitizedBody, password: hashedPassword });

  res.json(user);
};

export const getUserById = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findById(id).select('+password').lean().populate('myPond.duckId');
  if (!user) throw new Error('User not found', { cause: 404 });
  res.json(user);
};

export const updateUser = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findByIdAndUpdate(id, req.sanitizedBody, { new: true });
  if (!user) throw new Error('User not found', { cause: 404 });

  res.json(user);
};

export const deleteUser = async (req, res) => {
  const {
    params: { id }
  } = req;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findByIdAndDelete(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  res.json({ message: 'User deleted' });
};

export const addDuckToPond = async (req, res) => {
  const { id } = req.params;
  const { duckId } = req.sanitizedBody;

  if (!isValidObjectId(id) || !isValidObjectId(duckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  user.myPond.push(req.sanitizedBody);

  await user.save();

  const userWithDucks = await user.populate('myPond.duckId');

  res.json(userWithDucks);
};

export const updateDuckInPond = async (req, res) => {
  const { id, pondDuckId } = req.params;
  const { notes } = req.sanitizedBody;

  if (!isValidObjectId(id) || !isValidObjectId(pondDuckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  const pondDuck = user.myPond.id(pondDuckId);

  if (!pondDuck) throw new Error('Duck not found in pond', { cause: 404 });

  pondDuck.notes = notes;

  await user.save();

  const userWithDucks = await user.populate('myPond.duckId');

  res.json(userWithDucks);
};

export const deleteDuckFromPond = async (req, res) => {
  const { id, pondDuckId } = req.params;

  if (!isValidObjectId(id) || !isValidObjectId(pondDuckId)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  const pondDuck = user.myPond.id(pondDuckId);

  if (!pondDuck) throw new Error('Duck not found in pond', { cause: 404 });

  pondDuck.deleteOne();

  await user.save();

  res.json({ message: 'Duck removed from pond' });
};
