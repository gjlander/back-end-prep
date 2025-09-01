import express from 'express';
import '#db';
import { Duck, User } from '#models';

const app = express();
const port = 3000;

app.get('/ducks', (req, res) => res.json({ message: 'GET all ducks' }));
app.post('/ducks', (req, res) => res.json({ message: 'POST a new post' }));
app.get('/ducks/:id', (req, res) => res.json({ message: 'GET a post by id' }));
app.put('/ducks/:id', (req, res) => res.json({ message: 'PUT a post by id' }));
app.delete('/ducks/:id', (req, res) =>
	res.json({ message: 'DELETE a post by id' })
);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
