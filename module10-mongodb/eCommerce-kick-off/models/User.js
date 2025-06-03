import { Schema, model } from 'mongoose';

const locationSchema = new Schema({
  country: String,
  zipCode: String,
  city: String
});

const pondDuckSchema = new Schema({
  duckId: { type: Schema.Types.ObjectId, ref: 'Duck', required: [true, 'Duck Id is required'] },
  notes: { type: String, default: '' }
});

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    location: {
      type: locationSchema,
      default: { country: 'Germany', zipCode: '', city: '' }
    },
    myPond: {
      type: [pondDuckSchema],
      default: () => []
    }
  },
  { timestamps: true }
);

export default model('User', userSchema);
