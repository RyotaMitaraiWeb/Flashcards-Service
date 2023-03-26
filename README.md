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
DB_PORT="" # typically 5432
DB_USERNAME=""
DB_PASSWORD=""
DB_NAME=""
STAGE="" # Set this to "DEV" during development. This will build a Swagger UI and synchronize database migrations 
JWT_SECRET=""
```

## License
MIT