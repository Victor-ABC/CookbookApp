/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('sign-out', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should succeed given proper credentials', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.delete('users/sign-out');
    expect(response.status).toBe(200);
    userSession.deleteUser();
  });
});
