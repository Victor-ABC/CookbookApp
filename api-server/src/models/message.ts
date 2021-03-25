/* Autor: Victor */

import { Entity } from './entity';

export interface Message extends Entity {
    from : string;
    to : string;
    title: string;
    content : string;
    date: Date;
}