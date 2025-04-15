# CLAUDE.md - Photo Map App Guidelines

## Build Commands
- `pnpm run dev` - Start development server
- `pnpm run build` - Build production version
- `pnpm run lint` - Run ESLint for code linting
- `pnpm run preview` - Preview production build locally

## Code Style Guidelines
- **Components**: PascalCase for components (PhotoMap, ExifExtractor)
- **Hooks**: camelCase with "use" prefix (useMobile, useToast)
- **Imports**: Use path aliases (@/* for src directory)
- **TypeScript**: Strict type checking enabled
- **Formatting**: ESLint with recommended configs for JS/TS
- **UI Components**: shadcn/ui component system with Tailwind CSS
- **Utils**: Utility functions in utils folder

## Project Structure
- React app using Vite, TypeScript, and Tailwind CSS
- Components organized in src/components
- Custom hooks in src/hooks
- Utility functions in src/utils
- UI components in src/components/ui

Always run `pnpm run lint` before committing changes.