# SQL Part II

## Topics covered

-   Multiple tables
-   Relationships
    -   One to one
    -   One to many
    -   Many to many
-   Keys
    -   Primary key
    -   Foreign key
-   Syntax examples
-   Joins Intro for one-to-many

# Slide 1 - Intro to Multiple Tables

-   So far, we've been working with single tables, but in relational databases the whole point is to have RELATIONSHIPS
-   The real power in relational databases is in it's ability to connect one table to another

# Slide 2 - Tables with Relationships diagram

-   This is what a database for an eCommerce site could look like
-   Each of these tables have relationships to other tables
-   These relationship types fit into three categories
    -   One-to-one
    -   One-to-many
    -   Many-to-many
-   That's actually what those funky symbols represent - it's known as Crow's Foot notation

# Slide 3 - One-to-One

-   In this example, one author can have a relationship to a single book, and a book can only have a single author (the real world might be different, but in this database that could be the case)
-   Other examples
    -   One person has one passport, each passport can only be used by one person
    -   One employee has one work laptop, each laptop is owned by a single employee
    -   One employee has a specific phone extension, that phone extension can only connect to one employee

# Slide 4 - One-to-Many

-   In this example, one author can write many books, but each book can only have one author
-   Other examples
    -   One customer can have many orders, but each order can only belong to one customer
    -   One webdev instructor can have many students, but each webdev student can only have one instructor (at a time ;P)
    -   One department can have many employees, but each employee only belongs to one department

# Slide 5 - Many-to-Many

-   In this example, one author can write many books, and a book can have more than one author
-   Other examples
    -   An order can have many products, and each product could be a part of many orders
    -   A student can register for many classes, and each class can have many students
    -   An actor can act in many movies, and each movie can have many actors

# Slide 6 - Keys (Primary/Foreign)

## Primary Key

-   The property assigned as the unique identifier for an item - usually the id

## Foreign Key

-   Used to create a relationship between two tables
-   In One-to-Many is added as a column on the Many table
-   The Foreign Key corresponds to the Primary Key of the One
-   In One-to-Many, the One table has no column referencing the many

## Slide One-to-Many example

-   One customer -> Many orders
-   Crow's foot notation gets more detailed
    -   Orders can have one, and only one customer
    -   Customers can have none, or many orders
-   customerNumber is Primary Key in customers table, so it becomes Foreign Key on orders table
-   customers table has no clear reference to orders table, the relationship is tracked by the orders table

# Slide 10 - CREATE orders table

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    price FLOAT,
    date TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Let's break down what's new

-   `FLOAT` means a decimal number
-   `TIMESTAMP` is a datatype that will capture the date the order was made, formatted correctly
-   `user_id INT,` just an INT to start
-   `FOREIGN KEY (user_id) REFERENCES users(id)` then we set is as the foreign key after
    -   syntax is a little funny
    -   Similar to bracket notation, we write the table name, then in () give the column name

# Slide 11 - INSERT INTO orders

```sql
INSERT INTO orders (price, date, user_id) VALUES ( 18, '2001-01-01 00:00:00', 1);

INSERT INTO orders (price, date, user_id) VALUES ( 112, '2001-01-02 04:00:00', 1);

INSERT INTO orders (price, date, user_id) VALUES ( 9, '2001-01-04 05:00:00', 2);

INSERT INTO orders (price, date, user_id) VALUES ( 14.5 , '2001-01-03 05:00:00', 2);
```

-   Date need to be formatted string, id is just an INT
-   But our users table has no reference to the orders, and even on the orders table, we just have the id from the user

# Slide 12 - Joins

-   Joins allow us to make queries across several tables

## `INNER JOIN`

-   written as `JOIN` or `INNER JOIN`
-   only creates rows that match our `ON` condition

### users on left

```sql
SELECT *
FROM users
INNER JOIN orders
ON orders.user_id = users.id;
```

-   Notice we have 2 rows for John and Bob, since they each have 2 orders
-   Jane doesn't appear, because she has no orders
-   The following will do the same

```sql
SELECT *
FROM users
JOIN orders
ON orders.user_id = users.id;
```

### orders on left

-   Looks basically the same, just orders are on the left side of the resulting table

## `LEFT JOIN`

-   As the name implies, a left join keeps all of the rows from the first table (i.e. the one to the left of the JOIN), whether or not it has a matching row on the second table

### users on left

```sql
SELECT *
FROM users
LEFT JOIN orders
ON orders.user_id = users.id;
```

-   See we get Jane back, even though she has no orders

### orders on left

```sql
SELECT *
FROM orders
LEFT JOIN users
ON orders.user_id = users.id;
```

-   Jane disappears again, since we're only keeping rows from the left table

## `RIGHT JOIN`

-   Same idea, but keep all rows in second table

### users on left

```sql
SELECT *
FROM users
RIGHT JOIN orders
ON orders.user_id = users.id;
```

-   In this case it looks the same as our `INNER JOIN`, because there are no orders without a customer

### orders on left

-   Again, Jane comes back, she's just on the right side of the resulting table now

```sql
SELECT *
FROM orders
RIGHT JOIN users
ON orders.user_id = users.id;
```

## `FULL JOIN`

-   All rows from both tables are kept

### users on left

```sql
SELECT *
FROM users
FULL JOIN orders
ON orders.user_id = users.id;
```

-   Again, looks like our `LEFT JOIN` because we didn't gain any new order rows

### orders on left

```sql
SELECT *
FROM orders
FULL JOIN users
ON orders.user_id = users.id;
```

-   Now this looks the same as the `RIGHT JOIN` from earlier

#### Collectively, `LEFT`, `RIGHT`, and `FULL` joins are known as `OUTER JOINS`

#### Many-to-Many requires a few extra steps that we'll cover in the next lecture
