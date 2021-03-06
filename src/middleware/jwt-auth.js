const AuthService = require('../auth/auth-service')
const RecipeService = require('../recipes/recipes-service')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user)
                    return res.status(401).json({ error: 'Unauthorized request' })
                req.user = user
                next()
            })
        
    }   catch(error) {
        res.status(401).json({ error: 'Unauthorized request' })
    }
    
    
  }

function requireSpecificUser(req, res, next) {
    
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user)
                    return res.status(401).json({ error: 'Unauthorized request' })
                if (user.id === payload.user_id || payload.role === 3) {
                    req.user = user
                    next()
                }
                else {
                    return res.status(401).json({ error: 'Unauthorized request '})
                }
            })
        
    }   catch(error) {
        res.status(401).json({ error: 'Unauthorized request' })
    }
}

function requireRecipeUser(req, res, next) {
    
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithEmail(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user)
                    return res.status(401).json({ error: 'Unauthorized request' })
                RecipeService.getRecipeById(req.app.get('db'), req.params.recipeId)
                    .then(recipe => {
                        if (user.id === recipe[0].userid || payload.role === 3) {
                            req.user = user
                            next()
                        }
                        else {
                            return res.status(401).json({ error: 'Unauthorized request '})
                        }
                    })

            })
        
    }   catch(error) {
        res.status(401).json({ error: 'Unauthorized request' })
    }
}
  
module.exports = {
    requireAuth,
    requireSpecificUser,
    requireRecipeUser
}