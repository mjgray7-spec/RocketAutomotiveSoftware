# ROcket Automotive Software

## Overview

ROcket Automotive Software is a next-generation AI-powered automotive shop management SaaS platform. Built to compete with industry solutions like Garage360 and Shop-Ware, it provides comprehensive repair order management, digital vehicle inspections (DVI), customer relationship management, scheduling, inventory tracking, and financial reporting for independent automotive repair shops.

The platform uses a modern web stack with React frontend, Express backend, and PostgreSQL database, featuring a distinctive red, black, and white automotive-tech aesthetic design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Context for local state (DataContext)
- **Styling**: Tailwind CSS v4 with custom theme variables, shadcn/ui component library
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

### Data Storage
- **Primary Database**: PostgreSQL (via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Key Data Models
- Users (authentication)
- Customers (shop clients)
- Vehicles (customer vehicles with VIN, make, model, year)
- Repair Orders (work orders with status workflow)
- Inspection Items (DVI checklist items)
- Service Line Items (labor, parts, sublet items)
- Estimates and Estimate Jobs/Line Items

### Application Structure
```
client/src/           # React frontend
  components/         # UI components (shadcn/ui based)
  pages/              # Route pages (dashboard, repair-orders, technician, etc.)
  lib/                # Utilities, API client, constants
  hooks/              # Custom React hooks

server/               # Express backend
  index.ts            # Server entry point
  routes.ts           # API route definitions
  storage.ts          # Database access layer
  db.ts               # Database connection

shared/               # Shared code between frontend/backend
  schema.ts           # Drizzle schema definitions
```

### Design Patterns
- **Component Library**: shadcn/ui components with Radix UI primitives
- **API Client**: Centralized fetch wrapper in `client/src/lib/api.ts`
- **Layout System**: Collapsible sidebar navigation with responsive mobile support
- **Form Handling**: React Hook Form with Zod validation

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Third-Party APIs
- **Motors API**: Labor time lookups using VMRS codes (requires `MOTOR_PUBLIC_KEY` and `MOTOR_PRIVATE_KEY`)
- Fallback labor time data provided when API keys not configured

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Lucide React**: Icon library
- **Recharts**: Charting library for reports and dashboards
- **Embla Carousel**: Carousel component
- **date-fns**: Date manipulation utilities

### Build/Dev Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Full type safety across stack

### Fonts
- **Orbitron**: Display/heading font (automotive tech aesthetic)
- **Inter**: UI body text
- **JetBrains Mono**: Monospace for data/code display