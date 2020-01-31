const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const multer = require('multer')
const fs = require('fs')

// upload file path
const FILE_PATH = 'uploads';

// configure multer
const upload = multer({
    dest: `${FILE_PATH}/`
});

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
    .post('/', upload.single('picture'), jsonBodyParser, (req, res, next) => {
        const { password, fname, lname, email } = req.body
        const picture = fs.readFileSync(req.file.path)
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
                                    res
                                        .status(201)
                                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                        .json(UsersService.serializeUser(user))
                                })
                        })

            })
            .catch(next)
        
  })

module.exports = usersRouter