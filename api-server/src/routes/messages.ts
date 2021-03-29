/* Autor: Victor */

import express from 'express';
import { Message } from '../models/message';
import { User } from '../models/user';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';
import { cryptoService } from '../services/crypto.service';
import { checkFormPromise } from './users';

const router = express.Router();

router.post('' , authService.expressMiddleware , async (req, res) => {
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    const errors: string[] = [];
    checkFormPromise(req.body , ['to', 'title', 'content', 'date'] , errors)
    .then( () => {
        let message = {
            to: req.body.to,
            title: req.body.title,
            content: req.body.content,
            date: req.body.date
        }
        console.log(message);
        return messageDAO.create(message);
    })
    .then( (message) => {
        console.log("message erfolgreich eingefügt");
        res.status(201).end();
    })
    .catch( (message : string[] ) => {
        res.status(400).json({ message });
    })
})


router.get("" , authService.expressMiddleware ,  async (req, res) => {
    console.log(res.locals.user.id );// gibt die id
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    let user = await userDAO.findOne({ id : res.locals.user.id })
    console.log("bei get request foudn user: ");
    console.log(user);
    if(user) {
        let messages = await messageDAO.findAll({ to : user.name });
        if(messages) {
            messages.forEach(m => console.log(m));
            res.status(200).json({ results : messages} );
        }
    }
    else {
        res.status(404).end();
    }
})



export default router;