/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('sign-up', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.post('/users/sign-up', userSession.signUpData());
  });

  it('should delete a user', async () => {
    const response = await userSession.delete('/users');
    expect(response.status).toBe(200);
  });

  it('should not be possible (401 = Unauthorized) to delete a user with no/false JWT', async () => {
    userSession = new UserSession();
    const response = await userSession.delete('/users');
    expect(response.status).toBe(401);
  });
});
