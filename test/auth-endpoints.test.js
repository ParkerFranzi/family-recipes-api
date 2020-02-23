const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const bcrypt = require('bcryptjs')

describe('Auth Endpoints', () => {
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
  
    describe(`POST /api/auth/login`, () => {
      context('Given there are users in the database', () => {
        beforeEach('insert users', () =>
          
          helpers.seedRecipesTables(
            db,
            testUsers,
            testRecipes,
          )
        )
        it(`Given email doesn't exist, responds with 400 Incorrect email or password`, () => {
            const userLogin = {
                email: 'test@wrong.com',
                password: 'password'
            }
          return supertest(app)
            .post('/api/auth/login')
            .send(userLogin)
            .expect(400, {error: `Incorrect email or password`})
        })
        it(`Given wrong password, responds with 400 Incorrect email or password`, () => {
            const userLogin = {
                email: 'test@test1.com',
                password: 'wrong-password'
            }
          return supertest(app)
            .post('/api/auth/login')
            .send(userLogin)
            .expect(400, {error: `Incorrect email or password`})
        })
        it(`Given good credentials, responds with 200 and authToken`, () => {
            const userLogin = {
                email: 'test@test1.com',
                password: 'password'
            }
          return supertest(app)
            .post('/api/auth/login')
            .send(userLogin)
            .expect(200)
            .expect(res => {
                expect(res.body).to.have.property('authToken')
                expect(res.body).to.have.property('user_id')
                expect(res.body).to.have.property('role')
            })

        })
      })
  

    })
  

  
  
  })