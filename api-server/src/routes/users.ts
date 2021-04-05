/* Autor: Victor Corbet */

import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { Comment } from '../models/comment';
import { Cookbook } from '../models/cookbook';
import { Recipe } from '../models/recipe';
import { authService } from '../services/auth.service';
import { Message } from '../models/message';

interface formType {
  [key: string]: string | number;
}
const router = express.Router();

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  checkFormPromise(req.body, ['name', 'password'], errors)
    .then(async () => {
      return userAuthenticate(req.body, userDAO, { name: req.body.name });
    })
    .then(user => {
      authService.createAndSetToken({ id: user.id }, res);
      res.status(201).json(user);
    })
    .catch(() => {
      authService.removeToken(res);
      res.status(401).json({ message: 'Der Name oder das Passwort sind ungültig!' });
    });
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

router.post('/exists', (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  checkIfUserAlreadyExistsPromise(req.body, userDAO)
    .then(() => {
      res.status(201).json(true);
    })
    .catch(() => {
      res.status(401).json({ message: `Der Name ${req.body.name} ist bereits Vergeben` });
    });
});

router.post('/sign-up', (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  checkFormPromise(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)
    .then(() => {
      return validatePasswords(req.body);
    })
    .then(() => {
      return checkIfUserAlreadyExistsPromise({ name: req.body.name }, userDAO);
    })
    .then(async () => {
      const createdUser = await userDAO.create({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10)
      });
      authService.createAndSetToken({ id: createdUser.id }, res);
      res.status(201).json(createdUser);
    })
    .catch((message: string[]) => {
      authService.removeToken(res);
      res.status(400).json({ message });
    });
});

router.delete('/', authService.expressMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;

  userDAO.delete(res.locals.user.id);
  commentDAO.deleteAll({ userId: res.locals.user.id });
  cookbookDAO.deleteAll({ userId: res.locals.user.id });
  recipeDAO.deleteAll({ userId: res.locals.user.id });
  messageDAO.deleteAll({ to: res.locals.user.id });

  authService.removeToken(res);
  res.status(200).end();
});

export function checkFormPromise(form: formType, requiredFields: string[], errors: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let isInvalid = false;
    for (let i = 0; i < requiredFields.length; i++) {
      if (!form[requiredFields[i]]) {
        errors.push(requiredFields[i] + ' muss ausgefüllt sein!!!');
        if (!isInvalid) {
          isInvalid = true;
        }
      }
    }
    if (isInvalid) {
      reject(errors);
    } else {
      resolve();
    }
  });
}
function userAuthenticate(form: formType, userDAO: GenericDAO<User>, filter: Partial<User>): Promise<User> {
  return new Promise<User>(async (resolve, reject) => { //eslint-disable-line
    const user = await userDAO.findOne(filter);
    if (user && (await bcrypt.compare(<string>form.password, user.password))) {
      resolve(user);
    }
    reject('Die zwei eingegebenen Passwörter stimmen nicht überein!!!');
  });
}
function validatePasswords(form: formType): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (form.password !== form.passwordCheck) {
      reject('Die zwei eingegebenen Passwörter stimmen nicht überein!!!');
    }
    resolve();
  });
}
export function checkIfUserAlreadyExistsPromise(filter: Partial<User>, userDAO: GenericDAO<User>): Promise<void> {
  return new Promise<void>(async (resolve, reject) => { //eslint-disable-line
    if (await userDAO.findOne(filter)) {
      reject('Dieser Name ist bereits vergeben');
    } else {
      resolve();
    }
  });
}

export default router;
