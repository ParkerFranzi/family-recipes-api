const express = require('express')
const path = require('path')
const RecipesService = require('./recipes-service')

const recipesRouter = express.Router()
const jsonBodyParser = express.json()

recipesRouter
    .route('/')
    .get((req, res, next) => {
        RecipesService.getAllRecipes(req.app.get('db'))
            .then(recipes => {
                res.json(recipes)
            })
            .catch(next)
    })

recipesRouter
    .route('/:recipeId')
    .get((req, res, next) => {
        console.log(req.params.id)
        res.send('test')
    })
module.exports = recipesRouter