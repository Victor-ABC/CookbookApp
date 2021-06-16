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

interface ProblemObjectType {
  message: string;
  punishment: number;
}
type Problem = ProblemObjectType | undefined;

// READ_ME: Die Kommentar sind zum einfacheren lesen. Es wurde aber versucht, im Zuge eines guten Programmier-Stils "sprechende Namen" zu verwenden

const router = express.Router();

// user-Sign-in
router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  // Form should contain all Fields required
  checkFormPromise(req.body, ['name', 'password'], errors)
    .then(async () => {
      // authenticates user
      return userAuthenticate(req.body, userDAO, { name: req.body.name });
    })
    .then(user => {
      // if sign-in was sucessful, JWT is created and set
      authService.createAndSetToken({ id: user.id }, res);
      res.status(201).json(user);
    })
    .catch(() => {
      authService.removeToken(res);
      res.status(401).json({ message: 'Der Name oder das Passwort sind ungültig!' });
    });
});

// Sign-out User
router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

// Returns 200, if User does not exist. Else 401.
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

// create new user
router.post('/sign-up', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  // must contain all fields.
  checkFormPromise(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)
    .then(() => {
      // resolves, if password has strength of 100 (percent)
      return checkIfPasswordIsSave(req.body.password, errors);
    })
    .then(() => {
      // password must be equal passwordCheck
      return validatePasswords(req.body);
    })
    .then(() => {
      // checks, if user already exists.
      return checkIfUserAlreadyExistsPromise({ name: req.body.name }, userDAO);
    })
    // create User part
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
// delete user by id
router.delete('/', authService.expressMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
  const cookbookDAO: GenericDAO<Cookbook> = req.app.locals.cookbookDAO;
  const recipeDAO: GenericDAO<Recipe> = req.app.locals.recipeDAO;
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;

  // all artefacts of one user are deletet
  userDAO.delete(res.locals.user.id);
  commentDAO.deleteAll({ userId: res.locals.user.id });
  cookbookDAO.deleteAll({ userId: res.locals.user.id });
  recipeDAO.deleteAll({ userId: res.locals.user.id });
  messageDAO.deleteAll({ to: res.locals.user.id });

  authService.removeToken(res);
  res.status(200).end();
});

// Generic function which is also used to check JSON Object in file message.ts
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
// authenticates a User
async function userAuthenticate(form: formType, userDAO: GenericDAO<User>, filter: Partial<User>): Promise<User> {
  // eslint-disable-next-line
  return new Promise<User>(async (resolve, reject) => {
    const user = await userDAO.findOne(filter);
    if (user && (await bcrypt.compare(<string>form.password, user.password))) {
      resolve(user);
    }
    reject('Die zwei eingegebenen Passwörter stimmen nicht überein!!!');
  });
}

// Von hier ...

// compares password with passwordCheck
function validatePasswords(form: formType): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (form.password !== form.passwordCheck) {
      reject('Die zwei eingegebenen Passwörter stimmen nicht überein!!!');
    }
    resolve();
  });
}
// Generic function which is used in multible cases. Rejects, if username is alreays in use.
export function checkIfUserAlreadyExistsPromise(filter: Partial<User>, userDAO: GenericDAO<User>): Promise<void> {
  // eslint-disable-next-line
  return new Promise<void>(async (resolve, reject) => {
    //eslint-disable-line
    if (await userDAO.findOne(filter)) {
      reject('Dieser Name ist bereits vergeben');
    } else {
      resolve();
    }
  });
}
// resolves, if password is save. Otherwise, a String with all the missing "safety requirements" is returned
function checkIfPasswordIsSave(password: string, errorMessages: string[]) {
  // eslint-disable-next-line
  return new Promise<void>(async (resolve, reject) => {
    //eslint-disable-line
    const problems = calculatePasswordStrength(password);
    let strength = 100;
    let errorMessage = 'Registrierung Fehlgeschlagen, da das Password nicht sicher genug ist.';

    problems.forEach((problem: Problem) => {
      if (problem == null) return;
      strength -= problem.punishment;
      errorMessage += problem.message;
    });
    if (strength != 100) {
      errorMessage += `Aktueller Sicherheitsscore des Passwords: ${strength}%. Erforderlich: 100%`;
      errorMessages.push(errorMessage);
      reject(errorMessages);
    } else {
      resolve();
    }
  });
}
// returns an array of Problems. Each problem has a description and a punishment-score.
function calculatePasswordStrength(password: string) {
  const problems: Problem[] = [];
  problems.push(lenghtProblem(password));
  problems.push(lowercaseProblem(password));
  problems.push(uppercaseProblem(password));
  problems.push(numberProblem(password));
  problems.push(specialCharactersProblem(password));
  problems.push(reapeatCharactersProblem(password));
  return problems;
}

// checks a Regular Expression against a string and returns a "Problem-Object", if the string does not fulfill the minimum requirements.
function genericProblemFinder(password: string, regex: RegExp, type: string): Problem {
  const matches = password.match(regex) || [];
  // no match
  if (matches.length == 0) {
    return {
      message: `-> Password hat keine ${type}`,
      punishment: 15
    };
  }
  // one match
  if (matches.length == 1) {
    return {
      message: `-> Password hat nur ein ${type}`,
      punishment: 10
    };
  }
  // more then one match = no problem ( = null )
}
// checks, if password has lower case letters
function lowercaseProblem(password: string) {
  return genericProblemFinder(password, /[a-z]/g, 'Kleinbuchstaben');
}
// checks, if password has upper case letters
function uppercaseProblem(password: string) {
  return genericProblemFinder(password, /[A-Z]/g, 'Großbuchstaben');
}
// checks, if password has Numbers
function numberProblem(password: string) {
  return genericProblemFinder(password, /[0-9]/g, 'Zahlen');
}
// checks, if password has special character
function specialCharactersProblem(password: string) {
  return genericProblemFinder(password, /[^0-9a-zA-Z\s]/g, 'Sonderzeichen (!$%&*...)'); // ^ = inversion
}
// checks, if character on position n+1 is equal to n.
function reapeatCharactersProblem(password: string) {
  const matches = password.match(/(.)\1/g) || []; // abab wird nicht erkannt. sondern nur aabb
  if (matches.length > 0) {
    return {
      message: '-> Bitte keine selben Zeichen nebeneinander',
      punishment: matches.length * 10
    };
  }
}
// chekcs, if password is long enough.
function lenghtProblem(password: string) {
  const length = password.length;
  if (length <= 5) {
    return {
      message: '-> Password zu kurz',
      punishment: 40
    };
  }
  if (length < 10) {
    return {
      message: '-> Password könnte länger sein',
      punishment: 25
    };
  }
  // should have 10 or more characters
}

// Bis hier.
// Bei der Umsetzung habe ich mich am YouTube Tutorial Quelle: https://www.youtube.com/watch?v=7-1VZ2wF8pw (stand:10.6.21 ; 12:36 Uhr) orientiert.

export default router;
