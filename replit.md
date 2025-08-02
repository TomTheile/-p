# Overview

This is a Lua Script Executor web application designed as a Roblox sandbox environment. The application allows users to write, execute, and debug Lua scripts with Roblox-like APIs in a browser-based IDE. It features a full-stack architecture with a React frontend providing a code editor interface, console output, and development tools, while the backend uses Express.js with potential database integration through Drizzle ORM and PostgreSQL.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming, including custom dark theme support for the code editor
- **State Management**: TanStack Query (React Query) for server state management, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Custom implementation with syntax highlighting, line numbers, and auto-resize functionality
- **Mock Engine**: Client-side Lua interpreter simulation with Roblox API mocking (Vector3, CFrame, Instance creation, etc.)

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Build System**: ESBuild for production bundling, TSX for development server
- **Development Integration**: Vite middleware integration for HMR and development tooling
- **API Structure**: RESTful API design with /api prefix for all endpoints
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Logging**: Request/response logging with performance metrics and JSON response capture

## Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach
- **Database**: PostgreSQL (Neon serverless) with UUID primary keys and proper constraints
- **Migration System**: Drizzle Kit for schema migrations and database management
- **Development Storage**: In-memory storage implementation for development/testing
- **Schema**: User management system with username/password authentication structure

## Authentication and Authorization
- **Session Management**: Placeholder for session-based authentication using connect-pg-simple for PostgreSQL session storage
- **User Model**: Basic user schema with unique usernames and password fields
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **API Integration**: Ready for user CRUD operations through the storage interface

## External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Extensive Radix UI component library for accessibility
- **Form Handling**: React Hook Form with Hookform resolvers for validation
- **Date Utilities**: date-fns for date manipulation
- **Schema Validation**: Zod for runtime type checking and validation, integrated with Drizzle
- **Development Tools**: Replit-specific plugins for error overlays and development banner
- **Build Tools**: PostCSS with Autoprefixer for CSS processing