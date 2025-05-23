import { Router } from 'express';
import {
    getAllDucks,
    createDuck,
    getDuckById,
    updateDuck,
    deleteDuck,
} from '../controllers/ducks.js';

const duckRouter = Router();

const duckMiddleware = (req, res, next) => {
    console.log('I only appear on the duck routes!');
    next();
};

const validateDuck = (req, res, next) => {
    // body validation logic here...
    console.log('Validation passed!');
    next();
};

const verifyToken = (req, res, next) => {
    // token verification logic here...
    req.userId = 1;
    next();
};

duckRouter.use(duckMiddleware);

duckRouter.route('/').get(getAllDucks).post(validateDuck, createDuck);

duckRouter
    .route('/:id')
    .get(getDuckById)
    .put(verifyToken, updateDuck)
    .delete(deleteDuck);

export default duckRouter;
