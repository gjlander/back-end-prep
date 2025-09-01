import express from 'express';
import '#db';
import { Duck, User } from '#models';
import {
	getAllDucks,
	createDuck,
	getDuckById,
	updateDuck,
	deleteDuck
} from '#controllers';

const app = express();
const port = 3000;

app.use(express.json());

app.route('/ducks').get(getAllDucks).post(createDuck);

app.route('/ducks/:id').get(getDuckById).put(updateDuck).delete(deleteDuck);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
