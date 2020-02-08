CREATE TABLE family_recipes_recipes (
    id SERIAL PRIMARY KEY,
    userId INTEGER
        REFERENCES family_recipes_users(id) ON DELETE CASCADE NOT NULL,
    dishName TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients JSON NOT NULL,
    instructions JSON NOT NULL,
    image TEXT NOT NULL,
    prepTime TEXT NOT NULL,
    cookTime TEXT NOT NULL
);


