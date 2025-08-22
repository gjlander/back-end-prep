import express from 'express';
// import './db/index.js';
import './db/associations.js';
import duckRouter from './routers/duckRouter.js';
import userRouter from './routers/userRouter.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

app.use('/ducks', duckRouter);
app.use('/users', userRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`));
