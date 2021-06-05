/* Autor: Victor Corbet */

import express from 'express';
import { Message } from '../models/message';
import { User } from '../models/user';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';
import { checkFormPromise } from './users';
import { cryptoService } from '../services/crypto.service';

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
        to: cryptoService.encrypt(req.body.to),//hier crypto encode
        title: cryptoService.encrypt(req.body.title),
        content: cryptoService.encrypt(req.body.content),
        date: req.body.date
      };
      return messageDAO.create(message);
    })
    .then(message => {
      // res.status(200).json({ results: message });
      res.status(200);
    })
    .catch((errorMessage: string[]) => {
      res.status(401).json({ errorMessage });
    });
});

router.get('', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (user) {
    const messages = await messageDAO.findAll({ to: user.name });
    let decodedMessages;
    if (messages) {
      messages.forEach( ( message : Message ) => {
        const decodedMessage = {
          to: cryptoService.decrypt(message.to),
          title: cryptoService.decrypt(message.title),
          content: cryptoService.decrypt(message.content),
          date: req.body.date
        };
        decodedMessages.push(decodedMessage);

      })
      res.status(200).json({ results: decodedMessages });
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
