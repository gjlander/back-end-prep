import '#db';
import { User, Duck } from '#models';

type UserType = {
	firstName: string;
	lastName: string;
	email: string;
};

try {
	// CREATE
	// const newUser = new User({
	// 	firstName: 'Aang',
	// 	lastName: 'Air',
	// 	email: 'aang@air.com'
	// });
	// await newUser.save();
	// console.log(newUser);
	// const newUser = await User.create({
	// 	firstName: 'Katara',
	// 	lastName: 'Water',
	// 	email: 'katara@water.com'
	// });
	// console.log(newUser);
	// READ
	// const users = await User.find();
	// console.log(users);
	// const usersAir = await User.find({ lastName: 'Air' });
	// console.log(usersAir);
	// const firstAir = await User.findOne({ lastName: 'Air' });
	// console.log(firstAir);
	// const user = await User.findById('68b03fe2e6eb41ed56a5b6af');
	// console.log(user);
	// UPDATE
	// const updatedAang = await User.findByIdAndUpdate(
	// 	'68b03fe2e6eb41ed56a5b6af',
	// 	{
	// 		firstName: 'Aang',
	// 		lastName: 'Air',
	// 		email: 'aang@air.com'
	// 	},
	// 	{ new: true }
	// );
	// console.log(updatedAang);
	// DELETE
	// await User.findByIdAndDelete('68b03fe2e6eb41ed56a5b6af');
	// console.log('User deleted');
	// const newDuck = await Duck.create({
	// 	name: 'The Mad Quacker',
	// 	imgUrl:
	// 		'https://duckycity.com/cdn/shop/products/SG-REYTD-JCNYO_1024x1024_clipped_rev_1-min_540x.jpeg?v=1505504539',
	// 	quote: 'Be careful, or I might just make your bugs into SUPER bugs!',
	// 	owner: '68b046de0f7e46123b038d5b'
	// });
	// console.log(newDuck);
	// const newUser = await User.create<UserType>({
	// 	firstName: 'Zuko',
	// 	lastName: 'Fire',
	// 	email: 'zuko@fire.com'
	// });
	// console.log(newUser);
	// const ducks = await Duck.find().populate('owner', 'firstName lastName email');
	// console.log(ducks);
} catch (error) {
	console.error(error);
}
