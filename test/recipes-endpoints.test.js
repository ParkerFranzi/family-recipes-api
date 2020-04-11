const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const fs = require('fs')


describe('Recipes Endpoints', () => {
  let db

  const {
    testUsers,
    testRecipes,
  } = helpers.makeRecipesFixtures()
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
  describe(`POST /api/recipes/`, () => {
      context(`Adding a new recipe`, () => {
        beforeEach('insert users/recipes', () => 
        helpers.seedRecipesTables(
            db,
            testUsers,
            testRecipes,
        )
      )
      it(`creates a recipe, responding with 201 and the new recipe`, () => {
        const testUser = testUsers[0]
        const newRecipe = {
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
          public_id: 'fake',
          pic_type: 'image/jpg',
          pic_name: 'fake.jpg',
          preptime: 'test-test',
          cooktime: 'test-test',
          servings: 'test-test',
        }
        async () => {
            const response = await chai.request(app)
        
            .post('/api/recipes')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .field('Content-type', 'multipart/form-data')
            .field('dishname', newRecipe.dishname)
            .field('userid', newRecipe.userid)
            .field('description', newRecipe.description)
            .field('preptime', newRecipe.preptime)
            .field('cooktime', newRecipe.cooktime)
            .field('servings', newRecipe.servings)
            .field('ingredients', JSON.stringify(newRecipe.ingredients))
            .field('instructions', JSON.stringify(newRecipe.instructions))
            .attach('image', './uploads/test.png')
            .expect(response.body.status).to.eql(201)
            .expect(response.body.data).to.have.property('id')
            .expect(response.body.data.dishname).to.eql(newRecipe.dishname)
            .expect(response.body.data.description).to.eql(newRecipe.description)
            .expect(response.body.data.ingredients).to.eql(newRecipe.ingredients)
            .expect(response.body.data.instructions).to.eql(newRecipe.instructions)
            .expect(response.body.data.preptime).to.eql(newRecipe.preptime)
            .expect(response.body.data.cooktime).to.eql(newRecipe.cooktime)
            .expect(response.body.data.servings).to.eql(newRecipe.servings)
            .expect(response.body.data.userid).to.eql(newRecipe.userid)
            .expect(response.body.data).to.have.property('image')
            .expect(response.body.data).to.have.property('pic_type')
            .expect(response.body.data).to.have.property('pic_name')
            .expect(response.body.data).to.have.property('public_id')

        }
      })
      it(`trying to add a recipe that has no image`, () => {
        const testUser = testUsers[0]
        const newRecipe = {
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
          public_id: 'fake',
          pic_type: 'image/jpg',
          pic_name: 'fake.jpg',
          preptime: 'test-test',
          cooktime: 'test-test',
          servings: 'test-test',
        }
        async () => {
            const response = await chai.request(app)
        
            .post('/api/recipes')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .field('Content-type', 'multipart/form-data')
            .field('dishname', newRecipe.dishname)
            .field('userid', newRecipe.userid)
            .field('description', newRecipe.description)
            .field('preptime', newRecipe.preptime)
            .field('cooktime', newRecipe.cooktime)
            .field('servings', newRecipe.servings)
            .field('ingredients', JSON.stringify(newRecipe.ingredients))
            .field('instructions', JSON.stringify(newRecipe.instructions))
            .expect(response.body.status).to.eql(400)
            .expect(response.body.data.error).to.eql(`Missing image in request body`)

        }  
      })
      it(`trying to add a recipe while not being logged in`, () => {
        const testUser = testUsers[0]
        const newRecipe = {
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
          public_id: 'fake',
          pic_type: 'image/jpg',
          pic_name: 'fake.jpg',
          preptime: 'test-test',
          cooktime: 'test-test',
          servings: 'test-test',
        }
        async () => {
            const response = await chai.request(app)
        
            .post('/api/recipes')
            .field('Content-type', 'multipart/form-data')
            .field('dishname', newRecipe.dishname)
            .field('userid', newRecipe.userid)
            .field('description', newRecipe.description)
            .field('preptime', newRecipe.preptime)
            .field('cooktime', newRecipe.cooktime)
            .field('servings', newRecipe.servings)
            .field('ingredients', JSON.stringify(newRecipe.ingredients))
            .field('instructions', JSON.stringify(newRecipe.instructions))
            .attach('image', './uploads/test.png')
            .expect(response.body.status).to.eql(401)
            .expect(response.body.data.error).to.eql('Unauthorized request')


        }
      })
    })
      
  })

  describe(`PATCH /api/recipes/:recipeId`, () => {
    context(`Editing a recipe`, () => {
      beforeEach('insert users/recipes', () => 
      helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
      )
    )
    it(`edits a recipe, responding with 201 and the new recipe, cooktime not added`, function() {
      const testUser = testUsers[0]
      const oldRecipe = testRecipes[0]
      const newRecipe = {
        userid: 2,
        dishname: 'steak test',
        description: 'steak testing test test test test',
        ingredients: {
            "ingredientList": [
                "Steak", 
                "Test 2",
                "Test 3",
                "Test 4",
                "Test 5" 
            ]
        },
        instructions: {
            "instructionList": [
                "Sear", 
                "Test 2",
                "Test 3",
                "Test 4",
                "Test 5" 
            ]
        },
        public_id: 'steak-fake',
        pic_type: 'image/jpg',
        pic_name: 'steak-fake.jpg',
        preptime: 'steak-test',
        servings: 'steak-test'
      }
      async () => {
          const response = await chai.request(app)
      
          .patch(`/api/recipes/${oldRecipe.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .field('Content-type', 'multipart/form-data')
          .field('dishname', newRecipe.dishname)
          .field('userid', newRecipe.userid)
          .field('description', newRecipe.description)
          .field('preptime', newRecipe.preptime)
          .field('servings', newRecipe.servings)
          .field('ingredients', JSON.stringify(newRecipe.ingredients))
          .field('instructions', JSON.stringify(newRecipe.instructions))
          .attach('image', './uploads/test.png')
          .expect(response.body.status).to.eql(201)
          .expect(response.body.data).to.have.property('id')
          .expect(response.body.data.dishname).to.eql(newRecipe.dishname)
          .expect(response.body.data.description).to.eql(newRecipe.description)
          .expect(response.body.data.ingredients).to.eql(newRecipe.ingredients)
          .expect(response.body.data.instructions).to.eql(newRecipe.instructions)
          .expect(response.body.data.preptime).to.eql(newRecipe.preptime)
          .expect(response.body.data.cooktime).to.eql(oldRecipe.cooktime)
          .expect(response.body.data.servings).to.eql(newRecipe.servings)
          .expect(response.body.data.userid).to.eql(newRecipe.userid)
          .expect(response.body.data).to.have.property('image')
          .expect(response.body.data).to.have.property('pic_type')
          .expect(response.body.data).to.have.property('pic_name')
          .expect(response.body.data).to.have.property('public_id')

      }
    })
    it(`trying to edit a recipe when not a admin or creator`, function() {
        const testUser = testUsers[1]
        const oldRecipe = testRecipes[0]
        const newRecipe = {
          userid: 1,
          dishname: 'steak test',
          description: 'steak testing test test test test',
          ingredients: {
              "ingredientList": [
                  "Steak", 
                  "Test 2",
                  "Test 3",
                  "Test 4",
                  "Test 5" 
              ]
          },
          instructions: {
              "instructionList": [
                  "Sear", 
                  "Test 2",
                  "Test 3",
                  "Test 4",
                  "Test 5" 
              ]
          },
          public_id: 'steak-fake',
          pic_type: 'image/jpg',
          pic_name: 'steak-fake.jpg',
          preptime: 'steak-test',
          servings: 'steak-test',
        }
        async () => {
            const response = await chai.request(app)
        
            .patch(`/api/recipes/${oldRecipe.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .field('Content-type', 'multipart/form-data')
            .field('dishname', newRecipe.dishname)
            .field('userid', newRecipe.userid)
            .field('description', newRecipe.description)
            .field('preptime', newRecipe.preptime)
            .field('servings', newRecipe.servings)
            .field('ingredients', JSON.stringify(newRecipe.ingredients))
            .field('instructions', JSON.stringify(newRecipe.instructions))
            .attach('image', './uploads/test.png')
            .expect(response.body.status).to.eql(401)
            .expect(response.body.data.error).to.eql('Unauthorized request')
        }
    })
    it(`trying to add malicious code`, function() {
        const testUser = testUsers[0]
        const oldRecipe = testRecipes[0]
        const expectedResponse = 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
        const newRecipe = {
          userid: 1,
          dishname: 'Naughty naughty very naughty <script>alert("xss");</script>',
          description: 'Naughty naughty very naughty <script>alert("xss");</script>',
          ingredients: {
              "ingredientList": [
                    'Naughty naughty very naughty <script>alert("xss");</script>', 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
              ]
          },
          instructions: {
              "instructionList": [
                    'Naughty naughty very naughty <script>alert("xss");</script>', 
                    "Test 2",
                    "Test 3",
                    "Test 4",
                    "Test 5" 
              ]
          },
          public_id: 'steak-fake',
          pic_type: 'image/jpg',
          pic_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
          preptime: 'Naughty naughty very naughty <script>alert("xss");</script>',
          cooktime: 'Naughty naughty very naughty <script>alert("xss");</script>',
          servings: 'Naughty naughty very naughty <script>alert("xss");</script>',
        }
        async () => {
            const response = await chai.request(app)
        
            .patch(`/api/recipes/${oldRecipe.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .field('Content-type', 'multipart/form-data')
            .field('dishname', newRecipe.dishname)
            .field('userid', newRecipe.userid)
            .field('description', newRecipe.description)
            .field('preptime', newRecipe.preptime)
            .field('cooktime', newRecipe.cooktime)
            .field('servings', newRecipe.servings)
            .field('ingredients', JSON.stringify(newRecipe.ingredients))
            .field('instructions', JSON.stringify(newRecipe.instructions))
            .attach('image', './uploads/test.png')
            .expect(response.body.status).to.eql(201)
            .expect(response.body.data.id).to.eql(oldRecipe.id)
            .expect(response.body.data.dishname).to.eql(expectedResponse)
            .expect(response.body.data.description).to.eql(expectedResponse)
            .expect(response.body.data.ingredients.ingredientList[0]).to.eql(expectedResponse)
            .expect(response.body.data.instructions.instructionList[0]).to.eql(expectedResponse)
            .expect(response.body.data.preptime).to.eql(expectedResponse)
            .expect(response.body.data.cooktime).to.eql(expectedResponse)
            .expect(response.body.data.servings).to.eql(expectedResponse)
            .expect(response.body.data.userid).to.eql(1)
            .expect(response.body.data).to.have.property('image')
            .expect(response.body.data).to.have.property('pic_type')
            .expect(response.body.data).to.have.property('pic_name')
            .expect(response.body.data).to.have.property('public_id')
            
        }
    })
  })
    
})
})
