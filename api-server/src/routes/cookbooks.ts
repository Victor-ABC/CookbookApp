/* Autor: Felix Schaphaus */

import express from 'express';
import { Cookbook } from '../models/cookbook';
import { GenericDAO } from '../models/generic.dao';
import { Recipe } from '../models/recipe';
import { User } from '../models/user';
import { authService } from '../services/auth.service';

const router = express.Router();

// get cookbook list from all users
router.get('/', async (req, res) => {
  const cookbooks = await getCookbooks(req.app.locals.cookbookDAO);
  res.status(200).json({ results: { cookbooks } });
});

// get list of own cookbooks
router.get('/own', authService.expressMiddleware, async (req, res) => {
  const cookbooks = await getCookbooks(req.app.locals.cookbookDAO, { userId: res.locals.user.id });
  res.status(200).json({ results: { cookbooks } });
});

// get cookbook list from a user
router.get('/:userId', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const cookbooks = await getCookbooks(req.app.locals.cookbookDAO);

  // grab user form database
  const user = await userDAO.findOne({ id: req.params.userId });

  // validate user
  if (!user) {
    res.status(404).json({ message: 'Der Benutzer existiert nicht.' });
    return;
  }

  res.status(200).json({ results: { author: user.name, cookbooks } });
});

// create a new empty cookbook
router.post('/', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const errors: string[] = [];

  // validate parameters
  if (!hasRequiredFields(req.body, ['title'], errors)) {
    return res.status(400).json({ message: errors });
  }

  // create and store new cookbook in database
  const createdCookbook = await cookbookDAO.create({
    title: req.body.title,
    description: req.body.description || '',
    userId: res.locals.user.id,
    recipeIds: []
  });

  // prepare json response
  res.status(201).json({
    id: createdCookbook.id,
    title: createdCookbook.title
  });
});

// update cookbook title or description
router.patch('/', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const errors: string[] = [];

  // validate parameters
  if (!hasRequiredFields(req.body, ['id', 'title'], errors)) {
    return res.status(400).json({ message: errors });
  }

  // grab cookbook from database
  const cookbook = await cookbookDAO.findOne({
    id: req.body.id,
    userId: res.locals.user.id
  });

  // validate cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Ändern fehlen.' });
    return;
  }

  // update cookbook
  cookbook.title = req.body.title;
  cookbook.description = req.body.description;

  await cookbookDAO.update(cookbook);

  res.status(200).end();
});

// delete a cookbook
router.delete('/:cookbookId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  // grab cookbook from database
  const cookbook = await cookbookDAO.findOne({
    id: req.params.cookbookId,
    userId: res.locals.user.id
  });

  // delete cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Löschen fehlen.' });
  } else {
    cookbookDAO.delete(cookbook.id);
    res.status(200).end();
  }
});

// add a recipe to a cookbook
router.patch('/:cookbookId/:recipeId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

  // grab cookbook from database
  const cookbook = await cookbookDAO.findOne({
    id: req.params.cookbookId,
    userId: res.locals.user.id
  });

  // validate cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Ändern fehlen.' });
    return;
  }

  // grab recipe from database
  const recipe = await recipeDAO.findOne({
    id: req.params.recipeId
  });

  // validate recipe
  if (!recipe) {
    res.status(404).json({ message: 'Das Rezept existiert nicht.' });
    return;
  }

  let exists = true;

  // add recipeId to cookbook
  const recipeIds = cookbook.recipeIds;
  if (!recipeIds.includes(req.params.recipeId)) {
    recipeIds.push(req.params.recipeId);
    await cookbookDAO.update(cookbook);
    exists = false;
  }

  // add cookbookId to recipe
  const cookbookIds = recipe.cookbookIds;
  if (!cookbookIds.includes(req.params.cookbookId)) {
    cookbookIds.push(req.params.cookbookId);
    await recipeDAO.update(recipe);
    exists = false;
  }

  if (exists) {
    res.status(400).json({ message: 'Das Rezept existiert bereits im Kochbuch.' });
    return;
  }

  res.status(201).end();
});

// delete a recipe from a cookbook
router.delete('/:cookbookId/:recipeId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

  // grab cookbook from database
  const cookbook = await cookbookDAO.findOne({
    id: req.params.cookbookId,
    userId: res.locals.user.id
  });

  // validate cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Ändern fehlen.' });
    return;
  }

  // grab recipe from database
  const recipe = await recipeDAO.findOne({
    id: req.params.recipeId
  });

  // validate recipe
  if (!recipe) {
    res.status(404).json({ message: 'Das Rezept existiert nicht.' });
    return;
  }

  let index: number;
  let removed = false;

  // remove recipeId from cookbook
  const recipeIds = cookbook.recipeIds;
  index = recipeIds.indexOf(req.params.recipeId);
  if (index != -1) {
    recipeIds.splice(index, 1);
    await cookbookDAO.update(cookbook);
    removed = true;
  }

  // remove cookbookId from recipe
  const cookbookIds = recipe.cookbookIds;
  index = cookbookIds.indexOf(req.params.cookbookId);
  if (index != -1) {
    cookbookIds.splice(index, 1);
    await recipeDAO.update(recipe);
    removed = true;
  }

  if (!removed) {
    res.status(400).json({ message: 'Das Rezept existiert nicht mehr im Kochbuch.' });
    return;
  }

  res.status(200).end();
});

// get cookbook details
router.get('/details/:cookbookId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  // grab cookbook from database
  const cookbook = await cookbookDAO.findOne({ id: req.params.cookbookId });

  // validate cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht.' });
    return;
  }

  // grab recipes from database
  const recipes = await recipeDAO.findAll({
    cookbookIds: [cookbook.id]
  });

  // grab user form database
  const user = await userDAO.findOne({ id: cookbook.userId });

  // validate user
  if (!user) {
    res.status(404).json({ message: 'Der Benutzer existiert nicht.' });
    return;
  }

  // prepare json response
  const recipesDto = recipes.map(recipe => {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description
    };
  });

  res.status(200).json({
    results: {
      id: cookbook.id,
      title: cookbook.title,
      description: cookbook.description,
      author: {
        id: user.id,
        name: user.name
      },
      recipes: recipesDto
    }
  });
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' darf nicht leer sein.');
      hasErrors = true;
    }
  });
  return !hasErrors;
}

async function getCookbooks(dao: GenericDAO<Cookbook>, filter?: Partial<Cookbook>) {
  const cookbooks = await dao.findAll(filter);

  return cookbooks.map(book => {
    return { id: book.id, title: book.title, description: book.description };
  });
}

export default router;
