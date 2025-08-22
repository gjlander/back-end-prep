import Duck from '../models/Duck.js';
import User from '../models/User.js';
const getAllDucks = async (req, res) => {
    try {
        // const { rows } = await pool.query('SELECT * from wild_ducks;');
        const ducks = await Duck.findAll({ include: User });
        res.json(ducks);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || 'Internal server error.',
        });
    }
};

const createDuck = async (req, res) => {
    try {
        const { userId, name, imgUrl, quote } = req.body;
        if (!name || !imgUrl)
            return res.status(400).json({ error: 'Missing required fields' });

        // const {
        //     rows: [newDuck],
        // } = await pool.query(
        //     `INSERT INTO wild_ducks (name, img_url, quote) VALUES ($1, $2, $3) RETURNING *`,
        //     [name, imgUrl, quote]
        // );
        const newDuck = await Duck.create({ userId, name, imgUrl, quote });
        res.status(201).json(newDuck);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || 'Internal server error.',
        });
    }
};

const getDuckById = async (req, res) => {
    try {
        const { id } = req.params;

        // const {
        //     rows: [duck],
        // } = await pool.query('SELECT * from wild_ducks WHERE id=$1;', [id]);
        const duck = await Duck.findByPk(id);

        if (!duck) return res.status(404).json({ error: 'Duck not found' });

        res.json(duck);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || 'Internal server error.',
        });
    }
};

const updateDuck = async (req, res) => {
    try {
        // const {
        //     param: { id },
        //     body: { name, imgUrl, quote },
        // } = req;
        const { id } = req.params;
        const { name, imgUrl, quote } = req.body;

        if (!name || !imgUrl || !quote)
            return res.status(400).json({ error: 'Missing required fields' });

        // const {
        //     rows: [duck],
        // } = await pool.query(
        //     'UPDATE wild_ducks SET name = $1, img_url = $2, quote = $3 WHERE id = $4 RETURNING *;',
        //     [name, imgUrl, quote, id]
        // );
        const duck = await Duck.findByPk(id);

        if (!duck) return res.status(404).json({ error: 'Duck not found' });

        await duck.update({ name, imgUrl, quote });
        res.json(duck);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || 'Internal server error.',
        });
    }
};

const deleteDuck = async (req, res) => {
    try {
        const { id } = req.params;

        // await pool.query('DELETE from wild_ducks WHERE id=$1;', [id]);
        const duck = await Duck.findByPk(id);

        if (!duck) return res.status(404).json({ error: 'Duck not found' });

        await duck.destroy();

        res.json({ message: `Duck deleted successfully` });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || 'Internal server error.',
        });
    }
};

export { getAllDucks, createDuck, getDuckById, updateDuck, deleteDuck };
