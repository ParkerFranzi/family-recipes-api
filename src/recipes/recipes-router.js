const express = require('express')
const path = require('path')
const RecipesService = require('./recipes-service')
const recipesRouter = express.Router()
const jsonBodyParser = express.json()
const multer = require('multer')
const fs = require('fs')

// upload file path
const FILE_PATH = 'uploads';

// configure multer
const upload = multer({
    dest: `${FILE_PATH}/`
});

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

recipesRouter
    .post('/', upload.single('image'), jsonBodyParser, (req, res, next) => {
        const { dishname, description, ingredients, instructions, preptime, cooktime, userid } = req.body
        const image = fs.readFileSync(req.file.path)
        const pic_type = req.file.mimetype
        const pic_name = req.file.originalname

        for (const field of ['dishname', 'description', 'ingredients', 'instructions', 'preptime', 'cooktime', 'userid']) {
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        }
        if (!req.file)
            return res.status(400).json({
                error: `Missing image in request body`
            })
        
        const newRecipe = {
            dishname,
            description,
            ingredients,
            instructions,
            preptime,
            cooktime,
            userid,
            image,
            pic_type,
            pic_name
        }
        console.log(newRecipe)
        return RecipesService.insertRecipe(
            req.app.get('db'),
            newRecipe
        )
            .then(recipe => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
                    .json(RecipesService.serializeRecipe(recipe))
            })
            .catch(next)
        })
module.exports = recipesRouter