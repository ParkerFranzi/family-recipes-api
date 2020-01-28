CREATE TABLE family_recipes_users (
    id SERIAL PRIMARY KEY,
    fName TEXT NOT NULL,
    lName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    picture BYTEA NOT NULL,
    role INT NOT NULL,
    password TEXT NOT NULL
);