/* Autor: Victor Corbet */

import express from 'express';
import { Message } from '../models/message';
import { User } from '../models/user';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';
import { checkFormPromise } from './users';
import { cryptoService } from '../services/crypto.service';

const router = express.Router();

// sending new Message to OTHER User
router.post('', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  // JSON Object(earlier HTML-Form) must containt all required fields
  checkFormPromise(req.body, ['to', 'title', 'content', 'date'], errors)
    .then(async () => {
      // "TO" must exist
      const user: User | null = await userDAO.findOne({ name: req.body.to });
      if (!user) {
        return Promise.reject({ errorMessage: 'dieser Benutzer existiert nicht' });
      }
    })
    .then(async () => {
      // 'TO' can not be 'me'
      const me: User = <User>await userDAO.findOne({ id: res.locals.user.id });
      if (me.name === req.body.to) {
        return Promise.reject({ infoMessage: 'Sie können sich selbst keine Nachrichten schicken' });
      }
    })
    .then(() => {
      // Encrypes message in case the database gets hacked
      const message = {
        to: req.body.to,
        title: cryptoService.encrypt(req.body.title),
        content: cryptoService.encrypt(req.body.content),
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

// get all messages where "TO" = "me"
router.get('', authService.expressMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (user) {
    const messages = await messageDAO.findAll({ to: user.name });
    let decodedMessages : Message[] = [];
    if (messages) {
      // Decrypts message, so that it can be read
      messages.forEach( ( message : Message ) => {
        const decodedMessage : Message = {
          id: message.id,
          createdAt : message.createdAt,
          to: message.to,
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
// Deletes a message
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
