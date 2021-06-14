/* Autor: Arne Hegemann */

import { UserSession } from './user-session';

describe('/recipes', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should GET recipes', async () => {
    const resp = await userSession.get('/recipes');
    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.results.recipes.length).toBeGreaterThanOrEqual(0);
  });

  it('should POST a recipe', async () => {
    const resp = await userSession.post('/recipes', {
      title: 'Rezept 2',
      description: 'Drölfte Rezept',
      userId: userSession.id,
      ingredients: [
        {
          name: 'Kartoffel',
          quantity: 10,
          unit: 'gram'
        }
      ],
      cookbookIds: [],
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'
    });
    expect(resp.status).toBe(201);

    const json = await resp.json();
    expect(json.id).toBeDefined();
  });
});

describe('/recipes/own', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should GET own recipes', async () => {
    const resp = await userSession.get('/recipes/own');
    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.results.recipes.length).toBeGreaterThanOrEqual(0);
  });
});

describe('/recipes/:userid', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should GET users recipes', async () => {
    const resp = await userSession.get('/recipes/' + userSession.id);
    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.results.recipes.length).toBeGreaterThanOrEqual(0);
  });
});

describe('/recipes/details/:recipeId', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should GET a recipe', async () => {
    const respPost = await userSession.post('/recipes', {
      title: 'Rezept 2',
      description: 'Drölfte Rezept',
      userId: userSession.id,
      ingredients: [
        {
          name: 'Kartoffel',
          quantity: 10,
          unit: 'gram'
        }
      ],
      cookbookIds: [],
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'
    });
    expect(respPost.status).toBe(201);
    const jsonPost = await respPost.json();
    expect(jsonPost.id).toBeDefined();

    const respGet = await userSession.get('/recipes/details/' + jsonPost.id);
    expect(respGet.status).toBe(200);
    const jsonGet = await respGet.json();
    expect(jsonGet.results.id).toBe(jsonPost.id);
  });
});

describe('/recipes/:recipeId', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should PATCH a recipe', async () => {
    const respPost = await userSession.post('/recipes', {
      title: 'Rezept 2',
      description: 'Drölfte Rezept',
      userId: userSession.id,
      ingredients: [
        {
          name: 'Kartoffel',
          quantity: 10,
          unit: 'gram'
        }
      ],
      cookbookIds: [],
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'
    });
    expect(respPost.status).toBe(201);
    const jsonPost = await respPost.json();
    expect(jsonPost.id).toBeDefined();
    expect(jsonPost.title).toBe('Rezept 2');
    const respPatch = await userSession.patch('/recipes/' + jsonPost.id, {
      title: 'Rezept 3',
      description: 'Drölfte Rezept',
      userId: userSession.id,
      ingredients: [
        {
          name: 'Kartoffel',
          quantity: 10,
          unit: 'gram'
        }
      ],
      cookbookIds: [],
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'
    });
    expect(respPatch.status).toBe(200);

    const respGet = await userSession.get('/recipes/details/' + jsonPost.id);
    expect(respGet.status).toBe(200);
    const jsonGet = await respGet.json();

    expect(jsonGet.results.id).toBe(jsonPost.id);
    expect(jsonGet.results.title).toBe('Rezept 3');
  });

  it('should DELETE a recipe', async () => {
    const respPost = await userSession.post('/recipes', {
      title: 'Rezept 2',
      description: 'Drölfte Rezept',
      userId: userSession.id,
      ingredients: [
        {
          name: 'Kartoffel',
          quantity: 10,
          unit: 'gram'
        }
      ],
      cookbookIds: [],
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'
    });
    expect(respPost.status).toBe(201);
    const jsonPost = await respPost.json();
    expect(jsonPost.id).toBeDefined();

    const respDelete = await userSession.delete('/recipes/' + jsonPost.id);
    expect(respDelete.status).toBe(200);

    const respGet = await userSession.get('/recipes/details/' + jsonPost.id);
    expect(respGet.status).toBe(404);
  });
});
