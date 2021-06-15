/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('exists', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

   it('should succeed given proper credentials: does not exist', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    let response = await userSession.post('users/exists' , { name: userSession.signInData().name + "error" });
    expect(response.status).toBe(200);
    userSession.deleteUser();
  });
  it('should succeed given proper credentials: does exist', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    let response = await userSession.post('users/exists' , { name: userSession.signInData().name });
    expect(response.status).toBe(401);
    userSession.deleteUser();
  });
});