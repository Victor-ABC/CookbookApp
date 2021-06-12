/* Autor: Felix Schaphaus */

import express from 'express';
import { Cookbook } from '../models/cookbook';
import { GenericDAO } from '../models/generic.dao';
import { Recipe } from '../models/recipe';
import { User } from '../models/user';
import { authService } from '../services/auth.service';
import { cryptoService } from '../services/crypto.service';

const router = express.Router();

// get cookbook list from all users
router.get('/', async (req, res) => {
  const cookbooks = await getCookbooks(req.app.locals.cookbookDAO);
  res.status(200).json({ results: { cookbooks } });
});

// get list of own cookbooks
router.get('/own', authService.expressMiddleware, async (req, res) => {
  try {
    const cookbooks = await getCookbooksByUserId(
      req.app.locals.cookbookDAO,
      req.app.locals.userDAO,
      res.locals.user.id
    );

    res.status(200).json({ results: { ...cookbooks } });
  } catch {
    res.status(404).end();
  }
});

// get cookbook list from a user
router.get('/:userId', async (req, res) => {
  try {
    const cookbooks = await getCookbooksByUserId(req.app.locals.cookbookDAO, req.app.locals.userDAO, req.params.userId);

    res.status(200).json({ results: { ...cookbooks } });
  } catch {
    res.status(404).end();
  }
});

// create a new empty cookbook
router.post('/', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const errors: string[] = [];

  // validate body
  if (!validateBody(req.body, [{ key: 'title', type: 'string' }], errors)) {
    return res.status(400).json({ message: errors });
  }

  // create and store new cookbook in database
  const newCookbook = await cookbookDAO.create({
    title: cryptoService.encrypt(req.body.title),
    description: req.body.description ? cryptoService.encrypt(req.body.description) : '',
    userId: res.locals.user.id,
    recipeIds: []
  });

  // prepare json response
  res.status(201).json({
    id: newCookbook.id,
    title: cryptoService.decrypt(newCookbook.title)
  });
});

// update cookbook title or description
router.patch('/', authService.expressMiddleware, async (req, res) => {
  const errors: string[] = [];

  // validate body
  if (
    !validateBody(
      req.body,
      [
        { key: 'id', type: 'string' },
        { key: 'title', type: 'string' },
        { key: 'description', type: 'string' }
      ],
      errors
    )
  ) {
    return res.status(400).json({ message: errors });
  }

  try {
    const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
    const cookbook = await getCookbook(cookbookDAO, { id: req.body.id, userId: res.locals.user.id });

    cookbook.title = cryptoService.encrypt(req.body.title);
    cookbook.description = req.body.description ? cryptoService.encrypt(req.body.description) : '';
    await cookbookDAO.update(cookbook);

    res.status(200).end();
  } catch {
    res.status(404).end();
  }
});

// delete a cookbook
router.delete('/:cookbookId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;

  try {
    const cookbook = await getCookbook(cookbookDAO, { id: req.params.cookbookId, userId: res.locals.user.id });
    await cookbookDAO.delete(cookbook.id);

    res.status(200).end();
  } catch {
    res.status(404).end();
  }
});

// add a recipe to a cookbook
router.patch('/:cookbookId/:recipeId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

  try {
    const cookbook = await getCookbook(cookbookDAO, { id: req.params.cookbookId, userId: res.locals.user.id });
    const recipe = await getRecipe(recipeDAO, req.params.recipeId);

    // add recipeId to cookbook
    const recipeIds = cookbook.recipeIds;
    if (!recipeIds.includes(req.params.recipeId)) {
      recipeIds.push(req.params.recipeId);
      await cookbookDAO.update(cookbook);
    }

    // add cookbookId to recipe
    const cookbookIds = recipe.cookbookIds;
    if (!cookbookIds.includes(req.params.cookbookId)) {
      cookbookIds.push(req.params.cookbookId);
      await recipeDAO.update(recipe);
    }

    res.status(201).end();
  } catch {
    res.status(404).end();
  }
});

