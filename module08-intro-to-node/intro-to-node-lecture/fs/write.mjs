import { writeFile } from 'fs/promises';

// promises
try {
    await writeFile('shrek.txt', 'Shrek is love, Shrek is life');
    console.log('successfully created shrek.txt');
} catch (error) {
    console.error('there was an error:', error.message);
}

// import { writeFileSync, writeFile } from 'fs';

// synchronous
// try {
//     writeFileSync('shrek.txt', 'Shrek is love, Shrek is life');
//     console.log('successfully created shrek.txt'); // This line only executes after the previous one is done
// } catch (error) {
//     console.error('there was an error:', error.message);
// }

// callback
// writeFile('shrek.txt', 'Shrek is love, Shrek is life', (err) => {
//     if (err) {
//         console.error('there was an error:', err.message);
//     } else {
//         console.log('successfully created shrek.txt');
//     }
// });
// console.log(`Technically speaking, if the creation of the file takes a bit,
// we will see this in the console before the completion message!`);
