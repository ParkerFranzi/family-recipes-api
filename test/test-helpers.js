const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            fname: 'test-user-fname-1',
            lname: 'test-user-lname-1',
            email: 'test@test1.com',
            password: 'password',
            picture: 'http://www.fakeimg.com/fake.jpg',
            public_id: 'fake',
            role: 3,
            pic_type: 'image/jpg',
            pic_name: 'fake.jpg',
        },
        {
            id: 2,
            fname: 'test-user-fname-2',
            lname: 'test-user-lname-2',
            email: 'test@test2.com',
            password: 'password',
            picture: 'http://www.fakeimg.com/fake2.jpg',
            public_id: 'fake2',
            role: 1,
            pic_type: 'image/jpg',
            pic_name: 'fake2.jpg',
        },
        {
            id: 3,
            fname: 'test-user-fname-3',
            lname: 'test-user-lname-3',
            email: 'test@test3.com',
            password: 'password',
            picture: 'http://www.fakeimg.com/fake3.jpg',
            public_id: 'fake',
            role: 3,
            pic_type: 'image/jpg',
            pic_name: 'fake3.jpg',
        },
    ]
}

function makeRecipesArray() {
    return [
        {
            id: 1,
            userid: 1,
            dishname: 'test-dishname',
            description: 'testing test test test test',
            ingredients: {
                "ingredientList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            instructions: {
                "instructionList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            image: 'http://www.fakeimg.com/fake.jpg',
            public_id: 'fake',
            pic_type: 'image/jpg',
            pic_name: 'fake.jpg',
            preptime: 'test-test',
            cooktime: 'test-test',
        },
        {
            id: 2,
            userid: 2,
            dishname: 'test-dishname2',
            description: 'testing test test test test',
            ingredients: {
                "ingredientList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            instructions: {
                "instructionList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            image: 'http://www.fakeimg.com/fake.jpg',
            public_id: 'fake',
            pic_type: 'image/jpg',
            pic_name: 'fake.jpg',
            preptime: 'test-test',
            cooktime: 'test-test',
        },
        {
            id: 3,
            userid: 2,
            dishname: 'test-dishname3',
            description: 'testing test test test test',
            ingredients: {
                "ingredientList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            instructions: {
                "instructionList": [
                    "Test 1", 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
                ]
            },
            image: 'http://www.fakeimg.com/fake.jpg',
            public_id: 'fake',
            pic_type: 'image/jpg',
            pic_name: 'fake.jpg',
            preptime: 'test-test',
            cooktime: 'test-test',
        },
    ]
}
// function makeExpectedUser(user) {

// }
// function makeExpectedRecipe(recipe) {
//     return {
//         id: recipe.id,
//         userid: recipe.userid,
//         dishname: recipe.dishname,
//         description: recipe.description,
//         ingredients: recipe.ingredients,
//         instructions: recipe.instructions,
//         image: recipe.image,
//         public_id: recipe.public_id,
//         preptime: recipe.preptime,
//         cooktime: recipe.cooktime
//     }
// }
function makeRecipesFixtures() {
    const testUsers = makeUsersArray()
    const testRecipes = makeRecipesArray()
    return { testUsers, testRecipes }
}

function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        family_recipes_recipes,
        family_recipes_users
        RESTART IDENTITY CASCADE`
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('family_recipes_users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('family_recipes_users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
}
function seedRecipesTables(db, users, recipes) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('family_recipes_recipes').insert(recipes)
        await trx.raw(
          `SELECT setval('family_recipes_recipes_id_seq', ?)`,
          [recipes[recipes.length - 1].id],
        )
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ userid: user.id, role: user.role }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
}
 
module.exports = {
    makeUsersArray,
    makeRecipesArray,
    makeRecipesFixtures,
    // makeExpectedRecipe,
    cleanTables,
    seedRecipesTables,
    seedUsers,
    makeAuthHeader
}