/* Autor: Felix Schaphaus */

import { Entity } from './entity';

export interface Comment extends Entity {
  userId: string;
  description: string;
}
