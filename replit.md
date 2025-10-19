# CircleSave - Peer-to-Peer Savings Platform

## Overview

CircleSave is a fintech web application that facilitates peer-to-peer banking and group savings through rotating savings and credit associations (ROSCAs). The platform enables users to create or join savings groups where members contribute fixed amounts at regular intervals and receive pooled payouts on a rotating basis. The application emphasizes trust, transparency, and automated financial management to make collaborative savings accessible and secure.

**Core Functionality:**
- Group-based savings circles with customizable parameters (contribution amounts, frequency, group size)
- Automated contribution collection and payout distribution
- Trust scoring system based on payment history and group completion
- Real-time transaction tracking and notifications
- Stripe payment integration for secure fund management
- Email notifications via SendGrid for critical events

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with a custom design system
- CSS custom properties for theming (light/dark mode support)
- Design philosophy inspired by modern fintech platforms (Stripe, Wise, Revolut)

**State Management Pattern:**
- Server state managed through React Query with centralized query client
- API requests handled via custom `apiRequest` utility with automatic error handling
- Authentication state managed through custom `useAuth` hook
- Form state managed with React Hook Form and Zod validation

### Backend Architecture

**Server Framework:**
- Express.js for REST API routing and middleware
- Session-based authentication using Replit Auth (OpenID Connect)
- PostgreSQL session store for persistent authentication

**Authentication & Authorization:**
- Replit Auth integration with OpenID Connect/Passport strategy (OAuth 2.0)
- Multiple OAuth providers supported: Google, GitHub, X (Twitter), Apple, Email/Password
- Session management with connect-pg-simple for PostgreSQL-backed sessions
- Custom `isAuthenticated` middleware for route protection
- User profile management with automatic creation on first login
- Mandatory onboarding flow for new users to complete profile
- Profile completion check redirects incomplete profiles to onboarding page

**API Design:**
- RESTful endpoints organized by domain (groups, contributions, transactions, notifications)
- Consistent error handling with status codes and descriptive messages
- Request logging middleware for debugging and monitoring
- JSON request/response format throughout

### Data Storage & Schema

**Database:**
- PostgreSQL via Neon serverless with WebSocket connections
- Drizzle ORM for type-safe database operations and migrations
- Schema-first approach with Zod validation derived from Drizzle schemas

**Core Data Models:**
- **Users**: Profile information (name, contact details, address), trust scores, Stripe customer IDs, payment statistics, profile completion status. Extended fields include phoneNumber, dateOfBirth, addressLine1, addressLine2, city, postcode, country for identity verification
- **Groups**: Savings circle configuration (amount, frequency, status, member limits)
- **Group Members**: Join status, payout tracking, position in rotation
- **Contributions**: Individual payment records with status tracking
- **Transactions**: Complete financial history (contributions, payouts, refunds)
- **Notifications**: User alerts for payments, payouts, and group events
- **Sessions**: Authentication session storage

**Data Relationships:**
- Users have many group memberships and transactions
- Groups have many members and define contribution rules
- Contributions link users to groups with payment status
- Transactions track all financial movements with type categorization

### External Dependencies

**Payment Processing:**
- Stripe for payment intent creation and processing
- Stripe Elements for secure card input on frontend
- Customer management for recurring payments
- Payment method storage for future contributions

**Email Service:**
- SendGrid for transactional emails (welcome, invitations, payment reminders, payout notifications)
- Graceful degradation when API key not configured (logs instead of sending)
- Template-based email generation with group and payment context

**Third-Party Integrations:**
- Replit Auth for authentication (production environment)
- Neon Database for serverless PostgreSQL hosting
- Stripe payment infrastructure
- SendGrid email delivery

**Development Tools:**
- Replit-specific Vite plugins for development experience (error overlay, banner, cartographer)
- TypeScript for compile-time type checking
- ESBuild for production server bundling
- Drizzle Kit for database migrations

### Service Layer Pattern

**Group Service:**
- Handles group rotation logic and payout scheduling
- Manages group lifecycle (draft → active → completed)
- Automated recipient selection based on rotation order
- Group completion detection when all members receive payouts

**Payment Service:**
- Creates Stripe payment intents for contributions
- Manages customer profiles in Stripe
- Links payments to contributions and groups
- Handles payment processing webhooks

**Email Service:**
- Centralized email template management
- Conditional sending based on environment configuration
- Context-aware notifications (group invites, payment reminders, payout alerts)
- Welcome emails for new user onboarding