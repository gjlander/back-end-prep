import { Schema, model } from 'mongoose';

const duckSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			maxLength: 255
		},
		imgUrl: {
			type: String,
			required: true,
			maxLength: 510
		},
		quote: {
			type: String,
			default: "I'm here to help!",
			maxLength: 1000
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true }
);

export default model('Duck', duckSchema);
