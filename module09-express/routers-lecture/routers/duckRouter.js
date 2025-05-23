import { Router } from 'express';
import {
    getAllDucks,
    createDuck,
    getDuckById,
    updateDuck,
    deleteDuck,
} from '../controllers/ducks.js';

const duckRouter = Router();

duckRouter.route('/').get(getAllDucks).post(createDuck);

duckRouter.route('/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);

export default duckRouter;
