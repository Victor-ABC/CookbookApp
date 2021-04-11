/* Autor: Felix Schaphaus */

import { UserSession } from './user-session';

// Specs for /cookbooks/:cookbookId/:recipeId (DELETE and PATCH) still missing,
// as there is so far no endpoint to create recipes.

describe('/cookbooks', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#GET', () => {
    it('should return an cookbook list', async () => {
      const resp = await userSession.get('/cookbooks');
      expect(resp.status).toBe(200);
      const json = await resp.json();
      expect(json.results.cookbooks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('#POST', () => {
    it('should return a new cookbook', async () => {
      const resp = await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch'
      });
      expect(resp.status).toBe(201);
      const json = await resp.json();
      expect(json.id).toBeDefined();
      expect(json.title).toBe('Mein Kochbuch');
    });

    it('should fail to create a new cookbook', async () => {
      const resp = await userSession.post('/cookbooks', {
        // empty body
      });
      expect(resp.status).toBe(400);
    });
  });

  describe('#PATCH', () => {
    it('should update an existing cookbook', async () => {
      // create cookbook
      let resp = await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch 2'
      });

      let json = await resp.json();
      const updatedCookbook = {
        id: json.id,
        title: 'Mein Kochbuch 3',
        description: 'Meine Beschriebung 3'
      };

      // update cookbook
      resp = await userSession.patch('/cookbooks', updatedCookbook);
      expect(resp.status).toBe(200);

      // validate changes
      resp = await userSession.get(`/cookbooks/details/${updatedCookbook.id}`);
      expect(resp.status).toBe(200);
      json = await resp.json();
      expect(json.results.id).toBe(updatedCookbook.id);
      expect(json.results.title).toBe(updatedCookbook.title);
      expect(json.results.description).toBe(updatedCookbook.description);
    });

    it('should fail to update an existing cookbook', async () => {
      // create cookbook
      let resp = await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch 2'
      });

      const json = await resp.json();
      const cookbookId = json.id;

      // try to update cookbook
      resp = await userSession.patch('/cookbooks', {
        id: cookbookId
        // title missing
      });
      expect(resp.status).toBe(400);
    });

    it('should fail to find a cookbook', async () => {
      const resp = await userSession.patch('/cookbooks', {
        id: 'X', // invalid uuid
        title: 'Mein Kochbuch 3'
      });
      expect(resp.status).toBe(404);
    });
  });
});

describe('/cookbooks/:userId', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#GET', () => {
    it('should return at least one cookbook', async () => {
      // create cookbook
      await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch'
      });

      // find cookbook
      const userId = userSession.signUpData().id;
      const resp = await userSession.get(`/cookbooks/${userId}`);
      const json = await resp.json();
      expect(resp.status).toBe(200);
      expect(json.results.author).toBe(userSession.signUpData().name);
      expect(json.results.cookbooks.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail to find cookbooks of invalid user', async () => {
      const userId = 'X'; // invalid uuid;
      const resp = await userSession.get(`/cookbooks/${userId}`);
      expect(resp.status).toBe(404);
    });
  });
});

describe('/cookbooks/own', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#GET', () => {
    it('should return own cookbooks', async () => {
      // create two cookbooks
      await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch 1'
      });
      await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch 2'
      });

      // find cookbooks
      const resp = await userSession.get('/cookbooks/own');
      const json = await resp.json();
      expect(resp.status).toBe(200);
      expect(json.results.cookbooks.length).toBe(2);
      expect(json.results.cookbooks[0].id).toBeDefined();
      expect(json.results.cookbooks[0].title).toBe('Mein Kochbuch 1');
    });
  });
});

describe('/cookbooks/:cookbookId', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#DELETE', () => {
    it('should delete a cookbook', async () => {
      // create a cookbook
      let resp = await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch'
      });
      const json = await resp.json();
      const cookbookId = json.id;

      // delete the cookbook
      resp = await userSession.delete(`/cookbooks/${cookbookId}`);
      expect(resp.status).toBe(200);
    });

    it('should fail to delete a cookbook', async () => {
      const cookbookId = 'X'; // invalid uuid
      const resp = await userSession.delete(`/cookbooks/${cookbookId}`);
      expect(resp.status).toBe(404);
    });
  });
});

describe('/cookbooks/details/:cookbookId', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#GET', () => {
    it('should return cookbook details', async () => {
      // create a new cookbook
      let resp = await userSession.post('/cookbooks', {
        title: 'Mein Kochbuch',
        description: 'Meine Beschreibung'
      });
      let json = await resp.json();
      const cookbookId = json.id;

      // get cookbook details
      resp = await userSession.get(`/cookbooks/details/${cookbookId}`);
      json = await resp.json();
      expect(json.results.id).toBeDefined();
      expect(json.results.title).toBe('Mein Kochbuch');
      expect(json.results.description).toBe('Meine Beschreibung');
      expect(json.results.author.id).toBe(userSession.signUpData().id);
      expect(json.results.author.name).toBe(userSession.signUpData().name);
      expect(json.results.recipes.length).toBe(0);
    });
  });
});
