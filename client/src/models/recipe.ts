/* Autor: Felix Schaphaus */

import { Entity } from './entity';

export interface Recipe extends Entity {
  title: string;
  description: string;
  image: string;
}
