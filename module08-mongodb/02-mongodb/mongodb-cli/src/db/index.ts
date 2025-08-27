import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI!);

try {
	await client.connect();
} catch (err) {
	process.env.NODE_ENV !== 'production' &&
		console.error('MongoDB connection error:', err);
	process.exit(1);
}

export const db = client.db();
