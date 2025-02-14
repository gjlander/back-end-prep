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

### CREATE TABLE

-   Let's break this query down line by line

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
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

-   `first_name VARCHAR(255),`
