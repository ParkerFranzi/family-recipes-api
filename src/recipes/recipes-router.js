const express = require('express')
const path = require('path')
const RecipesService = require('./recipes-service')
const recipesRouter = express.Router()
const jsonBodyParser = express.json()
const multer = require('multer')
const fs = require('fs')
const { requireAuth } = require('../middleware/jwt-auth')

// upload file path
const FILE_PATH = 'uploads';

// configure multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${FILE_PATH}/`)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

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
    .route('/images/:imgName')
    .get((req, res, next) => {
        RecipesService.getRecipeImage(req.app.get('db'), req.params.imgName)
            .then(pictures => {
                console.log(pictures[0])
                res.sendFile(path.join(__dirname, `\..\\..\\${pictures[0].image}`));
            })
            .catch(next)
    })
recipesRouter
    .route('/')
    .all(requireAuth)
    .post(upload.single('image'), jsonBodyParser, (req, res, next) => {
        const { dishname, description, ingredients, instructions, preptime, cooktime, userid } = req.body
        const image = req.file.path
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

recipesRouter
    .route('/:recipeId')
    .get((req, res, next) => {
        console.log(req.params.id)
        res.send('test')
    })

recipesRouter
    .route('/:recipeId')
    .all(requireAuth)
    .patch(upload.single('image'), jsonBodyParser, (req, res, next) => {
        const { dishname, description, ingredients, instructions, preptime, cooktime, dishPic, picName, picType } = req.body
        let image = ''
        let pic_type = ''
        let pic_name = ''
        if (req.file === undefined) {
            image = dishPic
            pic_name = picName
            pic_type = picType
        } 
        else {
            image = req.file.path,
            pic_type = req.file.mimetype,
            pic_name = req.file.originalname
        }
        const recipeToUpdate = { dishname, description, ingredients, instructions, preptime, cooktime, image, pic_type, pic_name}
        const numberOfValues = Object.values(recipeToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'dishname', 'description', ingredients', instructions', 'preptime', 'cooktime', or 'image'`
                }
                
            })
        }
        return RecipesService.updateRecipe(req.app.get('db'), req.params.recipeId, recipeToUpdate)
            .then(recipe => {
                console.log(recipe)
                res
                    .status(201)                    
                    .json(RecipesService.serializeRecipe(recipe))
            })
            .catch(next)
    })

recipesRouter
    .route('/edit-recipe/:recipeId')
    .all(requireAuth)
    .get((req, res, next) => {
        RecipesService.getRecipeById(req.app.get('db'), req.params.recipeId)
            .then(recipe => {
                res.json(recipe)
            })
            .catch(next)
    })
module.exports = recipesRouter