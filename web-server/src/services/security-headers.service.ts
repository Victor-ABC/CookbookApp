/* Autor: Felix Schaphaus */

import { Request, Response, NextFunction } from 'express';

class SecurityHeadersService {
  expressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'same-origin');
    res.set('Feature-Policy', `camera 'none'; geolocation 'none'; gyroscope 'none'; microphone 'none'; midi 'none'; payment 'none'`);
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.set('Content-Security-Policy', `script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; object-src 'none'; frame-ancestors 'none'`);
    next();
  };
}

export const securityHeadersService = new SecurityHeadersService();
