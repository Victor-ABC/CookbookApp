/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('sign-up', () => {
  let userSession: UserSession;

  it('should create a new user in api-server', async () => {
    userSession = new UserSession();
    userSession.password = "abAB12asd*!";
    const response = await userSession.post('/users/sign-up', userSession.signUpData());
    expect(response.status).toBe(201);
  });

  it('should not be possible to create two users with the same Name', async () => {
    userSession = new UserSession();
    userSession.password = "abAB12asd*!";
    await userSession.post('/users/sign-up', userSession.signUpData());
    const response = await userSession.post('/users/sign-up', userSession.signUpData());
    expect(response.status).toBe(400);
  });
});
