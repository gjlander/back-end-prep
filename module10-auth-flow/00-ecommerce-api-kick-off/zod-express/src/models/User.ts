import { Schema, model } from 'mongoose';

// const locationSchema = new Schema({
// 	country: String,
// 	zipCode: String,
// 	city: String
// });
const userSchema = new Schema(
	{
		firstName: { type: String, required: [true, 'First name is required'] },
		lastName: { type: String, required: [true, 'last name is required'] },
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			select: false
		}
	},
	{ timestamps: true }
);

export default model('User', userSchema);
