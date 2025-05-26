import Duck from '../models/Duck.js';
import User from '../models/User.js';

const getAllDucks = async (req, res) => {
  const ducks = await Duck.findAll({ include: User });
  res.json(ducks);
};

const createDuck = async (req, res) => {
  const { userId, name, imgUrl, quote } = req.sanitizedBody;
  //   if (!name || !imgUrl) throw new Error('Missing required fields', { cause: 400 });

  const newDuck = await Duck.create({ userId, name, imgUrl, quote });
  res.status(201).json(newDuck);
};

const getDuckById = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByPk(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  res.json(duck);
};

const updateDuck = async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { name, imgUrl, quote } = req.sanitizedBody;

  console.log('userId', userId);

  //   if (!name || !imgUrl || !quote) throw new Error('Missing required fields', { cause: 400 });

  const duck = await Duck.findByPk(id, { include: User });

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  if (userId !== duck.user.id) throw new Error('You are not authorized to update this duck', { cause: 403 });

  await duck.update({ name, imgUrl, quote });
  res.json(duck);
};

const deleteDuck = async (req, res) => {
  const { id } = req.params;

  const duck = await Duck.findByPk(id);

  if (!duck) throw new Error('Duck not found', { cause: 404 });

  await duck.destroy();

  res.json({ message: `Duck deleted successfully` });
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
