# CRM Backend API - Complete Documentation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run SQL schema in Supabase
# (Copy database-setup.sql and execute in Supabase SQL Editor)
# IMPORTANT: After running database-setup.sql, also run this function:
# DROP FUNCTION IF EXISTS public.get_user_team(uuid);
# CREATE OR REPLACE FUNCTION public.get_user_team(user_uuid uuid)
# RETURNS TABLE (
#   id uuid, name varchar, phone varchar, role user_role,
#   created_by uuid, is_active boolean, created_at timestamp with time zone
# ) AS $$
# BEGIN
#   RETURN QUERY
#   WITH RECURSIVE team_tree AS (
#     SELECT u.id, u.name, u.phone, u.role, u.created_by, u.is_active, u.created_at
#     FROM users u WHERE u.id = user_uuid
#     UNION ALL
#     SELECT u.id, u.name, u.phone, u.role, u.created_by, u.is_active, u.created_at
#     FROM users u INNER JOIN team_tree tt ON u.created_by = tt.id
#     WHERE u.is_active = true
#   )
#   SELECT * FROM team_tree;
# END;
# $$ LANGUAGE plpgsql SECURITY DEFINER;

# Start server
npm run dev
```

Server will start on `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── index.js        # App config
│   └── supabase.js     # Supabase client
├── middleware/          # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── authorize.js    # Role-based authorization
│   ├── validate.js     # Zod validation
│   └── errorHandler.js # Error handling
├── modules/             # Feature modules (MVC)
│   ├── auth/           # Login
│   ├── users/          # User management
│   ├── leads/          # Lead management
│   ├── followups/      # Reminders & backlog
│   ├── meetings/       # Meeting scheduling
│   ├── visits/         # Site visits
│   ├── logs/           # Activity logs
│   ├── notes/          # Lead notes
│   ├── templates/      # Message templates
│   ├── targets/        # Monthly targets
│   ├── reports/        # Daily/Monthly reports
│   ├── dashboard/      # Analytics
│   └── properties/     # Property proxy API
├── routes/              # Route aggregator
├── utils/               # Helper functions
├── app.js               # Express app
└── server.js            # Server entry
```

Each module contains:
- `controller.js` - Request handlers
- `service.js` - Business logic
- `routes.js` - Route definitions
- `validator.js` - Zod schemas

---

## 🔐 Authentication

All endpoints (except `/api/auth/login`) require JWT token:

```
Authorization: Bearer <token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "1234567890",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "admin",
      "is_active": true
    },
    "token": "jwt_token_here"
  }
}
```

---

## 👥 Users Module

### Create User
```http
POST /api/users
Authorization: Bearer <token>

{
  "name": "Employee Name",
  "phone": "9876543210",
  "password": "secure123",
  "role": "employee",
  "monthlyMeetingTarget": 20,
  "monthlyVisitTarget": 10,
  "monthlyRevenueTarget": 100000,
  "monthlyBonus": 5000
}
```

**Permissions:**
- Owner → Create admin
- Admin → Create manager/employee

### Get Team
```http
GET /api/users/team
```

Returns hierarchical team structure.

### Deactivate User
```http
PATCH /api/users/deactivate/:userId
```

Deactivates user and all children automatically.

---

## 📊 Leads Module

### Create Lead
```http
POST /api/leads

{
  "type": "lead",
  "date": "2026-02-03",
  "name": "Customer Name",
  "phone": "1231231234",
  "configuration": "2BHK",
  "location": "Pune West",
  "remark": "Interested in project X",
  "assignedTo": "user_uuid"
}
```

**Admin only**

### Bulk Upload Leads
```http
POST /api/leads/bulk

{
  "csvContent": "Type,Date,Customer Name,Customer Number,Configuration,Remark,Assign to\nlead,2026-02-03,John,1234567890,2BHK,Hot lead,9999999999"
}
```

### Get Leads
```http
GET /api/leads
```

Returns leads based on role:
- Admin: All created leads
- Manager/Employee: Assigned leads

### Update Lead
```http
PATCH /api/leads/:leadId

