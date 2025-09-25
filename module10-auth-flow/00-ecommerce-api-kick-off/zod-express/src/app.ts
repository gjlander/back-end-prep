import express from 'express';
import '#db';
import { duckRouter, userRouter } from '#routers';
import { errorHandler } from '#middleware';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/ducks', duckRouter);

app.use('/users', userRouter);

app.use('*splat', (req, res) => {
	throw new Error('Not found', { cause: { status: 404 } });
});

app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
