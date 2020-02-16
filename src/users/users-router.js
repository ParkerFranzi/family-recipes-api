const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const AuthService = require('../auth/auth-service')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const multer = require('multer')
const fs = require('fs')
const { requireAuth, requireSpecificUser } = require('../middleware/jwt-auth')
const cloudinary = require('cloudinary').v2
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
 
var upload = multer({ storage: storage })

cloudinary.config(cloudinaryConfig)
usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
// usersRouter
//     .route('/images/:userId')
//     .get((req, res, next) => {
//         UsersService.getUserImage(req.app.get('db'), req.params.userId)
//             .then(pictures => {
//                 console.log(pictures[0])
//                 res.sendFile(path.join(__dirname, `\..\\..\\${pictures[0].picture}`));
//             })
//             .catch(next)
//     })
usersRouter
    .route('/:userId')
    .get((req, res, next) => {
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
        const public_id = ''

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
        if (req.file.size > 3145728)
            return res.status(400).json({
                error: `Image size must be under 3MB`
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
                                public_id,
                                pic_type,
                                pic_name,
                                password: hashedPassword
                            }
                        
                            return uploader.upload(picture)
                                .then((result) => {
                                    if (result) 
                                        newUser.picture = result.url
                                        newUser.public_id = result.public_id
                                        console.log(newUser)
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

            })
            .catch(next)
        
    })
usersRouter
    .route('/:userId')
    .all(requireSpecificUser)

    .patch(upload.single('picture'), jsonBodyParser, (req, res, next) => {
        console.log(1)
        const { password, fname, lname, email, public_id, new_password, new_password_confirm } = req.body


        const oldPicture = public_id
        let userToUpdate = {}
        let picture = ''
        let pic_type = ''
        let pic_name = ''
        if (req.file === undefined) {
            userToUpdate = { fname, lname, email }
        }
        else {
            picture = req.file.path
            pic_name = req.file.originalname
            pic_type = req.file.mimetype
            userToUpdate = { fname, lname, email, picture, pic_name, pic_type }
            if (req.file.size > 3145728) {
                return res.status(400).json({
                    error: `Image size must be under 3MB`
                })
            }
        }
        console.log(2)
        if (new_password.length > 0) {
            const passwordError = UsersService.validatePassword(new_password)
            if (passwordError) 
                return res.status(400).json({ error: passwordError })
            if (new_password !== new_password_confirm) {
                return res.status(400).json({
                    error: `new password must match comfirm password`
                })
            }
            UsersService.hashPassword(new_password)
                .then(hashedPassword => {
                    userToUpdate.password = hashedPassword
                })
        }
        console.log(userToUpdate)
        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'fname', 'lname', 'picture' or 'new password'`
                }
                
            })
        }
        console.log(3)
        AuthService.getUserWithEmail(req.app.get('db'), email)
            .then(dbUser => {
                console.log("test")
                if (!dbUser)
                    return res.status(400).json({
                        error: `Incorrect password`
                    })
                AuthService.comparePasswords(password, dbUser.password)
                    .then(compareMatch => {
                        console.log("test 2")
                        if (!compareMatch)
                            return res.status(400).json({
                                error: `Incorrect password`
                            })
                        if (userToUpdate.picture) {
                            uploader.upload(picture).then((result) => {
                                if (result)
                                    userToUpdate.picture = result.url
                                    userToUpdate.public_id = result.public_id
                                    return UsersService.updateUser(
                                        req.app.get('db'),
                                        dbUser.id,
                                        userToUpdate
                                    )
                                        .then(user => {
                                            uploader.destroy(oldPicture)
                                            console.log(user)
                                            res
                                                .status(201)
                                                .json(UsersService.serializeUser(user))
                                        })
                                        .catch(next)
                                .catch((err) => res.statusMessage(400).json({
                                    error: `Something went wrong try again later`
                                }))
                            })
                        }
                        else {
                            return UsersService.updateUser(req.app.get('db'), dbUser.id, userToUpdate)
                                .then(user => {
                                    console.log(user)
                                    res
                                        .status(201)
                                        .json(UsersService.serializeUser(user))
                                })
                                .catch(next)
                        }
                    })
                    
        })
        
        return UsersService.updateUser(req.app.get('db'), req.params.userId, userToUpdate)
    })

usersRouter
    .route('/edit-user/:userId')
    .all(requireSpecificUser)
    .get((req, res, next) => {
        UsersService.getUserById(req.app.get('db'), req.params.userId)
            .then(user => {
                res.json(user)
            })
            .catch(next)
    })
module.exports = usersRouter