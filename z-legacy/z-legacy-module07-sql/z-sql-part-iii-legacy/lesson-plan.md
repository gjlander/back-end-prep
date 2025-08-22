# SQL Part III

## Topics covered

-   Joins revisited
-   Intermediary table
-   Syntax examples
-   CRUD operations in SQL

# Slide 2 - JOINS Refresher

-   JOIN only works with one-to-one or one-to-many relationships
-   In order to support many-to-many JOINs, we need an intermediary table

# Slide 3 - Table Example

-   orders and products have a many-to-many relationship
-   To properly query, we create order_has_products table
    -   order_has_products now has one-to-many relationship to both orders and products

# Slides 4-7 - Recreating users and orders tables

# Slide 8 - Creating new products table

-   DATE only includes day, TIMESTAMP includes time

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price FLOAT,
    name VARCHAR(255),
    date DATE
)
```

# Slide 9 - Inserting products

```sql
INSERT INTO products (price, name, date) VALUES ( 2, 'toy 1', '2001-01-01 00:00:00');

INSERT INTO products (price, name, date) VALUES ( 6.2, 'toy 2', '2001-01-01 00:00:00');
```

# Slide 10 - Creating order_has_products

-   Only 3 columns
    -   product_id
    -   order_id
    -   quantity
-   Now has 2 Foreign Keys, but now Primary Key
-   Can use combination of Foreign Keys as Primary Key

```sql
CREATE TABLE order_has_products (
    product_id int,
    order_id int,
    quantity int,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    PRIMARY KEY (product_id, order_id)
);
```

# Slide 11 - Inserting into order_has_products

```sql
INSERT INTO order_has_products (product_id, order_id, quantity) VALUES (1, 2, 10);

INSERT INTO order_has_products (product_id, order_id, quantity) VALUES (1, 1, 2);
```

# Slide 12 - JOIN on order_has_products

-   Now if we `SELECT` from order_has_products, we can `JOIN` both the orders table, and the products table

```sql
SELECT * FROM order_has_products
 JOIN orders ON orders.id = order_has_products.order_id
 JOIN products ON products.id = order_has_products.product_id;
```

# Slide 13 - query users table

-   We can also now query the users table to see all of their orders, and the products each order has

```sql
SELECT users.first_name, users.last_name, products.name as product_name, order_has_products.quantity
FROM users
JOIN orders ON orders.user_id = users.id
JOIN order_has_products ON orders.id = order_has_products.order_id
JOIN products ON products.id = order_has_products.product_id
WHERE users.id = 1;
```

-   Luckily for us, we'll be using a library to abstract this kind of complex query away.

# SQL CRUD

## Create

-   Old ducks table

```sql
CREATE TABLE ducks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    img_url VARCHAR(510),
    quote VARCHAR(510)
);
```

-   Must first `CREATE TABLE`
    -   `NOT NULL` means this column is required, it can't be left blank
    -   We can also set default values in case no value is provided

```sql
CREATE TABLE ducks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    img_url VARCHAR(510) NOT NULL,
    quote VARCHAR(510) DEFAULT 'I''m, here to help!',
    owner INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner) REFERENCES users(id)
);
```

-   Once table is created, `INSERT INTO` is our create
-   You can imagine on a POST request, the backend might make an `INSERT INTO` query
-   To get back our newly created item, we can add `RETURNING *` to the end of our query

```sql
INSERT INTO ducks (name, img_url, quote, owner)
VALUES ('Sr Developer Duckbert',
        'https://images.handyimprints.com.au/product/nerd-rubber-duck.jpg',
        'Come to me with your BIG bugs!',
        1)
RETURNING *;
```

## Read

-   `SELECT` queries
-   Add `WHERE` to meet specific conditions (such as matching user_id or email and password)
-   This is the query for GET requests
-   GET all ducks

```sql
SELECT * FROM ducks;
```

-   GET duck by id

```sql
SELECT * FROM ducks
JOIN users ON ducks.owner = users.id
WHERE ducks.id = 5;
```

## Update

-   `UPDATE <table_name> SET` is our command
-   Will also need `WHERE` clause to only update desired item
-   This is the query for PUT requests

```sql
UPDATE ducks
SET name = 'Darth Quaker',
    img_url = 'https://www.duckshop.de/media/image/3c/ce/25/Black_Star_Badeente_58495616_4_600x600.jpg',
    quote = 'I find your lack of testing disturbing',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 5
RETURNING *;
```

## Delete

-   `DELETE FROM` is our command
-   Will delete all rows if `WHERE` clause is not included
-   Common practice to not actually delete, but have something like an `active` column that can be adjusted to hide inactive users
-   For GDPR reasons, would eventually need to fully delete

```sql
DELETE FROM ducks
WHERE id = 7;
```