{
  "status": "prospect",
  "remark": "Very interested"
}
```

### Assign Lead
```http
POST /api/leads/assign

{
  "leadId": "uuid",
  "assignedTo": "uuid"
}
```

---

## ⏰ Followups Module

### Create Followup
```http
POST /api/followups

{
  "leadId": "uuid",
  "reminderAt": "2026-02-04T10:00:00Z",
  "notes": "Call back tomorrow"
}
```

### Get Today's Followups
```http
GET /api/followups/today
```

### Get Backlog (Missed)
```http
GET /api/followups/backlog
```

### Update Followup
```http
PATCH /api/followups/:id

{
  "status": "done",
  "outcome": "Scheduled meeting",
  "notes": "Customer agreed to meet"
}
```

---

## 📅 Meetings & Visits

### Create Meeting
```http
POST /api/meetings

{
  "leadId": "uuid",
  "scheduledAt": "2026-02-05T14:00:00Z",
  "location": "Office",
  "notes": "Discuss pricing"
}
```

### Create Visit
```http
POST /api/visits

{
  "leadId": "uuid",
  "scheduledAt": "2026-02-06T11:00:00Z",
  "siteLocation": "Project Site A",
  "notes": "Show model flat"
}
```

### Get Meetings/Visits
```http
GET /api/meetings?status=scheduled
GET /api/visits?status=completed
```

### Update Status
```http
PATCH /api/meetings/:id

{
  "status": "completed",
  "outcome": "Positive response",
  "notes": "Customer ready to book"
}
```

---

## 📝 Logs & Notes

### Create Log
```http
POST /api/logs

{
  "leadId": "uuid",
  "action": "call",
  "duration": 120,
  "outcome": "interested",
  "notes": "Discussed pricing"
}
```

Actions: `call`, `whatsapp`, `template`, `meeting`, `visit`, `note`, `status_change`

### Create Note
```http
POST /api/notes

{
  "leadId": "uuid",
  "text": "Customer prefers 3BHK units"
}
```

### Get Notes
```http
GET /api/notes?leadId=uuid
```

---

## 💬 Templates Module

### Create Template
```http
POST /api/templates

{
  "title": "Welcome Message",
  "message": "Hello! Thank you for your interest in our project..."
}
```

**Admin only**

### Get Templates
```http
GET /api/templates
```

### Update Template
```http
PATCH /api/templates/:id

{
  "message": "Updated message text",
  "isActive": true
}
```

### Delete Template
```http
DELETE /api/templates/:id
```

Soft delete (sets `is_active` to false)

---

## 🎯 Targets Module

### Set Target
```http
POST /api/targets

{
  "userId": "uuid",
  "month": "2026-02-01",
  "meetingTarget": 25,
  "visitTarget": 15,
  "revenueTarget": 500000,
  "bonus": 10000
}
```

**Admin only**

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "month": "2026-02-01",
    "meetingTarget": 25,
    "visitTarget": 15,
    "revenueTarget": 500000,
    "bonus": 10000
  }
}
```

### Get Own Targets
```http
GET /api/targets?month=2026-02-01
```

### Get Team Targets
```http
GET /api/targets/team?month=2026-02-01
```

**Admin only**

### Approve Bonus
```http
POST /api/targets/approve-bonus

{
  "targetId": "uuid"
}
```

---

## 📈 Reports Module

### Get Daily Report
```http
GET /api/reports/daily?date=2026-02-03
```

Response:
```json
{
  "reportDate": "2026-02-03",
  "totalCalls": 15,
  "todayMeetings": 3,
  "todayVisits": 2,
  "meetingsTillNow": 45,
  "visitsTillNow": 30,
  "prospectsTillNow": 12,
  "prospects": [
    {"name": "John", "phone": "1234567890"}
  ]
}
```

### Get Monthly Report
```http
GET /api/reports/monthly?month=2026-02-01
```

