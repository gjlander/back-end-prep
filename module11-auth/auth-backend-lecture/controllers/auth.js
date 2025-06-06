import { isValidObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import User from '../models/User.js';

const signUp = async (req, res) => {
  const {
    sanitizedBody: { email, password }
  } = req;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exists', { cause: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ ...req.sanitizedBody, password: hashedPassword });

  res.json(user);
};
const signIn = async (req, res) => {};

export { signUp, signIn };
