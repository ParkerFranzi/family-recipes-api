const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const usersRouter = express.Router()
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

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
usersRouter
    .route('/images/:userId')
    .get((req, res, next) => {
        UsersService.getUserImage(req.app.get('db'), req.params.userId)
            .then(pictures => {
                console.log(pictures[0])
                res.sendFile(path.join(__dirname, `\..\\..\\${pictures[0].picture}`));
            })
            .catch(next)
    })
usersRouter
    .route('/:userId')
    .get((req, res, next) => {
        console.log(req.params.userId)
        UsersService.getUsersRecipes(req.app.get('db'), req.params.userId)
            .then(recipes => {
                res.json(recipes)
            })
            .catch(next)
    })
usersRouter
    .route('/')
    .post(upload.single('picture'), jsonBodyParser, (req, res, next) => {
        const { password, fname, lname, email } = req.body
        const picture = req.file.path
        const pic_type = req.file.mimetype
        const pic_name = req.file.originalname

        console.log(req.file)
        for (const field of ['fname', 'lname', 'email', 'password']) {
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        }
        if (!req.file)
            return res.status(400).json({
                error: `Missing picture in request body`
            })
        const passwordError = UsersService.validatePassword(password)
        if (passwordError) 
            return res.status(400).json({ error: passwordError })
            
        UsersService.hasUserWithUserEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithUserEmail => {
                if (hasUserWithUserEmail)
                    return res.status(400).json({ error: `Email already taken`})
                    
                    return UsersService.hashPassword(password)
                        .then(hashedPassword => {
                            const newUser = {
                                fname,
                                lname,
                                email,
                                picture,
                                pic_type,
                                pic_name,
                                password: hashedPassword
                            }
                            return UsersService.insertUser(
                                req.app.get('db'),
                                newUser
                            )
                                .then(user => {
                                    console.log(user)
                                    res
                                        .status(201)
                                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                        .json(UsersService.serializeUser(user))
                                })
                        })

            })
            .catch(next)
        
    })
usersRouter
    .route('/:userId')
    .all(requireAuth)
    .patch(jsonBodyParser, (req, res, next) => {
        const { password, fname, lname, email } = req.body
        const picture = fs.readFileSync(req.file.path)
        const pic_type = req.file.mimetype
        const pic_name = req.file.originalname
        const userToUpdate = { password, fname, lname, email, picture, pic_type, pic_name}
        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'fname', 'lname', 'picture' or 'content'`
                }
                
            })
        }
        UsersService.updateUser(req.app.get('db'), req.params.userId, userToUpdate)
    })


module.exports = usersRouter