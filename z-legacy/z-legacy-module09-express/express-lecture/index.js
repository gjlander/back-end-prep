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

app.route('/wild-ducks').get(getAllDucks).post(createDuck);

app.route('/wild-ducks/:id')
    .get(getDuckById)
    .put(updateDuck)
    .delete(deleteDuck);

app.listen(port, () => console.log(`Server is running on port ${port}`));
