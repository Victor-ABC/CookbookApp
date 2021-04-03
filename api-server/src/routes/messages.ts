/* Autor: Victor */

import express from 'express';
import { Message } from '../models/message';
import { User } from '../models/user';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';
import { cryptoService } from '../services/crypto.service';
import { checkFormPromise } from './users';
import { rejects } from 'node:assert';

const router = express.Router();

router.post('', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  checkFormPromise(req.body, ['to', 'title', 'content', 'date'], errors)
    .then(async () => {
      const user: User | null = await userDAO.findOne({ name: req.body.to });
      if (!user) {
        return Promise.reject({ errorMessage: 'dieser Benutzer existiert nicht' });
      }
    })
    .then(async () => {
      const me: User = <User>await userDAO.findOne({ id: res.locals.user.id });
      if (me.name === req.body.to) {
        return Promise.reject({ infoMessage: 'Sie können sich selbst keine Nachrichten schicken' });
      }
    })
    .then(() => {
      const message = {
        to: req.body.to,
        title: req.body.title,
        content: req.body.content,
        date: req.body.date
      };
      return messageDAO.create(message);
    })
    .then(message => {
      res.status(200).json({ results: message });
    })
    .catch((message: string[]) => {
      res.status(401).json({ message });
    });
});

router.get('', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (user) {
    const messages = await messageDAO.findAll({ to: user.name });
    if (messages) {
      res.status(200).json({ results: messages });
    }
  } else {
    res.status(404).end();
  }
});
router.delete('/:id', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  messageDAO
    .delete(req.params.id)
    .then(result => {
      if (result) {
        res.status(200).end();
      } else {
        return Promise.reject('count not delete message');
      }
    })
    .catch(error => {
      res.status(401).json({ message: error });
    });
});

export default router;
