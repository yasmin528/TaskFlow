# TaskFlow — Task Management Application

TaskFlow is a task management application built with Angular and RxJS. Users can create, edit, delete, and organize tasks, track their progress, and filter tasks by status.

## Live Demo

[**View TaskFlow Live Demo**](https://task-flow-iota-plum.vercel.app/)

## Technologies

- Angular 22
- TypeScript
- RxJS 7
- Angular Router
- Reactive Forms
- HttpClient
- Vitest

## Features

- User registration, login, and logout.
- Protected routes using authentication and guest guards.
- Dashboard with task statistics and completion rate.
- Create, edit, and delete tasks.
- Mark tasks as completed or pending.
- Search tasks by title or description.
- Filter tasks by status.
- View individual task details.
- Loading states, error handling, and retry functionality.
- Toast notifications and confirmation dialogs.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open `http://localhost:4200`.

**Demo Account**
- Email: `demo@taskflow.dev`
- Password: `Demo1234`

**Available Commands**

```bash
npm run build
npm test
```

## Project Structure

```text
src/app/
├── core/
│   ├── auth/
│   ├── notifications/
│   └── mock/
├── shared/
│   ├── components/
│   ├── utils/
│   └── validators/
├── features/
│   ├── auth/
│   └── dashboard/
│       ├── task-list/
│       ├── task-detail/
│       └── task-form/
├── models/
├── app.config.ts
└── app.routes.ts
```

## Mock API

The application uses a mock API to simulate backend functionality. No external backend is required.

## Future Improvements

- Integrate a real backend API.
- Add task priorities and due-date filters.
- Implement pagination for larger task lists.
- Expand automated test coverage.
