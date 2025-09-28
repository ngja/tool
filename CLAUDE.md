# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 application using React 19 and TypeScript, configured with Turbopack for enhanced development performance. The project is a developer utility app that provides various tools including JSON formatting, time conversion, and timer functionality. The UI is built with Tailwind CSS v4 and shadcn/ui components.

## Development Commands

- `npm run dev` - Start development server with Turbopack optimization (runs on port 3001)
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server

## Architecture

### Project Structure
- **App Router**: Uses Next.js App Router with `app/` directory structure
- **Layout**: Root layout with Geist fonts, dark mode support, and sidebar navigation
- **Tool Pages**: Individual pages for each utility tool under `/time/`, `/json/` routes
- **Components**: Modular UI components with shadcn/ui system
- **Utilities**: Central utility functions in `lib/utils.ts`

### Application Features
The application provides developer utility tools:
1. **JSON Formatter** (`/json/formatter`): JSON validation, formatting, and error detection with Korean interface
2. **Timer** (`/time/timer`): Countdown timer with notifications, preset times, and visual feedback
3. **Time Converter** (`/time/converter`): Multi-format time conversion with timezone support

### Styling System
- **Tailwind CSS v4**: Uses new CSS-first approach with `@import "tailwindcss"`
- **Design Tokens**: Comprehensive CSS variables for light/dark theming with OKLCH color space
- **Dark Mode**: Configured with `next-themes` and `.dark` class switching
- **Component Library**: shadcn/ui "new-york" style with Lucide icons
- **Custom Animations**: Includes shake animation for timer completion

### Navigation & Layout
- **Sidebar Navigation**: Collapsible sidebar with categorized tool navigation using Radix UI
- **Header**: Breadcrumb navigation with theme toggle
- **Responsive**: Mobile-friendly layout with proper responsive grid systems

### Key Dependencies
- **UI Components**: Radix UI primitives, shadcn/ui components, Lucide React icons
- **Date/Time**: date-fns and date-fns-tz for time manipulation and timezone handling
- **Styling**: Tailwind CSS v4, clsx, tailwind-merge for conditional styling
- **Theme**: next-themes for dark/light mode switching

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

- `app/globals.css` - Tailwind imports, comprehensive design tokens, and shake animation keyframes
- `lib/utils.ts` - Exports `cn()` function for conditional class merging
- `components/app-sidebar.tsx` - Main navigation with collapsible tool categories
- `components/header.tsx` - Header with breadcrumbs and theme toggle
- `components.json` - shadcn/ui configuration with aliases and style preferences

## Development Notes

- **Turbopack**: Used for both development and production builds for faster compilation
- **Internationalization**: Interface uses Korean text for user-facing elements
- **Client Components**: All tool pages use "use client" directive for interactivity
- **Notifications**: Timer uses browser Notification API with permission handling
- **Clipboard API**: Copy functionality with fallback for older browsers
- **Debouncing**: Input validation uses 300ms debounce for performance

## CSS 컴포넌트 규칙

- CSS 컴포넌트가 필요하면 Shadcn 의 컴포넌트를 사용한다
- 컴포넌트를 추가하는 방법은 `npx shadcn@latest add 컴포넌트명` 으로 추가한다
- 기존 컴포넌트 스타일과 일관성을 유지하고 "new-york" 스타일을 따른다