# Full Stack Open, Part 13, Chapter 4 - integrated project

Includes exercises **13.18-13.26** in one codebase, based on your Chapter 3 project.
Exercise 13.27 is a **manual course-site repository submission**, not code.

## Important safety rules
- The ZIP omits `.env`, `.git`, and `node_modules`. Keep your existing copies on your PC.
- **Back up your database first**, especially if the old `DATABASE_URL` contains important data. The automatic migrations are intended to preserve existing Chapter 3 users/blogs; they do change table schemas.
- **Do not run `migration:down`** against a database with valuable data: reversing the initial schema migration drops user and blog tables.
- The test endpoint `/api/reset` clears all test data. It is disabled outside `TESTING=true`.
- **Use a separate, disposable database for `TEST_DATABASE_URL`**. Do not point it at the same database as `DATABASE_URL`.
- The demo login inherits your Chapter 3 behavior: users do not have stored password hashes, so this is **not a production-ready authentication design**.

## Windows setup
1. Stop old backend with Ctrl+C. Back up the existing `fullstack-part13` folder and the database.
2. Extract ZIP into a temporary directory; copy its **contents** into `C:\Users\Pranjal\Documents\fullstack-part13`, replacing matching source files. This should not overwrite `.git`, `.env`, or `node_modules`, since none are shipped.
3. Check your original `.env` contains `DATABASE_URL`, `TEST_DATABASE_URL` (a **different DB**), and `SECRET`. See `.env.example` for names only. Do not share real credentials.
4. From the project directory run `npm ci` to install dependencies.
5. **Terminal 1:** `npm run start:test` (must connect to the test database; it will apply migrations).
6. **Terminal 2:** `npm test` (tests call `/api/reset`, which wipes rows in the TEST database). Expected 8 Chapter 3 tests plus the Chapter 4 tests.
7. For the regular database, stop the test server, back up data and run `npm start`. Migrations are applied automatically, once per migration file.
8. Check `git status` and review changes/secret exposure before `git add`, `git commit`, and `git push`.
9. Check green GitHub Actions, then submit exercises individually on the course site; submit repo for 13.27 and lock only when ready.

## Migration files
- `01_initialize_schema`: create users/blogs on a fresh DB; on old Chapter 3 DB, keep existing data and add missing timestamps.
- `02_blog_year`: nullable integer year; model validates 1991-current year.
- `03_reading_lists`: join table (user/blog), default unread, prevents duplicate pairs.
- `04_sessions_and_disabled`: `users.disabled`, optional admin flag, session table.

A small transaction-based migration runner uses the existing Sequelize dependency and a `migrations` tracking table (no extra package needed). No `Model.sync({alter:true})` is used.

## API quick reference
- `POST /api/blogs` needs JWT, and accepts `year` (1991-current year).
- `POST /api/readinglists` `{ "userId": 1, "blogId": 1 }` adds an unread entry.
- `GET /api/users/:id?read=true|false` lists readings with their `readingList` `{id,read}` metadata.
- `PUT /api/readinglists/:id` `{ "read": true }` needs JWT of reading owner.
- `DELETE /api/logout` needs JWT; invalidates all sessions of the logged-in user.
- Set `users.disabled = true` from database to block existing sessions/login immediately.

## Testing status
JavaScript syntax is checked before packaging. PostgreSQL/Node integration tests **must still be run locally or on GitHub Actions**; do not submit until both suites are green.
