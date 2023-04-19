# Flashcards server
A rewrite of my Flashcards server in NestJS

## How to run
```bash
npm install
```
You should have an ``.env`` file at the root of the project with something like this:

```bash
CORS_ORIGIN=""
DB_HOST=""
DB_PORT="" # typically 5432, project uses Postgre
DB_USERNAME=""
DB_PASSWORD=""
DB_NAME=""
STAGE="" # Set this to "DEV" during development. This will build a Swagger UI and synchronize database migrations 
JWT_SECRET=""
SALT_ROUNDS="" # used for password hashing, must be a number
```

After that:
```bash
npm run start:dev
```

visit ``http://localhost:3000/swagger`` for an interactive API interface.

## Running tests

```bash
npm run test # unit tests
npm run test:watch # run unit tests in watch mode
npm run test:e22 # end-to-end tests
```

## Navigation
* For each module, check the respective subfolder in ``src/modules``
* For a list of available guards, check ``src/guards``
* For a list of available middlewares, check ``src/middlewares``
* For various helper functions, check ``src/util``
* For constant values, check ``src/constants``. The current categories of constant values are:
* * Validation rules (e.g. the minimum amount of characters that a username must consist of).
* * Validation error messages (e.g. invalid maximum length of username)
* * Invalid actions messages (e.g. failed login)
* For custom validators, check ``src/custom-validators``
* For custom interfaces, check ``interfaces``

Most sections listed here have their own documentation.

## License
MIT