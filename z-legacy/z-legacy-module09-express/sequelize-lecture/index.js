import express from 'express';
// import './db/index.js';
import './db/associations.js';
import {
    getAllDucks,
    createDuck,
    getDuckById,
    updateDuck,
    deleteDuck,
} from './controllers/ducks.js';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from './controllers/users.js';

const app = express();
const port = 3000;

app.use(express.json());

app.route('/ducks').get(getAllDucks).post(createDuck);

app.route('/ducks/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);

app.route('/users').get(getUsers).post(createUser);
app.route('/users/:id').get(getUserById).put(updateUser).delete(deleteUser);

app.listen(port, () => console.log(`Server is running on port ${port}`));
