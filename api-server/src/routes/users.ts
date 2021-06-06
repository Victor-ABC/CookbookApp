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
import fetch from 'node-fetch';

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
      res.status(200).json(true);
    })
    .catch(() => {
      res.status(401).json({ message: `Der Name ${req.body.name} ist bereits Vergeben` });
    });
});

router.post('/sign-up/:captcha', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  // const checkedCaptchaObject = await fetch(`https://www.google.com/recaptcha/api/siteverify?        wird im Browser nicht angezeigt.
  // 6LfbcRMbAAAAAHxvpu2DIIWTnf6S7gSzqmFTD0xy&response=${req.params.captcha}` , {
  //   method : "POST",
  // }).then(res => res.json())
  // if(checkedCaptchaObject.success === true) {
  checkFormPromise(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)
    .then( () => { // only here is new
      return checkIfPasswordIsSave(req.body.password , errors);
    })
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
  // } else {
  //   console.log("Google-Captcha-error");
  // }
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

function checkIfPasswordIsSave (password : string , errorMessages : string[]) {
  return new Promise<void>(async (resolve, reject) => { //eslint-disable-line
    const problems = calculatePasswordStrength(password);
    let strength : number = 100;
    let errorMessage = 'Registrierung Fehlgeschlagen, da das Password nicht sicher genug ist.';

      problems.forEach( (problem : any) => {
          if(problem == null) return
          strength -= problem.punishment
          errorMessage += problem.message;
      })
      if(strength != 100) {
        errorMessage += `Aktueller Sicherheitsscore des Passwords: ${strength}%. Erforderlich: 100%`
        errorMessages.push(errorMessage);
        reject(errorMessages);
    } else {
      resolve();
    }
  });
}

function calculatePasswordStrength(password : string) {
  const problems : any = []
  problems.push(lenghtProblem(password))
  problems.push(lowercaseProblem(password))
  problems.push(uppercaseProblem(password))
  problems.push(numberProblem(password))
  problems.push(specialCharactersProblem(password))
  problems.push(reapeatCharactersProblem(password))
  return problems
}

function genericProblemFinder(password : string, regex : RegExp, type : string ) {
  const matches = password.match(regex) || []
  if(matches.length == 0) {
      return {
          message: `-> Password hat keine ${type}`,
          punishment: 15
      }
  }
  if(matches.length == 1) {
      return {
          message: `-> Password hat nur ein ${type}`,
          punishment: 10
      }
  }
}

function lowercaseProblem(password : string) {
  return genericProblemFinder(password, /[a-z]/g , 'Kleinbuchstaben')
}
function uppercaseProblem(password : string) {
  return genericProblemFinder(password, /[A-Z]/g , 'Großbuchstaben')
}
function numberProblem(password : string) {
  return genericProblemFinder(password, /[0-9]/g , 'Zahlen')
}
function specialCharactersProblem(password : string) {
  return genericProblemFinder(password , /[^0-9a-zA-Z\s]/g , 'Sonderzeichen (!$%&*...)')
}
function reapeatCharactersProblem(password : string) {
  const matches = password.match(/(.)\1/g) || []   // abab wird nicht erkannt. sondern nur aabb 
  if( matches.length > 0) {
      return {
          message: '-> Bitte keine selben Zeichen nebeneinander',
          punishment: matches.length * 10
      }
  }
}
function lenghtProblem(password : string) {
  const length = password.length
  if ( length <= 5) {
      return {
          message: '-> Password zu kurz',
          punishment: 40
      }
  }
  if ( length < 10) {
      return {
          message: '-> Password könnte länger sein',
          punishment: 25
      }
  }
}

export default router;
