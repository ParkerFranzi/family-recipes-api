const express = require('express')
const path = require('path')
const RecipesService = require('./recipes-service')
const UsersService = require('../users/users-service')
const recipesRouter = express.Router()
const jsonBodyParser = express.json()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { requireAuth, requireSpecificUser, requireRecipeUser } = require('../middleware/jwt-auth')
const { uploader, cloudinaryConfig } = require('../../cloudinaryConfig')

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

// var storage = multer.memoryStorage()

var upload = multer({ storage: storage })

cloudinary.config(cloudinaryConfig)

recipesRouter
    .route('/')
    .get((req, res, next) => {
        
        RecipesService.getAllRecipes(req.app.get('db'))
            .then(recipes => {
                res.json(recipes)
            })
            .catch(next)
    })
// recipesRouter
//     .route('/images/:imgName')
//     .get((req, res, next) => {
//         RecipesService.getRecipeImage(req.app.get('db'), req.params.imgName)
//             .then(pictures => {
//                 console.log(pictures[0])
//                 res.sendFile(path.join(__dirname, `\..\\..\\${pictures[0].image}`));
//             })
//             .catch(next)
//     })
recipesRouter
    .route('/')
    .all(requireAuth) 
    .post(upload.single('image'), jsonBodyParser, (req, res, next) => {
        const { dishname, description, ingredients, instructions, preptime, cooktime, userid, servings } = req.body
        for (const field of ['dishname', 'description', 'ingredients', 'instructions', 'preptime', 'cooktime', 'userid', 'servings']) {
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        }
        if (!req.file)
            return res.status(400).json({
                error: `Missing image in request body`
            })
        if (req.file.size > 3145728)
            return res.status(400).json({
                error: `Image size must be under 3MB`
            })
        let image = req.file.path
        const pic_type = ''
        const pic_name = req.file.originalname
        const public_id = ''
        const newRecipe = {
            dishname,
            description,
            ingredients,
            instructions,
            preptime,
            cooktime,
            servings,
            userid,
            image,
            public_id,
            pic_type,
            pic_name
        }
        
 
        uploader.upload(image).then((result) => {
            if (result) 
                
                newRecipe.image = result.secure_url
                newRecipe.public_id = result.public_id
                newRecipe.pic_type = result.format
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
                

            .catch((err) => res.statusMessage(400).json({
                error: `Something went wrong try again later`
            }))
        })
    })
    
recipesRouter
    .route('/:recipeId')
    .all(checkRecipeExists)
    .all(requireRecipeUser)
    .patch(upload.single('image'), jsonBodyParser, (req, res, next) => {
        const { dishname, description, ingredients, instructions, preptime, cooktime, userid, current_user, public_id, servings } = req.body
        const oldImage = public_id
        let recipeToUpdate = {}
        let image = ''
        let pic_type = ''
        let pic_name = ''
        if (req.file === undefined) {
            recipeToUpdate = { dishname, description, ingredients, instructions, preptime, cooktime, servings}
        } 
        else {
            image = req.file.path,
            pic_type = req.file.mimetype,
            pic_name = req.file.originalname
            recipeToUpdate = { dishname, description, ingredients, instructions, preptime, cooktime, servings, image, pic_type, pic_name, public_id}
            if (req.file.size > 3145728) {
                return res.status(400).json({
                    error: `Image size must be under 3MB`
                })
            }
        }

        const numberOfValues = Object.values(recipeToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'dishname', 'description', ingredients', instructions', 'preptime', 'cooktime', 'servings', or 'image'`
                }
                
            })
        }

        return UsersService.getUserRole(req.app.get('db'), Number(current_user))
            .then(userRole => {
                if (userRole[0].role !== 3 && current_user !== userid) {
                    return res.status(400).json({
                        error: `Must be recipe creator or admin`
                        
                    })
                }

                if (recipeToUpdate.image) {
                    uploader.upload(image).then((result) => {
                        if (result) 
                            recipeToUpdate.image = result.secure_url
                            recipeToUpdate.public_id = result.public_id
                            recipeToUpdate.pic_type = result.format
                            return RecipesService.updateRecipe(
                                req.app.get('db'),
                                req.params.recipeId,
                                recipeToUpdate
                            )
                                .then(recipe => {
                                    uploader.destroy(oldImage)
                                    res
                                        .status(201)
                                        .json(RecipesService.serializeRecipe(recipe))
                                })

                                .catch(next)
                            
            
                        .catch((err) => res.statusMessage(400).json({
                            error: `Something went wrong try again later`
                        }))
                    })

                }
                else {
                    return RecipesService.updateRecipe(req.app.get('db'), req.params.recipeId, recipeToUpdate)
                        .then(recipe => {
                            res
                                .status(201)                    
                                .json(RecipesService.serializeRecipe(recipe))
                        })
                        .catch(next)
                }
            })
    
    })

recipesRouter
    .route('/edit-recipe/:recipeId')
    .all(checkRecipeExists)
    .all(requireRecipeUser)
    .get((req, res, next) => {
        RecipesService.getRecipeById(req.app.get('db'), req.params.recipeId)
            .then(recipe => {
                res.json(recipe)
            })
            .catch(next)
    })

recipesRouter
    .route('/delete-recipe/:recipeId')
    .all(checkRecipeExists)
    .all(requireRecipeUser)
    .delete((req, res, next) => {
        RecipesService.getRecipePublicId(req.app.get('db'), req.params.recipeId)
        .then(pic => {
            const public_id = pic[0].public_id
            RecipesService.deleteRecipe(req.app.get('db'), req.params.recipeId)
            .then(() => {
                uploader.destroy(public_id)
                res.sendStatus(204).end()
            })
            .catch(next)
        })
        .catch(next)

    })

async function checkRecipeExists(req, res, next) {
    try {
        const recipe = await RecipesService.getRecipeById(
        req.app.get('db'),
        req.params.recipeId
        )
        if (!recipe[0])
        return res.status(404).json({
            error: `Recipe doesn't exist`
        })
    
        res.recipe = recipe
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = recipesRouter