/* Autor: Victor Corbet */

import { UserSession } from './user-session';

describe('message: ', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should not be possible to send message to a user who does not exist', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.post('/message', { invalidInput: 'invalid' });
    expect(response.status).toBe(401);
    userSession.deleteUser();
  });
  it('should not be possible to delete a message which does not exist', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.delete('/message/' + 2);
    expect(response.status).toBe(401);
    userSession.deleteUser();
  });
  it('should get messages (0)', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.get('/message');
    expect(response.status).toBe(200);
    userSession.deleteUser();
  });
});
