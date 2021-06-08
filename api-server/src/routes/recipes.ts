/* Autor: Arne Hegemann */

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { Recipe } from '../models/recipe';
import { User } from '../models/user';
import { authService } from '../services/auth.service';

const router = express.Router();

// get recipes from all users
router.get('/', async (req, res) => {
    const recipes = await getRecipes(req.app.locals.recipeDAO);
    res.status(200).json({ results: { recipes } });
});

// get recipes of own recipes
router.get('/own', authService.expressMiddleware, async (req, res) => {
    const recipes = await getRecipes(req.app.locals.recipeDAO, { userId: res.locals.user.id });
    res.status(200).json({ results: { recipes } });
});

// get recipes from a user
router.get('/:userId', async (req, res) => {
    // get user form database
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: req.params.userId });

    // validate user
    if (!user) {
        res.status(404).json({ message: 'Der Benutzer existiert nicht.' });
        return;
    }

    const recipes = await getRecipes(req.app.locals.recipeDAO, { userId: user.id });

    res.status(200).json({ results: { author: user.name, recipes } });
});

// get recipe details
router.get('/details/:recipeId', async (req, res) => {
    
    const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;

    // get recipes from database
    const recipe = await recipeDAO.findOne({
        id: req.params.recipeId
    });

    if (!recipe) {
        res.status(404).json({ message: 'Das Rezept existiert nicht.' });
        return;
    }

    // get user form database
    const user = await userDAO.findOne({ id: recipe.userId });

    // validate user
    if (!user) {
        res.status(404).json({ message: 'Der Benutzer existiert nicht.' });
        return;
    }

    res.status(200).json({
        results: {
            id: recipe.id
            , title: recipe.title
            , description: recipe.description
            , user: recipe.userId
            , ingredients: recipe.ingredients
            , cookbookIds: recipe.cookbookIds
            , image: recipe.image
        }
    });
});

// create new recipe
router.post("/", authService.expressMiddleware, async (req, res) => {

    const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
    const errors: string[] = [];

    // validate fields
    if (!hasRequiredFields(req.body, errors)) {
        return res.status(400).json({ message: errors });
    }

    // add recipe to database
    const createdRecipe = await recipeDAO.create({
        title: req.body.title
        , description: req.body.description
        , userId: res.locals.user.id
        , ingredients: req.body.ingredients
        , cookbookIds: []
        , image: req.body.image
    });

    res.status(201).json({
        id: createdRecipe.id,
        title: createdRecipe.title
    });
});

// update recipe
router.patch('/:recipeId', authService.expressMiddleware, async (req, res) => {
    const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
    const errors: string[] = [];

    // validate parameters
    if (!hasRequiredFields(req.body, errors)) {
        return res.status(400).json({ message: errors });
    }

    // get recipe from database
    const recipe = await recipeDAO.findOne({
        id: req.params.recipeId,
        userId: res.locals.user.id
    });

    // validate recipe
    if (!recipe) {
        res.status(404).json({ message: 'Das Rezept existiert nicht oder Berechtigungen zum Ändern fehlen.' });
        return;
    }

    // update recipe
    recipe.title = req.body.title;
    recipe.description = req.body.description;
    recipe.ingredients = req.body.ingredients
    recipe.cookbookIds = []
    recipe.image = req.body.image

    await recipeDAO.update(recipe);

    res.status(200).end();
});

// delete a recipe
router.delete('/:recipeId', authService.expressMiddleware, async (req, res) => {
    const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

    // get recipe from database
    const recipe = await recipeDAO.findOne({
        id: req.params.recipeId,
        userId: res.locals.user.id
    });

    // delete recipe
    if (!recipe) {
        res.status(404).json({ message: 'Das Rezept existiert nicht oder Berechtigungen zum Löschen fehlen.' });
    } else {
        recipeDAO.delete(recipe.id);
        res.status(200).end();
    }
});

function hasRequiredFields(object: { [key: string]: unknown }, errors: string[]) {
    let hasErrors = false;

    if(!object['title']){
        errors.push('Title darf nicht leer sein.');
        hasErrors = true;
    }

    if(!object['description']){
        errors.push('Description darf nicht leer sein.');
        hasErrors = true;
    }

    if(!object['ingredients']){
        errors.push('Ingredients darf nicht leer sein.');
        hasErrors = true;
    }

    if(!object['image']){
        errors.push('Image darf nicht leer sein.');
        hasErrors = true;
    }

    return !hasErrors;
}

async function getRecipes(dao: GenericDAO<Recipe>, filter?: Partial<Recipe>) {
    const recipes = await dao.findAll(filter);

    return recipes.map(recipe => {
        return {
            id: recipe.id
            , title: recipe.title
            , description: recipe.description
            , image: recipe.image
        };
    });
}

export default router;