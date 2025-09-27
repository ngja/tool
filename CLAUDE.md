# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 application using React 19 and TypeScript, configured with Turbopack for enhanced development performance. The project uses Tailwind CSS v4 and is set up for the shadcn/ui component system.

## Development Commands

- `npm run dev` - Start development server with Turbopack optimization
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server

## Architecture

### Project Structure
- **App Router**: Uses Next.js App Router with `app/` directory structure
- **Layout**: Root layout in `app/layout.tsx` with Geist font configuration
- **Components**: Configured for shadcn/ui with aliases defined in `components.json`
- **Utilities**: Central utility functions in `lib/utils.ts` including `cn()` for class merging

### Styling System
- **Tailwind CSS v4**: Uses new CSS-first approach with `@import "tailwindcss"`
- **Design Tokens**: Custom CSS variables system for consistent theming
- **Dark Mode**: Configured with `.dark` class and comprehensive color variables
- **Component Library**: shadcn/ui setup with "new-york" style and Lucide icons

### TypeScript Configuration
- Strict mode enabled with path aliases (`@/*` maps to root directory)
- Next.js plugin configured for optimal development experience
- Target ES2017 with modern module resolution

### Path Aliases
As defined in `components.json`:
- `@/components` - UI components directory
- `@/lib` - Utility functions and shared logic
- `@/hooks` - React hooks
- `@/components/ui` - shadcn/ui components

## Key Files

- `app/globals.css` - Contains Tailwind imports and comprehensive design token definitions
- `lib/utils.ts` - Exports `cn()` function for conditional class merging with clsx and tailwind-merge
- `components.json` - shadcn/ui configuration with aliases and style preferences
- `next.config.ts` - Next.js configuration (currently minimal)

## Development Notes

- Uses Turbopack for both development and production builds for faster compilation
- CSS variables follow a comprehensive naming convention for light/dark theming
- Project is set up for React Server Components (RSC) as indicated in components.json

## CSS 는 Shadcn 을 사용

- CSS 컴포넌트가 필요하면 Shadcn 의 컴포넌트를 사용한다
- 컴포넌트를 추가하는 방법은 `npx shadcn@latest add 컴포넌트명` 으로 추가한다