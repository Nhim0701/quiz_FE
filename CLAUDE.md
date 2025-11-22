# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based quiz application for taking practice tests across multiple categories (AWS DVA-C02, Google Cloud, JLPT N2). Users can log in, select a test type, answer questions with immediate feedback, flag questions for review, and view their test history.

## Development Commands

```bash
# Start development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Routing & State Flow

The app uses React Router with centralized state management in `src/routes/AppRoutes.jsx`:

- **AppRoutes.jsx**: Top-level routing component that manages user authentication state and test history state. All routes receive necessary data as props from here.
- **Route flow**: `/` → `/login` → `/profile` → `/test` → `/result` → back to `/profile`

State is passed down from AppRoutes:
- User data flows: AppRoutes → Login/Profile
- Test history flows: AppRoutes → Profile
- Test navigation uses React Router's `location.state` to pass test type and results between pages

### Page Structure

- **Login** (`src/pages/Login.jsx`): Simple email/password form. On successful login, calls `onLogin` callback to update user state in AppRoutes.
- **Profile** (`src/pages/Profile.jsx`): User dashboard showing test selector dropdown and test history table. Navigates to `/test` with `testType` in location state.
- **Test** (`src/pages/Test.jsx`): Quiz interface with question navigation, answer selection, flag/submit functionality. Reads `testType` from location.state and loads questions from QUESTION_BANK. Tracks answers/flags locally. On finish, navigates to `/result` with complete test data in location state.
- **Result** (`src/pages/Result.jsx`): Shows summary (correct/wrong counts) and detailed answer review. Calls `onAddResult` to add result to test history in AppRoutes.

### Data Management

**Question Bank**: Mock question data lives in `src/pages/Test.jsx` as `QUESTION_BANK` object keyed by test type (`aws`, `google`, `jlpt`). Each question has:
- `id`: Unique identifier
- `text`: Question text
- `options`: Array of answers with `id`, `text`, and `correct` boolean
- `explanation`: Text shown after submission
- `multiCorrect`: Boolean flag for multi-select questions

**State passing pattern**:
- Use React Router's `navigate(path, { state: {...} })` to pass data between pages
- Use `location.state` to read passed data in destination component
- Validate presence of required state and redirect if missing (see Test.jsx lines 62-66)

### Component Organization

Reusable components live in `src/components/`:
- `Button/` - Reusable button component
- `Card/` - Card wrapper component
- `QuestionCard/` - Question display component
- `TestSelector/` - Test type selector component

Note: `src/QuizApp.jsx` appears to be an older standalone quiz component with inline sample data. The current app flow uses the routing structure instead.

### Styling

Uses Tailwind CSS v4 with Vite plugin (`@tailwindcss/vite`). Inline utility classes are preferred over separate CSS files. Some legacy CSS files exist in components but new components should use Tailwind utilities exclusively.

## Key Implementation Details

**Multi-select question handling**: Questions can have `multiCorrect: true` flag. In Test.jsx, the `toggleOption` function (lines 91-110) checks this flag:
- If `multiCorrect`: allows multiple option selections
- If single-correct: replaces previous selection with new one

**Answer validation**: Answers are validated by comparing selected option IDs against correct option IDs. All correct options must be selected and no incorrect options selected for the answer to be marked correct (see Test.jsx lines 132-137).

**Question flagging**: Local state in Test component tracks flagged questions. Currently flags are not persisted in results - they're only used during active test session.

## Backend Integration

### Authentication (COMPLETED)

Authentication is fully integrated with the backend:

- **API Utility**: `src/utils/api.js` contains all API functions and token management
- **Login Flow**:
  1. User submits email/password in Login.jsx
  2. Calls `authAPI.login()` which POSTs to `/api/v1/auth/login`
  3. JWT token stored in localStorage
  4. Navigates to Profile page
- **Register Flow**:
  1. User submits name/email/password in Register.jsx
  2. Calls `authAPI.register()` which POSTs to `/api/v1/auth/register`
  3. JWT token stored in localStorage (user is auto-logged in)
  4. Navigates to Profile page
- **Protected Routes**: AppRoutes.jsx checks for valid token on mount and protects Profile/Test/Result pages
- **Logout**: Profile page has logout button that clears token and redirects to login

### Token Management

The `tokenManager` object in `src/utils/api.js` handles all token operations:
- `getToken()`: Retrieves token from localStorage
- `setToken(token)`: Stores token in localStorage
- `removeToken()`: Clears token (logout)
- `hasToken()`: Checks if token exists

All API requests automatically include the token in `Authorization: Bearer <token>` header if present.

### Dashboard Integration (COMPLETED)

The Profile page now displays a complete dashboard with real data from the backend:

- **Overall Statistics**: 4 stat cards showing total answered, correct answers, wrong answers, and accuracy percentage
- **Category Selection**: Dropdown populated from GET `/api/v1/questions/categories` (returns categories with question counts)
- **Performance by Category**: Shows accuracy breakdown per category with progress bars
- **Recent Activity**: Timeline of last 10 quiz attempts from GET `/api/v1/responses/dashboard`

The dashboard automatically loads on mount and gracefully handles empty state (no activity yet).

### Remaining Integration Needs

The following still use mock data and need backend integration:

- **Questions**: Test.jsx uses `QUESTION_BANK` - needs GET `/api/v1/questions?category={type}` endpoint
- **Submit Results**: Result.jsx only updates local state - needs POST `/api/v1/responses/submit` endpoint
