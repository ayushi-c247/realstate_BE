This repository contains a backend project built using **Node.js** and **TypeScript**, with `pnpm` for package management, `Husky` for pre-commit hooks, and `ESLint` for code linting.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Linting & Formatting:** ESLint, Prettier
- **Commit Standardization:** Husky & Commitlint
- **Testing:** Jest (if needed)

---

## 📦 Project Setup

### 1️⃣ Prerequisites

Ensure you have the following installed:

- **Node.js** (latest LTS version recommended)
- **pnpm** (installed globally)

  ```sh
  npm install -g pnpm
  ```

### 2️⃣ Clone the Repository

```sh
  git clone https://github.com/your-repo/realstate_BE.git
  cd realstate_BE
```

### 3️⃣ Install Dependencies

```sh
  pnpm install
```

```sh
  npx prisma generate
```

```sh
  pnpm install
```

```sh
  npx prisma generate
```

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── models/                 # Database models
│   ├── middlewares/            # Express middlewares
│   ├── config/                 # Configuration files
│   ├── utils/                  # Utility functions
│   ├── tests/                  # Test cases
│   ├── index.ts                # Entry point
│   ├── app.ts                  # Express app setup
├── .env                        # Environment variables
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # pnpm lock file
└── README.md                   # Project documentation
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory and add required environment variables.

```env
PORT=3000
DATABASE_URL=your_database_url_here
```

---

## 🚀 Running the Project

### Development Mode

To start the project in development mode with automatic reload:

```sh
pnpm run dev
```

### Production Mode

To build and run the project in production mode:

```sh
pnpm start
```

---

## 🔍 Linting & Code Formatting

This project follows strict linting and formatting rules.

### Run Linter

```sh
pnpm lint
```

### Auto-fix Linting Issues

```sh
pnpm lint --fix
```

---

## 📊 Database Schema

### Generate Prisma Tables

To generate Prisma tables and client:

```sh
npx prisma migrate dev --name table_name
pnpm prisma db push  #sync prima db with local db
npx prisma validate
```

To view database in Prisma Studio:

```sh
pnpm prisma studio
npx prisma migrate reset

```

---

## 🛠️ Husky & Commitlint Setup

Husky is used to enforce commit and branch naming conventions.

### Pre-commit Hooks (Lint Staged)

```json
"lint-staged": {
  "src/**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

### Branch Naming Convention

Valid branch names:

- `main`, `development`, `staging`
- Feature branches: `feat/your-feature-name`
- Bug fixes: `fix/your-bug-name`
- Refactoring: `refactor/your-refactoring`
- Optimization: `optm/your-optimization`

Invalid branch names will be rejected by Husky.

---

## 🛑 Commit Standardization (Commitlint)

We follow **Conventional Commits** for commit messages:

```sh
feat: add new API endpoint
fix: resolve authentication issue
refactor: improve database schema
optm: optimize query performance
```

Husky enforces commit messages using `commitlint` before committing.

---

## 🏗️ Production Build

To generate an optimized production build:

```sh
pnpm build
```

---

## 🔗 Useful Commands

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | Start development server    |
| `pnpm build` | Build production-ready code |
| `pnpm start` | Run built project           |
| `pnpm lint`  | Run ESLint                  |
| `pnpm test`  | Run tests (if configured)   |

---

## 📜 License

MIT License © 2025 SkillSome.

---

Happy coding! 🎉
