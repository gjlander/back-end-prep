import express from 'express';
import {
    getAllDucks,
    createDuck,
    getDuckById,
    updateDuck,
    deleteDuck,
} from './controllers/wildDucks.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/wild-ducks', getAllDucks);
app.post('/wild-ducks', createDuck);

app.get('/wild-ducks/:id', getDuckById);
app.put('/wild-ducks/:id', updateDuck);
app.delete('/wild-ducks/:id', deleteDuck);

app.listen(port, () => console.log(`Server is running on port ${port}`));
