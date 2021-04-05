/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('sign-in', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should fail given wrong credentials', async () => {
    const response = await userSession.post('/users/sign-in', userSession.signUpData());
    expect(response.status).toBe(401);
  });

  it('should succeed given proper credentials', async () => {
    await userSession.registerUser();
    const response = await userSession.post('/users/sign-in', userSession.signInData());
    expect(response.status).toBe(201);
    userSession.deleteUser();
  });
});
