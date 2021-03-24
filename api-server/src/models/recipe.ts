/* Autor: Felix Schaphaus */

import { Entity } from './entity';
import { Ingredient } from './ingredient';

export interface Recipe extends Entity {
  title: string;
  description: string;
  userId: string;
  ingredients: Ingredient[];
  cookbookIds: string[];
}
