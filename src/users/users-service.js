const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    getAllUsers(db) {
        return db
            .select('id', 'fname', 'lname', 'email', 'pic_type', 'picture', 'pic_name', 'role', 'public_id').from('family_recipes_users')
    },
    getUserImage(db, userId) {
        return db
            .select('picture', 'pic_type').from('family_recipes_users')
            .where('id', userId)
    },
    getUsersRecipes(db, userId) {
        return db
            .select('*').from('family_recipes_recipes AS recipes')
            .where('recipes.userid', userId)
    },
    getUserById(db, userId) {
        return db
            .select('fname', 'lname', 'email', 'picture', 'public_id').from('family_recipes_users')
            .where('id', userId)
    },
    getUserRole(db, userId) {
        return db
            .select('role').from('family_recipes_users')
            .where('id', userId)
    },
    hasUserWithUserEmail(db, email) {
        return db('family_recipes_users')
            .where({ email })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('family_recipes_users')
            .returning('*')
            .then(([user]) => user)
    },
    updateUser(db, id, data) {
        return db
            .from('family_recipes_users')
            .where({ id })
            .update(data)
            .returning('*')
            .then(([user]) => user)
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be at least 8 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character'
        }
        return null
    },
    serializeUser(user) {
        return {
            id: user.id,
            fname: xss(user.fname),
            lname: xss(user.lname),
            email: xss(user.email),
            picture: xss(user.picture),
            pic_type: xss(user.pic_type),
            pic_name: xss(user.pic_name),
            password: xss(user.password),
        }
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
}
  
  module.exports = UsersService