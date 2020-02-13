BEGIN;

TRUNCATE
  family_recipes_recipes,
  family_recipes_users
  RESTART IDENTITY CASCADE;

INSERT INTO family_recipes_users (fName, lName, email, picture, role, password)
VALUES
    ('Parker', 'Franzi', 'parker.franzi@gmail.com', 'uploads\brian-min.png', 3, 'qwerty'),
    ('Lucky','Franzi','lucky.franzi@gmail.com','uploads\brian-min.png', 2, 'asdfg'),
    ('Diane','Franzi','diane.franzi@gmail.com','uploads\brian-min.png', 2, 'zxcvb');

INSERT INTO family_recipes_recipes (userId, dishName, description, ingredients, instructions, image, prepTime, cookTime)
VALUES
    (
        2,
        'Sous Vide Steak',
        'Transform your steak by making sure it is perfectly cooked using sous vide',
        '{
            "ingredientList": [
                "Thick cut of ribeye, New York, Filet or any tender steak", 
                "Salt",
                "Pepper",
                "Garlic Powder *",
                "Butter *" 
            ]
        }',
        '{
            "instructionList": [
                "Set water bath on your Sous Vide machine to rare - 125F, medium rare - 130F, medium - 138F",
                "Apply generous amount of salt, pepper, and garlic powder to both sides of the steak",
                "Vacuum seal or place steak in a ziplock bag with as much air removed as possible",
                "Leave in bath for 1-4 hours making sure it does not float",
                "Remove steak from bag and pat dry",
                "Heat up cast iron as hot as possible, then add a little oil to the pan",
                "Carefully place steak in pan and check after about 30 seconds if a good crust has formed",
                "Flip the steak when ready and add some butter to the pan, when 2nd side is almost done reduce heat and baste butter on top of the steak",
                "Optionally let rest a few minutes or serve and enjoy immediately"    
            ]

        }',
        'https://www.parkerfranzi.com/wp-content/uploads/2020/01/sous-vide-steak-scaled.jpg',
        '5-15 min',
        '1-4 hrs'
    ),
    (
        2,
        'Sous Vide Ribs',
        'Tender juicy fall off the bone ribs without having to sit by a smoker all day',
        '{
            "ingredientList": [
                "Ribs", 
                "Salt",
                "Pepper",
                "Garlic Powder *",
                "Or Rub of choice"
            ]

        }',
        '{
            "instructionList": [
                "Set water bath on your Sous Vide machine to medium rare - 145F",
                "Apply generous amount of salt, pepper, and garlic powder or rub to cover ribs",
                "Vacuum seal or place pork chop in a ziplock bag with as much air removed as possible",
                "Leave in bath for 24-48 hours making sure it does not float",
                "Remove ribs from bag and pat dry",
                "Turn oven to 250F or put in smoker and leave ribs in for about an hour"
            ]

        }',
        'https://www.parkerfranzi.com/wp-content/uploads/2020/01/sous-vide-ribs-scaled.jpg',
        '5-15 min',
        '18-48 hrs'
    ),
    (
        1,
        'Spicy Peanut Chicken',
        'May not be super traditional Asian cusine but really tasty',
        '{
            "ingredientList": [
                "2 lbs Chicken Breast or Thighs", 
                "1 lb Brocolli",
                "6 tbsp Peanut Butter",
                "9 tbsp Soy Sauce",
                "3 tbsp Rice/White Vinegar",
                "Add Cayanne to taste",
                "Garlic Powder to taste",
                "Peanuts *",
                "Green Onion as garnish",
                "2 tbsp Cooking oil",
                "ginger"
            ]

        }',
        '{
            "instructionList": [
                "Cut up the chicken and brocolli into bite sized pieces, set brocolli aside",
                "In a bowl mix together, peanut butter, soy sauce, vinegar, garlic powder, cayanne, ginger until even consistancy, set aside",
                "Brown the chicken with the cooking oil of your choice",
                "Once chicken is cooked add in the brocolli and peanuts and stir fry for a few minutes, make sure not to drain any of the juices from the chicken",
                "Add the sauce on top over everything, mix everything then cover for about 5 minutes",
                "Garnish with green onion",
                "Serve over rice, cauliflower rice, noodles or just eat it straight"
            ]

        }',
        'https://www.parkerfranzi.com/wp-content/uploads/2020/01/spicy-peanut-chicken-scaled.jpg',
        '15-30 min',
        '30-45 min'
    ),
    (
        3,
        'Sous Vide Pork Shoulder',
        'Easy Pulled Pork Sous Vide',
        '{
            "ingredientList": [
                "Pork Shoulder 4+ lbs", 
                "Salt",
                "Pepper",
                "Garlic Powder *",
                "Or rub of your choice"
            ]

        }',
        '{
            "instructionList": [
                "Set water bath on your Sous Vide machine to more steak like - 140F, pulled pork- 160F",
                "Apply generous amount of salt, pepper, and garlic powder or rub of your choice covering everything",
                "Vacuum seal or place pork shoulder in a ziplock bag with as much air removed as possible",
                "Leave in bath for 18-36 hours lower temperatures you want to have in the bath towards the higher number, making sure it does not float",
                "If done at a low temperature sear the outside like a roast",
                "If done more like pulled pork shred some apart and fry some up in a pan for some crispness"
            ]

        }',
        'https://www.parkerfranzi.com/wp-content/uploads/2020/01/sous-vide-pulled-pork-scaled.jpg',
        '5-15 min',
        '18-48 hrs'
    );

COMMIT;