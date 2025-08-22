# SQL Part I

## Topics covered

-   What is a relational database?
-   What is SQL?
-   What is an (R)DBMS?
-   CREATE table
-   INSERT INTO table
-   SELECT \* FROM users
-   WHERE clause
-   AND clause
-   ORDER BY clause
-   LIMIT

# Slide 2 - First thing first

-   What is a database?
    -   an organized collection of data
-   Several types of databases, this week we'll focus on relational databases

# Slide 3 - What's a relational database?

-   Contents are arranged as a collection of tables with rows (tuples) and columns (attributes)

# Slide 4 - What's a (R)DBMS

-   DBMS stands for database management system. This is specialized software that allows you to interact with the database
    -   the R then stands for Relational
    -   because every database needs a DBMS, the term 'database' is often used to refer to both the database and the DBMS
-   There are several RDBMS's that offer ways to interact with a database using SQL
    -   each RDBMS will have slightly different syntax, or additional features, but SQL is at the core of all of them

# Slide 5 - What about SQL?

-   SQL stands for Structured Query Language
    -   As the name implies, it is technically not a programming language, but a language for writing database queries
    -   queries are simply commands used to interact with the database
-   Before SQL, each database system had its own unique language for managing data, making it difficult to work with multiple systems or migrate data between them.
-   For this reason two IBM engineries Donald Chamberlin and Raymond Boyce invented SQL in the early 1970s.
-   SQL was invented to provide a standardized language for interacting with relational databases.
-   The basic commands are fairly intuitive, and read almost like an english sentence, so even without knowing any SQL, so can get a general sense of what this query might do
    -   This goes away as you get into more complex queries
    -   The main struggle is that SQL is very unforgiving to syntax errors

# Slide 6 - Create table example

-   Tables in SQL are based on Schemas
    -   a schema is like a blueprint, or the structure of the table
    -   every piece of data in the table must adhere to this structure
-   So, in order to create a table that looks like this, you'd have to run the below command

## Neon - a serverless Postgres Database

-   Next week, you'll learn to work with Neon when it's time to connect your server to a database, but for now it serves as a nice tool to visually represent our SQL queries

## CREATE TABLE

-   Let's break this query down line by line

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT
);
```

-   `CREATE TABLE users (`

    -   We give our command `CREATE TABLE`, followed by the name of the table
    -   It's not required, but by convention SQL commands are in all caps to help differentiate them from values
    -   We have an opening `(` to define the borders of our table

-   `id SERIAL PRIMARY KEY,`

    -   we start with the name we want this column to have
    -   Similar to JS, SQL has data types
    -   serial will simply increment each item by 1, but won't go back and refill gaps if an item is deleted (i.e, first entry has id 1, second 2, and so on)
    -   Since each id will then be unique, we use it as the `PRIMARY KEY`, this is the unique identifier for each item in the table
    -   We end the line with a comma, to indicate the start of the next property (or column)

-   `first_name VARCHAR(255),` and `last_name VARCHAR(255),`
    -   Naming convention is similar to HTML, all lowercase, but instead of `-` you use `_` between words
    -   SQL is more specific than JavaScript. Instead of generic `string` we have `VARCHAR`
    -   `VARCHAR` stands for variable character, and you can set an upper limit to the acceptable length
    -   For shorter things, like names or emails, common practice is to set the limit to 255, since that is one byte of data
    -   As soon as you add a 266th character, an entire second byte of data would be needed. If you have millions of users, this can really add up
-   `age INT`
    -   type `INT` stands for integer, or a whole number with no decimal points
    -   note the lack of trailing comma, same as JSON
-   `);`
    -   And a closing `)` to indicate the end of our table schema
    -   Like JS, SQL only reads new queries from `;`. So you can space each line however you want
    -   There are common conventions that we'll cover as we go

## INSERT INTO

-   Now this table exists, but it's empty (show tables tab)
-   To add new users, we need to INSERT
    -   This is C in our CRUD operations

```sql
INSERT INTO users (first_name, last_name, age) VALUES ('John', 'Doe', 18);

INSERT INTO users (first_name, last_name, age) VALUES ('Bob', 'Dylan', 30);

INSERT INTO users (first_name, last_name, age) VALUES ('Jane', 'Doe', 25);
```

-   Let's break down the syntax
    -   `INSERT INTO` our SQL command
    -   `users` name of the table we want to insert into
    -   `(first_name, last_name, age) ` encapsulated in `()` we give the column names
    -   `VALUES` indicates each column will have the following value
    -   `('John', 'Doe', 18)` strings in single quotes (varies based on which version of SQL using), numbers without quotes. In same order as column names
    -   `;` indicate end of the query

## SELECT

-   To read from out database we use SELECT

```sql
SELECT *
FROM users;
```

-   `SELECT` - again, our SQL command
-   `*` - this is like a wildcard, it means select all of the columns that `users` has
-   `FROM users` tells us which table to select from

### Only grab some columns

-   If we only need some information, we can specify which columns to `SELECT`, separated by commas

```sql
SELECT first_name, last_name
FROM users;
```

### WHERE

-   We can also specify conditions to be met. This is kind of like `if` in JS

```sql
SELECT *
FROM users
WHERE age > 18;
```

### AND

-   Just like in JS we have `&&`, we can chain conditions in SQL
    -   Again, note the use of single quotes in Postgres

```sql
SELECT *
FROM users
WHERE age > 18
AND last_name = 'Doe';
```

### ORDER BY

-   We can also order our data, similar to JS `sort`
-   `DESC` (descending) is highest-lowest, `ASC` (ascending) is lowest-highest

```sql
SELECT *
FROM users
ORDER BY age DESC;
```

-   Can also sort alphabetically

```sql
SELECT *
FROM users
ORDER BY first_name ASC;
```

### LIMIT

-   We can also limit the number of results
    -   Remember that `limit` query some APIs had?
    -   This can be very useful for things like pagination

```sql
SELECT *
FROM users
WHERE age > 18
AND last_name = 'Doe'
LIMIT 1;
```

### Let's play around a little bit

-   Spoiler, but the duckpond is made in MongoDB, but if we wanted to make it in SQL...
-   How could we create a `ducks` table that's structured like our original ducks with `id`, `name`, `quote`, and `img_url`?
-   Create some ducks?
-   Read the ducks?
