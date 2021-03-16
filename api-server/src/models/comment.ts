/* Autor: Felix Schaphaus */

import { Entity } from './entity';
import { User } from './user';

export interface Comment extends Entity {
  user: User;
  description: string;
}
