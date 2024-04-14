const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

const units = [
    {
        id  : 1,
        name: 'Grams'
    }, {
        id  : 2,
        name: 'Teaspoons'
    },{
        id  : 3,
        name: 'Pieces'
    }
]

const ingredients = [
    {
        id  : 1,
        name: 'Tomato',
        createdAt: '1519129755973',
        price: 3,
        unit: units.find(u => u.name === 'Pieces'),
        isDeletable: true,
    }, {
        id  : 2,
        name: 'French Fries',
        createdAt: '1519129725973',
        price: 4,
        unit: units.find(u => u.name === 'Grams'),
        isDeletable: true,
    }, {
        id  : 3,
        name: 'Steak',
        createdAt: '1519129725923',
        price: 15,
        unit: units.find(u => u.name === 'Grams'),
        isDeletable: true,
    }, {
        id  : 4,
        name: 'Dough',
        createdAt: '1519129725923',
        price: 5,
        unit: units.find(u => u.name === 'Grams'),
        isDeletable: true,
    }, {
        id  : 5,
        name: 'Maggi',
        createdAt: '1519129725923',
        price: 6,
        unit: units.find(u => u.name === 'Teaspoons'),
        isDeletable: true,
    }
]




const meals = [
    {
        id  : 1,
        name: 'Pizza',
        description: 'Delicious Pizza made with love <3',
        createdAt: '1519129755973',
        isDeletable: true,
        servings: 1,
        ingredients    : [{
          id: ingredients.find(i => i.name === 'Dough').id,
          name: ingredients.find(i => i.name === 'Dough').name,
          price: ingredients.find(i => i.name === 'Dough').price,
          amount: 123,
          unit: ingredients.find(i => i.name === 'Dough').unit
        }, {
          id: ingredients.find(i => i.name === 'Tomato').id,
          name: ingredients.find(i => i.name === 'Tomato').name,
          price: ingredients.find(i => i.name === 'Tomato').price,
          amount: 10,
          unit: ingredients.find(i => i.name === 'Tomato').unit
        }]
    },
    {
        id  : 2,
        name: 'Burger',
        description: 'Yummy burgerz',
        createdAt: '1519129755973',
        isDeletable: true,
        servings: 1,
        ingredients    : [{
          id: ingredients.find(i => i.name === 'Dough').id,
          name: ingredients.find(i => i.name === 'Dough').name,
          price: ingredients.find(i => i.name === 'Dough').price,
          amount: 1,
          unit: ingredients.find(i => i.name === 'Dough').unit
        }, {
          id: ingredients.find(i => i.name === 'Tomato').id,
          name: ingredients.find(i => i.name === 'Tomato').name,
          price: ingredients.find(i => i.name === 'Tomato').price,
          amount: 3,
          unit: ingredients.find(i => i.name === 'Tomato').unit
        }]
    }
]

const mealPreferences =
[
        {
          id  : 1,
          userID: 1,
          meal: meals.find(m => m.name === 'Pizza'),
          breakfast: false,
          lunch: true,
          dinner: true
        },
        {
          id  : 2,
          userID: 1,
          meal: meals.find(m => m.name === 'Burger'),
          breakfast: false,
          lunch: false,
          dinner: true
        }
];


//------------------------------------------------------------------------------


app.use(bodyParser.json());
app.use(cors());

app.get('/api/user/meal/preferences', (req, res) => {
    var userID = req.get("auth-loggedInUserID");
    const userMealPreferences = mealPreferences.filter(m => { return m.userID == userID });
    res.send(userMealPreferences);
});

app.put('/api/user/meal/preferences/:id', (req, res) => {
    const { mealID, breakfast, lunch, dinner } = req.body;
    const preferenceID =  req.params.id;
    const userID = req.get("auth-loggedInUserID");
    const preference = mealPreferences.find(p => { return p.id == preferenceID });
    const meal = meals.find(m => { return m.id == mealID });

    if(meal === undefined){
      return res.sendStatus(401);
    }

    var index = mealPreferences.indexOf(preference);
    if (~index) {
        preference.breakfast = breakfast;
        preference.lunch = lunch;
        preference.dinner = dinner;
        res.status(200).json(preference);
    }else{
        var newID = mealPreferences.length > 0 ? mealPreferences[mealPreferences.length-1].id + 1 : 1;
        newPreference = {
          id: newID,
          userID: userID,
          meal: meal,
          breakfast: breakfast,
          lunch: lunch,
          dinner: dinner
        }
      mealPreferences.push(newPreference);
      res.status(200).json(newPreference);
    }
});

app.delete('/api/user/meal/preferences/:id', (req, res) => {
    const preference = mealPreferences.find(p => {
      return p.id == req.params.id && p.userID == req.get("auth-loggedInUserID");
    });

    if(preference === undefined){
      return res.sendStatus(401);
    }
    var index = mealPreferences.indexOf(preference);
    if (~index) {
        mealPreferences.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});


///meals
app.get('/api/meals', (req, res) => {
    res.send(meals);
});

app.get('/api/meals/:id', (req, res) => {
    const meal = meals.find(m => { return m.id == req.params.id });
    res.send(meal);
});

app.delete('/api/meals/:id', (req, res) => {
    const meal = meals.find(r => { return r.id == req.params.id });
    if(!meal.isDeletable){
      return res.sendStatus(401);
    }
    var index = meals.indexOf(meal);
    if (~index) {
        meals.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});

app.put('/api/meals/:id', (req, res) => {
    const { name, description, ingredients , servings} = req.body;
    const meal = meals.find(m => { return m.id == req.params.id });
    var index = meals.indexOf(meal);

    if (~index) {
        meal.name = name;
        meal.description = description;
        meal.ingredients = ingredients;
        meal.servings = servings;
        res.status(200).json(meal);
    }else{
        var newID = meals.length > 0 ? meals[meals.length-1].id + 1 : 1;
        newMeal = {
            id: newID,
            name: name,
            description: description,
            ingredients: ingredients,
            servings: servings,
            createdAt: Date.now(),
            isDeletable: true
        }
        meals.push(newMeal);
        res.status(200).json(newMeal);
    }
});

//units
app.get('/api/units', (req, res) => {
    res.send(units);
});

//ingredients
app.get('/api/ingredients', (req, res) => {
    res.send(ingredients);
});

app.get('/api/ingredients/:id', (req, res) => {
    const ingredient = ingredients.find(r => { return r.id == req.params.id });
    res.send(ingredient);
});

app.put('/api/ingredients/:id', (req, res) => {
    const { name, unit, price } = req.body;
    const ingredient = ingredients.find(r => { return r.id == req.params.id });
    var index = ingredients.indexOf(ingredient);

    if (~index) {
        ingredient.name = name;
        ingredient.unit = unit;
        ingredient.price = price;
        res.status(200).json(ingredient);
    }else{
        var newID = ingredients.length > 0 ? ingredients[ingredients.length-1].id + 1 : 1;
        newIngredient = {
            id: newID,
            name: name,
            unit: unit,
            price: price,
            createdAt: Date.now(),
            isDeletable: true
        }
        ingredients.push(newIngredient);
        res.status(200).json(newIngredient);
    }
});

app.delete('/api/ingredients/:id', (req, res) => {
    const ingredient = ingredients.find(r => { return r.id == req.params.id });
    if(!ingredient.isDeletable){
      return res.sendStatus(401);
    }
    var index = ingredients.indexOf(ingredient);
    if (~index) {
        ingredients.splice(index, 1);
    }
    res.status(200).json({status:"ok"})
});


app.listen(3001, () => {
    console.log('MealService started on port 3001');
});
