console.log('Hello world');
let myString = 'This is a string';
let num = 6;
let bool = false;

let nullVar = null;
let undef;

let anything: any = 'This can be reassigned';

anything = 42;

const numArray = [1, 2, 3, 4];

type Person = { name: string; age: number | string };

const person: Person = {
  name: 'Steve',
  age: 72
  //   lastName: 'Rogers'
};

// person.name = 34;

let numOrBool: number | boolean = 32;

numOrBool = true;

let strOrNumOrBool: string | number | boolean = '45';

const addNums = (num1: number, num2: number) => {
  return num1 + num2;
};
// person.name = 54

// numArray.push('4')

// num = 'Not anymore!';

// num.forEach(element => {
//   console.log(element);
// });

const body = document.querySelector('body');
