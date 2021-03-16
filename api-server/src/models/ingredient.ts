/* Autor: Felix Schaphaus */

import { Entity } from './entity';

export interface Ingredient extends Entity {
  name: string;
  unit: string;
  quantity: number;
}
