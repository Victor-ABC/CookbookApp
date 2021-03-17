/* Autor: Felix Schaphaus */

import express from 'express';
import { Cookbook } from '../models/cookbook';
import { GenericDAO } from '../models/generic.dao';
import { Recipe } from '../models/recipe';

const router = express.Router();

// get cookbooks from all users
router.get('/', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const books = (await cookbookDAO.findAll()).map(book => {
    return { id: book.id, title: book.title };
  });
  res.status(200).json({ results: books });
});

// get cookbooks from a specified user
router.get('/:userId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const filter: Partial<Cookbook> = { userId: req.params.userId };

  const books = (await cookbookDAO.findAll(filter)).map(book => {
    return { id: book.id, title: book.title };
  });
  res.status(200).json({ results: books });
});

// get cookbook details (including title, description and recipe list)
router.get('/:userId/:cookbookId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

  // grab cookbook from database
  const bookFilter: Partial<Cookbook> = { userId: req.params.userId, id: req.params.cookbookId };
  const book = await cookbookDAO.findOne(bookFilter);

  if (!book) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht.' });
  } else {
    // grab recipes form database
    const recipes: Partial<Recipe>[] = [];
    for (const recipeId of book.recipeIds) {
      const recipe = await recipeDAO.findOne({ id: recipeId });

      if (recipe) {
        recipes.push({ id: recipe.id, title: recipe.title });
      }
    }

    res.status(200).json({
      results: {
        id: book.id,
        title: book.title,
        description: book.description,
        userId: book.userId,
        recipes: recipes
      }
    });
  }
});

// delete a cookbook
router.delete('/:userId/:cookbookId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  // grab cookbook from database
  const filter: Partial<Cookbook> = {
    id: req.params.cookbookId,
    userId: req.params.userId // TODO replace userId with JWT token
  };
  const book = await cookbookDAO.findOne(filter);

  // delete cookbook
  if (!book) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Löschen fehlen.' });
  } else {
    cookbookDAO.delete(book.id);
    res.status(200).end();
  }
});

// create a new empty cookbook
router.post('/', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  const createdCookbook = await cookbookDAO.create({
    title: req.body.title,
    description: req.body.description,
    userId: req.body.userId, //TODO replace with userId from JWT token
    recipeIds: []
  });

  res.status(201).json({
    title: createdCookbook.title,
    description: createdCookbook.description,
    userId: createdCookbook.userId,
    recipeIds: createdCookbook.recipeIds
  });
});

// add a recipe to a cookbook
router.patch('/:userId/:cookbookId/:recipeId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  // grab cookbook from database
  const filter: Partial<Cookbook> = {
    id: req.params.cookbookId,
    userId: req.params.userId // TODO replace userId with JWT token
  };
  const cookbook = await cookbookDAO.findOne(filter);

  // add recipe to cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Ändern fehlen.' });
  } else {
    const recipeIds = cookbook.recipeIds;
    if (!recipeIds.includes(req.params.recipeId)) {
      recipeIds.push(req.params.recipeId);

      // update cookbook in database
      await cookbookDAO.update(cookbook);
      res.status(201).end();
    } else {
      res.status(400).json({ message: 'Das Rezept existiert bereits im Kochbuch. Erneutes Hinzufügen nicht möglich.' });
    }
  }
});

// delete a recipe from a cookbook
router.delete('/:userId/:cookbookId/:recipeId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  // grab cookbook from database
  const filter: Partial<Cookbook> = {
    id: req.params.cookbookId,
    userId: req.params.userId //TODO replace with userId from JWT token
  };
  const cookbook = await cookbookDAO.findOne(filter);

  // remove recipe from cookbook
  if (!cookbook) {
    res.status(404).json({ message: 'Das Kochbuch existiert nicht oder Berechtigungen zum Ändern fehlen.' });
  } else {
    const recipeIds = cookbook.recipeIds;
    const index = recipeIds.indexOf(req.params.recipeId);
    if (index != -1) {
      recipeIds.splice(index, 1); // remove recipe

      // update cookbook in database
      await cookbookDAO.update(cookbook);
      res.status(200).end();
    } else {
      res.status(404).json({ message: 'Das Rezept existiert nicht im Kochbuch und kann daher nicht gelöscht werden.' });
    }
  }
});

export default router;
