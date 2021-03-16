/* Autor: Felix Schaphaus */

import { Entity } from './entity';
import { Recipe } from './recipe';

export interface Cookbook extends Entity {
  title: string;
  description: string;
  recipes: Recipe[];
}