// delete a recipe from a cookbook
router.delete('/:cookbookId/:recipeId', authService.expressMiddleware, async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;

  try {
    const cookbook = await getCookbook(cookbookDAO, { id: req.params.cookbookId, userId: res.locals.user.id });
    const recipe = await getRecipe(recipeDAO, req.params.recipeId);

    let index: number;

    // remove recipeId from cookbook
    const recipeIds = cookbook.recipeIds;
    index = recipeIds.indexOf(req.params.recipeId);
    if (index != -1) {
      recipeIds.splice(index, 1);
      await cookbookDAO.update(cookbook);
    }

    // remove cookbookId from recipe
    const cookbookIds = recipe.cookbookIds;
    index = cookbookIds.indexOf(req.params.cookbookId);
    if (index != -1) {
      cookbookIds.splice(index, 1);
      await recipeDAO.update(recipe);
    }

    res.status(200).end();
  } catch {
    res.status(404).end();
  }
});

// get cookbook details
router.get('/details/:cookbookId', async (req, res) => {
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  try {
    const cookbook = await getCookbook(cookbookDAO, { id: req.params.cookbookId });
    const recipes = await recipeDAO.findAll({ cookbookIds: [cookbook.id] });
    const user = await getUser(userDAO, cookbook.userId);

    res.status(200).json({
      results: {
        id: cookbook.id,
        title: cryptoService.decrypt(cookbook.title),
        description: cookbook.description ? cryptoService.decrypt(cookbook.description) : '',
        author: {
          id: user.id,
          name: user.name
        },
        recipes: recipes.map(recipe => {
          return {
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            image: recipe.image
          };
        })
      }
    });
  } catch {
    res.status(404).end();
  }
});

// Below are helper functions to simplify error handling

/**
 * Validate the body of an HTTP request
 * @param body the request body
 * @param requiredFields the fields, that must be part of the body
 * @param errors reference to an array that stores error messages
 * @returns whether validation was a success or not
 */
function validateBody(
  body: { [key: string]: unknown },
  requiredFields: { key: string; type: string }[],
  errors: string[]
) {
  let hasErrors = false;

  // validate number of fields
  if (Object.keys(body).length !== requiredFields.length) {
    errors.push('Number of fields mismatch required number of fields.');
    hasErrors = true;
  }

  // validate each field
  requiredFields.forEach(field => {
    if (body[field.key] === undefined) {
      errors.push(`Field ${field.key} of type ${field.type} must exist.`);
      hasErrors = true;
    } else if (typeof body[field.key] !== field.type) {
      errors.push(`Field ${field.key} must be of type ${field.type}`);
      hasErrors = true;
    }
  });

  return !hasErrors;
}

/**
 * Get cookbooks from the database
 * @param dao the cookbook DAO
 * @param filter an optional filter
 * @returns a map of cookbooks
 */
async function getCookbooks(cookbookDao: GenericDAO<Cookbook>, filter?: Partial<Cookbook>) {
  const cookbooks = await cookbookDao.findAll(filter);

  return cookbooks.map(book => {
    return {
      id: book.id,
      title: cryptoService.decrypt(book.title),
      description: cryptoService.decrypt(book.description)
    };
  });
}

/**
 * Get cookbooks by user ID
 * @param cookbookDao the cookbook DAO
 * @param userDao the user DAO
 * @param userId the user id
 * @returns author + cookbooks
 */
async function getCookbooksByUserId(cookbookDao: GenericDAO<Cookbook>, userDao: GenericDAO<User>, userId: string) {
  // grab user form database
  const user = await userDao.findOne({ id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  // grab cookbooks
  const cookbooks = await getCookbooks(cookbookDao, { userId: user.id });

  // prepare response
  return {
    author: user.name,
    cookbooks
  };
}

/**
 * Get one cookbook
 * @param cookbookDao the cookbook dao
 * @param filter a filter to find a specific cookbook
 * @returns the cookbook
 */
async function getCookbook(cookbookDao: GenericDAO<Cookbook>, filter: Partial<Cookbook>) {
  const cookbook = await cookbookDao.findOne(filter);

  if (!cookbook) {
    throw Error('Cookbook not found');
  }

  return cookbook;
}

/**
 * Get a recipe for the recipe ID
 * @param recipeDao the recipe dao
 * @param recipeId the id of the recipe
 * @returns the recipe
 */
async function getRecipe(recipeDao: GenericDAO<Recipe>, recipeId: string) {
  const recipe = await recipeDao.findOne({ id: recipeId });

  if (!recipe) {
    throw new Error('Recipe not found');
  }

  return recipe;
}

/**
 * Get the user for the user ID
 * @param userDao the user dao
 * @param userId the id of the user
 * @returns the user
 */
async function getUser(userDao: GenericDAO<User>, userId: string) {
  const user = await userDao.findOne({ id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export default router;
