/* Autor: Victor */

import express from 'express';
import { Message } from '../models/message';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';

const router = express.Router();

router.post('' ,  (req, res) => {
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
})



export default router;