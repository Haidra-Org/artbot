# ArtBot Development Guide

## Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build && npm run postbuild` - Build for production
- **Lint**: `npm run lint` - Run ESLint
- **Test**: `npm test` - Run all tests
- **Test Single File**: `npx jest path/to/file.test.ts --watch` - Run specific test
- **Format Code**: `npm run prettier` - Format code with Prettier

## Code Style
- **TypeScript**: Use strict typing; enable `noUnusedLocals` and `noUnusedParameters`; never use `any` as a valid type
- **Imports**: Order: 1) React/Next.js, 2) External libraries, 3) Project modules
- **Components**: Use functional components with hooks
- **Error Handling**: Use try/catch for async operations; properly type errors
- **Naming**: PascalCase for components; camelCase for functions/variables
- **CSS**: Use Tailwind and CSS modules (*.module.css)
- **State Management**: Use Statery for global state
- **Testing**: Test business logic and component interactions

## Project Structure
- `app/` - Next.js app directory with route-based components
- `app/_components/` - Reusable UI components
- `app/_hooks/` - Custom React hooks
- `app/_utils/` - Helper functions and utilities
- `app/_stores/` - Statery state stores
- `app/_data-models/` - Data models and types
