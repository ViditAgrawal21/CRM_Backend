# CRM Backend API

Mobile-first field sales CRM system with role-based hierarchy.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Run SQL schema in Supabase (see `schema.sql`)

4. Start server:
```bash
npm run dev
```

## Project Structure

```
src/
  config/          - Database & app configuration
  middleware/      - Auth, validation, error handling
  modules/         - Feature modules (MVC pattern)
  utils/           - Helper functions
  routes/          - API route aggregator
  app.js           - Express app setup
  server.js        - Server entry point
```

## API Endpoints

### Auth
- POST `/api/auth/login` - Login with phone + password

### Users
- POST `/api/users` - Create user (admin/manager/employee)
- GET `/api/users/team` - Get user's team hierarchy
- PATCH `/api/users/deactivate/:id` - Deactivate user + children

### Leads
- POST `/api/leads` - Create single lead
- POST `/api/leads/bulk` - Bulk upload from CSV
- GET `/api/leads` - Get assigned leads
- PATCH `/api/leads/:id` - Update lead
- POST `/api/leads/assign` - Assign lead to user

### Followups
- POST `/api/followups` - Create reminder
- GET `/api/followups/today` - Today's followups
- GET `/api/followups/backlog` - Missed followups

### And more... (see routes/ for complete list)

## User Roles & Hierarchy

Owner → Admin → Manager → Employee
