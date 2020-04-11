const xss = require('xss')

const RecipesService = {
    getAllRecipes(db) {
        return db
            .select('id', 'userid', 'dishname', 'description', 'ingredients', 'instructions', 'preptime', 'cooktime', 'servings', 'image', 'pic_type', 'pic_name', 'public_id').from('family_recipes_recipes')
    },
    getUsersRecipes(db, userId) {
        return db
            .select('id', 'userid', 'dishname', 'description', 'ingredients', 'instructions', 'preptime', 'cooktime', 'servings', 'image', 'pic_type', 'pic_name', 'public_id').from('family_recipes_recipes AS recipes')
            .where('recipes.userid', userId)
    },
    getRecipeById(db, recipeId) {
        return db
            .select('id', 'userid', 'dishname', 'description', 'ingredients', 'instructions', 'preptime', 'cooktime', 'servings', 'image', 'pic_type', 'pic_name', 'public_id').from('family_recipes_recipes AS recipes')
            .where('recipes.id', recipeId)
    },
    getRecipeImage(db, imgName) {
        return db
            .select('image').from('family_recipes_recipes')
            .where('pic_name', imgName)

    },
    getRecipeByUser(db, userId) {
        return db
            .select('*').from('family_recipes_recipes')
            .where('userid', userId)
    },
    insertRecipe(db, newRecipe) {
        return db
            .insert(newRecipe)
            .into('family_recipes_recipes')
            .returning('*')
            .then(([recipe]) => recipe)
    },
    updateRecipe(db, id, data) {
        return db
            .from('family_recipes_recipes')
            .where({ id })
            .update(data)
            .returning('*')
            .then(([recipe]) => recipe)
    },
    deleteRecipe(db, id) {
        return db
            .from('family_recipes_recipes')
            .where('id', id)
            .delete()
    },
    getRecipePublicId(db, id) {
        return db
            .select('public_id').from('family_recipes_recipes')
            .where('id', id)
    },
    serializeRecipe(recipe) {
        return {
            id: recipe.id,
            dishname: xss(recipe.dishname),
            description: xss(recipe.description),
            ingredients: xss(recipe.ingredients),
            instructions: xss(recipe.instructions),
            preptime: xss(recipe.preptime),
            cooktime: xss(recipe.cooktime),
            servings: xss(recipe.servings),
            userid: Number(xss(recipe.userid)),
            image: xss(recipe.image),
            pic_type: xss(recipe.pic_type),
            pic_name: xss(recipe.pic_name),
            public_id: xss(recipe.public_id)
        }
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
}
  
  module.exports = RecipesService