# Chat App

A simple Node.js chat application using Express, EJS views, and a minimal MVC structure.

**Features**
- User registration and login
- Simple chat model and user model
- Authentication middleware for protected routes
- EJS views for `dashboard`, `login`, and `register`

## Prerequisites
- Node.js 16+ and npm
- (Optional) MongoDB or another database if `models` use a DB

## Installation
1. Clone the repo

```bash
git clone <repo-url>
cd "Chat App"
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then update the values as needed:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/dynamic-chat-app
SESSION_SECRET=replace-with-a-long-random-secret
```

`SESSION_SECRET` is required in production. Local development falls back to a temporary default if it is missing, but you should still set it in `.env`.

## Run

```bash
npm start
```

or for development with nodemon:

```bash
npm run dev
```

Open http://localhost:3000 (or the value of `PORT`).

## Project structure
- [app.js](app.js) — application entry point and Express setup
- [package.json](package.json) — project metadata and scripts
- [controllers/userController.js](controllers/userController.js) — user-related logic
- [routes/userRoute.js](routes/userRoute.js) — user routes
- [middleware/auth.js](middleware/auth.js) — authentication middleware
- [models/userModel.js](models/userModel.js) — user schema / model
- [models/chatModel.js](models/chatModel.js) — chat schema / model
- [views/dashboard.ejs](views/dashboard.ejs) — main chat/dashboard view
- [views/login.ejs](views/login.ejs) — login page
- [views/register.ejs](views/register.ejs) — registration page
- [public/](public/) — static assets (images, CSS, client JS)
