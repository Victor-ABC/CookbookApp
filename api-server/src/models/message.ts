/* Autor: Victor */

import { Entity } from './entity';

export interface Message extends Entity {
    to : string;
    title: string;
    content : string;
    date: string;
}