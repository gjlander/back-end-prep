// import { DataTypes } from 'sequelize';
// import sequelize from '../db/index.js';
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true }
  },
  { timestamps: true }
);

export default model('User', userSchema);

// const User = sequelize.define('user', {
//   firstName: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   lastName: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// });

// export default User;
