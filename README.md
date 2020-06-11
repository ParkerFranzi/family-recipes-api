# Family Recipes API

Family Recipes API is the API I made for my Family Recipes App where family members and friends can have a place to share their favorite recipes with each other and make sure grandma's recipes are never forgotten.

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone FAMILY-RECIPES-API-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "family-recipes-api",`
7. You will need to setup a Cloudinary account, database, test database and enter the information in the env file that will look something like the following
    NODE_ENV=development
    PORT=8000
    DATABASE_URL=""
    TEST_DATABASE_URL=""
    JWT_SECRET=""
    CLOUDINARY_URL="" 	
    CLOUDINARY_CLOUD_NAME=""
    CLOUDINARY_API_KEY=""
    CLOUDINARY_API_SECRET="" 
8. There's also a seed file setup if you want a few recipes inserted for you

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## About the project

This was my first full stack development project starting from scratch.  There were a lot of hurdles that I went through to get the features I wanted implemented. Adding pictures being the biggest hurdle.  Being new to the back end and not a lot of experience with databases I did a lot of experimenting with ways of storing the files.  While I managed to turn the pictures to a bit string and store them in the database and got them to show up, I don't think viewers would appreciate the 100 MB+ page load of just a couple recipes.  I then found Cloudinary and after a bit of trial and error in the API calls I managed to use their servers to handle the picture load and send back optimized image url links instead.   