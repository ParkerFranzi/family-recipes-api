const xss = require('xss')

const RecipesService = {
    getAllRecipes(db) {
        return db
            .select('*').from('family_recipes_recipes')
    },
    getUsersRecipes(db, userId) {
        return db
            .select('*').from('family_recipes_recipes AS recipes')
            .where('recipes.userid', userId)
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
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
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
            picture: xss(user.picture)
        }
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
}
  
  module.exports = RecipesService