const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const fs = require('fs')


describe('Recipes Endpoints', function() {
  let db

  const {
    testUsers,
    testRecipes,
  } = helpers.makeRecipesFixtures()
  console.log(testRecipes)
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/recipes`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/recipes')
          
          .expect(200, [])
      })
    })

    context('Given there are recipes in the database', () => {
      beforeEach('insert recipes', () =>
        
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
        )
      )

      it('responds with 200 and all of the recipes', () => {
        const expectedRecipes = testRecipes.map(recipe =>
            recipe
        )
        return supertest(app)
          .get('/api/recipes')
          .expect(200, expectedRecipes)
      })
    })

    // context(`Given an XSS attack thing`, () => {
    //   const testUser = helpers.makeUsersArray()[1]
    //   const {
    //     maliciousThing,
    //     expectedThing,
    //   } = helpers.makeMaliciousThing(testUser)

    //   beforeEach('insert malicious thing', () => {
    //     return helpers.seedMaliciousThing(
    //       db,
    //       testUser,
    //       maliciousThing,
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/things`)
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].title).to.eql(expectedThing.title)
    //         expect(res.body[0].content).to.eql(expectedThing.content)
    //       })
    //   })
    // })
  })
  describe(`DELETE /api/delete-recipe/:recipeId`, () => {
      context(`Deleting a recipe`, () => {
        beforeEach('insert recipes', () =>      
            helpers.seedRecipesTables(
            db,
            testUsers,
            testRecipes,
            )
        )
        it(`deletes recipe, responding with 204`, () => {
            const testUser = testUsers[0]
            const recipeToDelete = 2
            const expectedRecipes = testRecipes.filter(recipe => recipe.id !== recipeToDelete)
            return supertest(app)
                .delete(`/api/recipes/delete-recipe/${recipeToDelete}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/recipes')
                        .expect(expectedRecipes)    
                ) 
        })
      })
  })
//   describe(`POST /api/recipes/`, () => {
//       context(`Adding a new recipe`, () => {
//         beforeEach('insert users/recipes', () => 
//         helpers.seedRecipesTables(
//             db,
//             testUsers,
//             testRecipes,
//         )
//       )
//       it(`creates a recipe, responding with 201 and the new recipe`, function() {
//         this.retries(3)
//         const testUser = testUsers[0]
//         const newRecipe = {
//           userid: 1,
//           dishname: 'test-dishname',
//           description: 'testing test test test test',
//           ingredients: {
//               "ingredientList": [
//                   "Test 1", 
//                   "Test 2",
//                   "Test 3",
//                   "Test 4",
//                   "Test 5" 
//               ]
//           },
//           instructions: {
//               "instructionList": [
//                   "Test 1", 
//                   "Test 2",
//                   "Test 3",
//                   "Test 4",
//                   "Test 5" 
//               ]
//           },
//           image: fs.readFileSync('./uploads/test.png'),
//           public_id: 'fake',
//           pic_type: 'image/jpg',
//           pic_name: 'fake.jpg',
//           preptime: 'test-test',
//           cooktime: 'test-test',
//         }
//         console.log(newRecipe.image)
//         return supertest(app)
//           .post('/api/recipes')
//           .set('Authorization', helpers.makeAuthHeader(testUser))
//           .send(newRecipe)
//           .expect(201)

//     })
//       })
      
      
//   })

})
