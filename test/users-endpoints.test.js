const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Users Endpoints', () => {
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

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          
          .expect(200, [])
      })
    })

    context('Given there are users in the database', () => {
      beforeEach('insert users', () =>
        
        helpers.seedRecipesTables(
          db,
          testUsers,
          testRecipes,
        )
      )

      it('responds with 200 and all of the users', () => {
        const expectedUsers = helpers.makeExpectedUsersArray().map(user =>
            user
        )

        
        return supertest(app)
          .get('/api/users')
          .expect(200, expectedUsers)
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

  describe(`POST /api/users/`, () => {
      context(`Adding a new user`, () => {
        beforeEach('insert users/recipes', () => 
        helpers.seedRecipesTables(
            db,
            testUsers,
            testRecipes,
        )
      )
      it(`creates a user, responding with 201 and the new user`, () => {
        const newUser = {
          fname: 'test',
          lname: 'test',
          email: 'test@email.com',
          password: 'test@Testing1'
        }
        async () => {
            const response = await chai.request(app)
        
            .post('/api/users')
            .field('Content-type', 'multipart/form-data')
            .field('fname', newUser.fname)
            .field('lname', newUser.lname)
            .field('email', newUser.email)
            .field('password', newUser.password)
            .attach('picture', './uploads/test.png')
            .expect(response.body.status).to.eql(201)
            .expect(response.body.data).to.have.property('id')
            .expect(response.body.data.fname).to.eql(newUser.fname)
            .expect(response.body.data.lname).to.eql(newUser.lname)
            .expect(response.body.data.email).to.eql(newUser.email)
            .expect(response.body.data).to.have.property('picture')
            .expect(response.body.data).to.have.property('pic_type')
            .expect(response.body.data).to.have.property('pic_name')
            .expect(response.body.data).to.have.property('public_id')

        }
      })
      it(`trying to add a user that has no image`, () => {
        const newUser = {
            fname: 'test',
            lname: 'test',
            email: 'test@email.com',
            password: 'test@Testing1'
        }
        async () => {
            const response = await chai.request(app)
        
            .post('/api/users')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .field('Content-type', 'multipart/form-data')
            .field('fname', newUser.fname)
            .field('lname', newUser.lname)
            .field('email', newUser.email)
            .field('password', newUser.password)
            .expect(response.body.status).to.eql(400)
            .expect(response.body.data.error).to.eql(`Missing image in request body`)

        }  
      })
    })
      
  })

//   describe(`PATCH /api/recipes/:recipeId`, () => {
//     context(`Editing a recipe`, () => {
//       beforeEach('insert users/recipes', () => 
//       helpers.seedRecipesTables(
//           db,
//           testUsers,
//           testRecipes,
//       )
//     )
//     it(`edits a recipe, responding with 201 and the new recipe, cooktime not added`, function() {
//       const testUser = testUsers[0]
//       const oldRecipe = testRecipes[0]
//       const newRecipe = {
//         userid: 2,
//         dishname: 'steak test',
//         description: 'steak testing test test test test',
//         ingredients: {
//             "ingredientList": [
//                 "Steak", 
//                 "Test 2",
//                 "Test 3",
//                 "Test 4",
//                 "Test 5" 
//             ]
//         },
//         instructions: {
//             "instructionList": [
//                 "Sear", 
//                 "Test 2",
//                 "Test 3",
//                 "Test 4",
//                 "Test 5" 
//             ]
//         },
//         public_id: 'steak-fake',
//         pic_type: 'image/jpg',
//         pic_name: 'steak-fake.jpg',
//         preptime: 'steak-test',
//       }
//       async () => {
//           const response = await chai.request(app)
      
//           .patch(`/api/recipes/${oldRecipe.id}`)
//           .set('Authorization', helpers.makeAuthHeader(testUser))
//           .field('Content-type', 'multipart/form-data')
//           .field('dishname', newRecipe.dishname)
//           .field('userid', newRecipe.userid)
//           .field('description', newRecipe.description)
//           .field('preptime', newRecipe.preptime)
//           .field('ingredients', JSON.stringify(newRecipe.ingredients))
//           .field('instructions', JSON.stringify(newRecipe.instructions))
//           .attach('image', './uploads/test.png')
//           .expect(response.body.status).to.eql(201)
//           .expect(response.body.data).to.have.property('id')
//           .expect(response.body.data.dishname).to.eql(newRecipe.dishname)
//           .expect(response.body.data.description).to.eql(newRecipe.description)
//           .expect(response.body.data.ingredients).to.eql(newRecipe.ingredients)
//           .expect(response.body.data.instructions).to.eql(newRecipe.instructions)
//           .expect(response.body.data.preptime).to.eql(newRecipe.preptime)
//           .expect(response.body.data.cooktime).to.eql(oldRecipe.cooktime)
//           .expect(response.body.data.userid).to.eql(newRecipe.userid)
//           .expect(response.body.data).to.have.property('image')
//           .expect(response.body.data).to.have.property('pic_type')
//           .expect(response.body.data).to.have.property('pic_name')
//           .expect(response.body.data).to.have.property('public_id')

//       }
//     })
//     it(`trying to edit a recipe when not a admin or creator`, function() {
//         const testUser = testUsers[1]
//         const oldRecipe = testRecipes[0]
//         const newRecipe = {
//           userid: 1,
//           dishname: 'steak test',
//           description: 'steak testing test test test test',
//           ingredients: {
//               "ingredientList": [
//                   "Steak", 
//                   "Test 2",
//                   "Test 3",
//                   "Test 4",
//                   "Test 5" 
//               ]
//           },
//           instructions: {
//               "instructionList": [
//                   "Sear", 
//                   "Test 2",
//                   "Test 3",
//                   "Test 4",
//                   "Test 5" 
//               ]
//           },
//           public_id: 'steak-fake',
//           pic_type: 'image/jpg',
//           pic_name: 'steak-fake.jpg',
//           preptime: 'steak-test',
//         }
//         async () => {
//             const response = await chai.request(app)
        
//             .patch(`/api/recipes/${oldRecipe.id}`)
//             .set('Authorization', helpers.makeAuthHeader(testUser))
//             .field('Content-type', 'multipart/form-data')
//             .field('dishname', newRecipe.dishname)
//             .field('userid', newRecipe.userid)
//             .field('description', newRecipe.description)
//             .field('preptime', newRecipe.preptime)
//             .field('ingredients', JSON.stringify(newRecipe.ingredients))
//             .field('instructions', JSON.stringify(newRecipe.instructions))
//             .attach('image', './uploads/test.png')
//             .expect(response.body.status).to.eql(401)
//             .expect(response.body.data.error).to.eql('Unauthorized request')
//         }
//     })
//     it(`trying to add malicious code`, function() {
//         const testUser = testUsers[0]
//         const oldRecipe = testRecipes[0]
//         const expectedResponse = 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
//         const newRecipe = {
//           userid: 1,
//           dishname: 'Naughty naughty very naughty <script>alert("xss");</script>',
//           description: 'Naughty naughty very naughty <script>alert("xss");</script>',
//           ingredients: {
//               "ingredientList": [
//                     'Naughty naughty very naughty <script>alert("xss");</script>', 
//                     "Test 2",
//                     "Test 3",
//                     "Test 4",
//                     "Test 5" 
//               ]
//           },
//           instructions: {
//               "instructionList": [
//                     'Naughty naughty very naughty <script>alert("xss");</script>', 
//                     "Test 2",
//                     "Test 3",
//                     "Test 4",
//                     "Test 5" 
//               ]
//           },
//           public_id: 'steak-fake',
//           pic_type: 'image/jpg',
//           pic_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
//           preptime: 'Naughty naughty very naughty <script>alert("xss");</script>',
//           cooktime: 'Naughty naughty very naughty <script>alert("xss");</script>',
//         }
//         async () => {
//             const response = await chai.request(app)
        
//             .patch(`/api/recipes/${oldRecipe.id}`)
//             .set('Authorization', helpers.makeAuthHeader(testUser))
//             .field('Content-type', 'multipart/form-data')
//             .field('dishname', newRecipe.dishname)
//             .field('userid', newRecipe.userid)
//             .field('description', newRecipe.description)
//             .field('preptime', newRecipe.preptime)
//             .field('ingredients', JSON.stringify(newRecipe.ingredients))
//             .field('instructions', JSON.stringify(newRecipe.instructions))
//             .attach('image', './uploads/test.png')
//             .expect(response.body.status).to.eql(201)
//             .expect(response.body.data.id).to.eql(oldRecipe.id)
//             .expect(response.body.data.dishname).to.eql(expectedResponse)
//             .expect(response.body.data.description).to.eql(expectedResponse)
//             .expect(response.body.data.ingredients.ingredientList[0]).to.eql(expectedResponse)
//             .expect(response.body.data.instructions.instructionList[0]).to.eql(expectedResponse)
//             .expect(response.body.data.preptime).to.eql(expectedResponse)
//             .expect(response.body.data.cooktime).to.eql(expectedResponse)
//             .expect(response.body.data.userid).to.eql(1)
//             .expect(response.body.data).to.have.property('image')
//             .expect(response.body.data).to.have.property('pic_type')
//             .expect(response.body.data).to.have.property('pic_name')
//             .expect(response.body.data).to.have.property('public_id')
            
//         }
//     })
//   })
    
// })
})


