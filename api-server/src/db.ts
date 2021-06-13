/* Autor: Felix Schaphaus */

import { MongoClient } from 'mongodb';
import { Express } from 'express';
import { Comment } from './models/comment';
import { Cookbook } from './models/cookbook';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao';
import { Recipe } from './models/recipe';
import { User } from './models/user';
import { MongoGenericDAO } from './models/mongo-generic.dao';
import { Message } from './models/message';

export default async function startDB(app: Express, dbms = 'in-memory-db') {
  switch (dbms) {
    case 'in-memory-db':
      startInMemoryDB(app);
      break;
    case 'mongodb':
      startMongoDB(app);
      break;
    default:
      throw new Error(`unsupported dbms: ${dbms}, use in-memory-db or mongodb instead`);
  }
  return async () => Promise.resolve();
}

function startInMemoryDB(app: Express) {
  app.locals.commentDAO = new InMemoryGenericDAO<Comment>();
  app.locals.cookbookDAO = new InMemoryGenericDAO<Cookbook>();
  app.locals.recipeDAO = new InMemoryGenericDAO<Recipe>();
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.messageDAO = new InMemoryGenericDAO<Message>();
}

async function startMongoDB(app: Express) {
  const db = (await connectToMongoDB())!.db('kochbuch');
  app.locals.commentDAO = new MongoGenericDAO<Comment>(db, 'comments');
  app.locals.cookbookDAO = new MongoGenericDAO<Cookbook>(db, 'cookbooks');
  app.locals.recipeDAO = new MongoGenericDAO<Recipe>(db, 'recipes');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.messageDAO = new MongoGenericDAO<Message>(db, 'message');
}

async function connectToMongoDB() {
  const url = 'mongodb://localhost:27017';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: { user: 'wi', password: 'wifhm' },
    authSource: 'kochbuch'
  };
  try {
    return await MongoClient.connect(url, options);
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err.stack);
    process.exit(1);
  }
}