Response:
```json
{
  "month": "2026-02-01",
  "target": {
    "meetings": 25,
    "visits": 15,
    "revenue": 500000,
    "bonus": 10000
  },
  "achievement": {
    "meetings": 20,
    "visits": 12,
    "meetingProgress": "80.00%",
    "visitProgress": "80.00%"
  },
  "targetMet": false,
  "bonusApproved": false
}
```

### Save Daily Report
```http
POST /api/reports/daily

{
  "reportDate": "2026-02-03",
  "nextDayPlan": "Follow up with 5 hot leads, 2 site visits planned"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Daily report saved and shared successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "reportDate": "2026-02-03",
    "totalCalls": 15,
    "totalWhatsapp": 0,
    "totalTemplates": 0,
    "totalMeetings": 3,
    "totalVisits": 2,
    "nextDayPlan": "Follow up with 5 hot leads, 2 site visits planned"
  }
}
```

---

## 📊 Dashboard Module

### Get Stats
```http
GET /api/dashboard/stats
```

Response:
```json
{
  "overview": {
    "totalLeads": 150,
    "pendingFollowups": 12,
    "missedFollowups": 3,
    "upcomingMeetings": 5,
    "upcomingVisits": 4
  },
  "leadsByStatus": {
    "new": 20,
    "contacted": 40,
    "interested": 30,
    "prospect": 15,
    "converted": 10,
    "spam": 5
  },
  "thisMonth": {
    "meetings": 18,
    "visits": 12
  },
  "team": {
    "total": 10,
    "active": 9,
    "inactive": 1
  }
}
```

---

## 🏠 Properties Module (Proxy API)

**Note:** Properties are NOT stored in database. Backend acts as proxy to external API.

### Get Properties
```http
GET /api/properties?location=Pune
```

### Create Property
```http
POST /api/properties

{
  "projectName": "Green Valley",
  "builders": "ABC Builders",
  "location": "Pune West",
  "configuration": "2BHK, 3BHK",
  "price": "50L - 80L",
  "possession": "Dec 2026",
  "link": "https://example.com/project",
  "contactUs": "1234567890"
}
```

**Owner only**

### Bulk Upload Properties
```http
POST /api/properties/bulk

{
  "csvContent": "Project Name,Builders,Location,Configuration,Price,Possession,Link,Contact Us\n..."
}
```

**Owner only**

---

## 🔒 Role-Based Access

| Endpoint | Owner | Admin | Manager | Employee |
|----------|-------|-------|---------|----------|
| Create Admin | ✅ | ❌ | ❌ | ❌ |
| Create Manager/Employee | ✅ | ✅ | ❌ | ❌ |
| Upload Leads | ✅ | ✅ | ❌ | ❌ |
| Assign Leads | ✅ | ✅ | ✅ | ❌ |
| Set Targets | ✅ | ✅ | ❌ | ❌ |
| Create Templates | ✅ | ✅ | ❌ | ❌ |
| Add Properties | ✅ | ❌ | ❌ | ❌ |
| View Properties | ✅ | ✅ | ✅ | ✅ |
| Create Followups | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Environment Variables

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PROPERTIES_API_URL=https://your-website-api.com
PROPERTIES_API_KEY=your_api_key
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "@supabase/supabase-js": "^2.39.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.22.4",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "csv-parse": "^5.5.3"
}
```

---

## 🎯 Business Logic Summary

1. **Hierarchy**: Owner → Admin → Manager → Employee
2. **Deactivation**: Parent deactivation cascades to children
3. **Lead Upload**: Admin only
4. **Lead Assignment**: Admin/Manager can assign
5. **Followup Backlog**: Auto-marked when missed
6. **Reports**: Employee → Manager → Admin → Owner (WhatsApp chain)
7. **Targets**: Admin sets, system tracks, admin approves bonus
8. **Properties**: No DB storage, pure proxy to external API

---

## 🚨 Error Handling

All errors return:
```json
{
  "error": "Error message"
}
```

Status codes:
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Server Error

---

## ✅ Testing

Create owner first (manually in Supabase or using bcrypt to hash password):

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('owner123', 10);
// Use this hash in SQL INSERT
```

Then test login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"owner123"}'
```

---

**Backend is production-ready! 🚀**
