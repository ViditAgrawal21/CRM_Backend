# API Test Suite
## Manual Testing Guide for All Endpoints

**Base URL:** `http://localhost:3000/api`

---

## Setup

1. Start the server:
```bash
npm run dev
```

2. Server should be running on `http://localhost:3000`

---

## 🧪 Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

---

## 🧪 Test 2: Owner Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "owner123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "System Owner",
      "phone": "9999999999",
      "role": "owner",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save token for next tests:**
```bash
export TOKEN="paste_token_here"
```

---

## 🧪 Test 3: Create Admin

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Admin Test",
    "phone": "8888888888",
    "password": "admin123",
    "role": "admin",
    "monthlyMeetingTarget": 50,
    "monthlyVisitTarget": 30,
    "monthlyRevenueTarget": 1000000,
    "monthlyBonus": 20000
  }'
```

**Expected:** Status 201 with admin user data

---

## 🧪 Test 4: Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8888888888",
    "password": "admin123"
  }'
```

**Save admin token:**
```bash
export ADMIN_TOKEN="paste_admin_token_here"
```

---

## 🧪 Test 5: Create Manager (as Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Manager Test",
    "phone": "7777777777",
    "password": "manager123",
    "role": "manager",
    "monthlyMeetingTarget": 30,
    "monthlyVisitTarget": 20
  }'
```

---

## 🧪 Test 6: Create Employee (as Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Employee Test",
    "phone": "6666666666",
    "password": "employee123",
    "role": "employee",
    "monthlyMeetingTarget": 20,
    "monthlyVisitTarget": 10,
    "monthlyBonus": 5000
  }'
```

---

## 🧪 Test 7: Get Team Hierarchy

```bash
curl -X GET http://localhost:3000/api/users/team \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Hierarchical list of all team members

---

## 🧪 Test 8: Create Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Welcome Message",
    "message": "Hello! Thank you for your interest in our premium projects. We have exciting offers for 2BHK and 3BHK apartments in Pune West. Would you like to schedule a site visit?"
  }'
```

---

## 🧪 Test 9: Get Templates

```bash
curl -X GET http://localhost:3000/api/templates \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Test 10: Create Single Lead

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "type": "lead",
    "date": "2026-02-03",
    "name": "Test Customer",
    "phone": "1234567890",
    "configuration": "2BHK",
    "location": "Pune West",
    "remark": "Interested in Green Valley project",
    "assignedTo": "employee_uuid_here"
  }'
```

---

## 🧪 Test 11: Bulk Upload Leads

```bash
curl -X POST http://localhost:3000/api/leads/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "csvContent": "Type,Date,Customer Name,Customer Number,Configuration,Remark,Assign to\nlead,2026-02-03,John Doe,9876543210,3BHK,Hot lead,6666666666\nlead,2026-02-03,Jane Smith,9876543211,2BHK,Callback required,6666666666"
  }'
```

---

## 🧪 Test 12: Get Leads (as Employee)

First login as employee:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6666666666",
    "password": "employee123"
  }'
```

Save employee token:
```bash
export EMP_TOKEN="paste_employee_token_here"
```

Get assigned leads:
```bash
curl -X GET http://localhost:3000/api/leads \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 13: Update Lead Status

```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "status": "contacted",
    "remark": "Called customer, interested but busy"
  }'
```

---

## 🧪 Test 14: Create Follow-up

```bash
curl -X POST http://localhost:3000/api/followups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "reminderAt": "2026-02-04T10:00:00Z",
    "notes": "Call back to discuss pricing"
  }'
```

---

## 🧪 Test 15: Get Today's Follow-ups

```bash
curl -X GET http://localhost:3000/api/followups/today \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 16: Get Backlog

```bash
curl -X GET http://localhost:3000/api/followups/backlog \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 17: Schedule Meeting

```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "scheduledAt": "2026-02-05T14:00:00Z",
    "location": "Office - Pune",
    "notes": "Discuss pricing and payment plans"
  }'
```

---

## 🧪 Test 18: Schedule Site Visit

```bash
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "scheduledAt": "2026-02-06T11:00:00Z",
    "siteLocation": "Green Valley Project, Pune West",
    "notes": "Show 2BHK model flat on 5th floor"
  }'
```

---

## 🧪 Test 19: Log Call

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "action": "call",
    "duration": 180,
    "outcome": "interested",
    "notes": "Customer very interested, wants to visit this weekend"
  }'
```

---

## 🧪 Test 20: Add Note to Lead

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "text": "Customer prefers higher floors. Budget range: 70L-80L. Family size: 4 members."
  }'
```

---

## 🧪 Test 21: Get Lead Notes

```bash
curl -X GET "http://localhost:3000/api/notes?leadId=LEAD_UUID_HERE" \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 22: Get Daily Report

```bash
curl -X GET "http://localhost:3000/api/reports/daily?date=2026-02-03" \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 23: Save Daily Report

```bash
curl -X POST http://localhost:3000/api/reports/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "reportDate": "2026-02-03",
    "nextDayPlan": "Follow up with 5 hot leads. Schedule 2 site visits for Green Valley project."
  }'
```

---

## 🧪 Test 24: Set Target (as Admin)

```bash
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "userId": "EMPLOYEE_UUID_HERE",
    "month": "2026-02-01",
    "meetingTarget": 25,
    "visitTarget": 15,
    "revenueTarget": 500000,
    "bonus": 10000
  }'
```

---

## 🧪 Test 25: Get Own Targets

```bash
curl -X GET "http://localhost:3000/api/targets?month=2026-02-01" \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 26: Get Team Targets (as Admin)

```bash
curl -X GET "http://localhost:3000/api/targets/team?month=2026-02-01" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Test 27: Get Monthly Report

```bash
curl -X GET "http://localhost:3000/api/reports/monthly?month=2026-02-01" \
  -H "Authorization: Bearer $EMP_TOKEN"
```

---

## 🧪 Test 28: Get Dashboard Stats (as Owner)

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Test 29: Get Properties (Owner)

```bash
curl -X GET http://localhost:3000/api/properties \
  -H "Authorization: Bearer $TOKEN"
```

**Note:** This will call external API. Ensure PROPERTIES_API_URL is configured.

---

## 🧪 Test 30: Add Property (Owner Only)

```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectName": "Sunset Heights",
    "builders": "XYZ Developers",
    "location": "Pune East",
    "configuration": "3BHK, 4BHK",
    "price": "80L - 1.5Cr",
    "possession": "June 2027",
    "link": "https://example.com/sunset-heights",
    "contactUs": "9876543210"
  }'
```

---

## 🧪 Test 31: Complete Meeting

```bash
curl -X PATCH http://localhost:3000/api/meetings/MEETING_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "status": "completed",
    "outcome": "Very positive meeting. Customer ready to book.",
    "notes": "Discussed payment plan, customer liked 3BHK unit"
  }'
```

---

## 🧪 Test 32: Approve Bonus (as Admin)

```bash
curl -X POST http://localhost:3000/api/targets/approve-bonus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "targetId": "TARGET_UUID_HERE"
  }'
```

---

## 🧪 Test 33: Deactivate User (Cascade)

```bash
curl -X PATCH http://localhost:3000/api/users/deactivate/MANAGER_UUID_HERE \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** Manager and all employees under them are deactivated

---

## 🧪 Test 34: Try Login with Deactivated User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "deactivated_user_phone",
    "password": "password"
  }'
```

**Expected:** Error - "Account is deactivated"

---

## 🧪 Test 35: Update Follow-up to Done

```bash
curl -X PATCH http://localhost:3000/api/followups/FOLLOWUP_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "status": "done",
    "outcome": "Scheduled meeting",
    "notes": "Customer confirmed meeting for tomorrow"
  }'
```

---

## 🧪 Test 36: Update Lead to Prospect

```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "status": "prospect",
    "remark": "Hot prospect! Ready to book within this week."
  }'
```

---

## 🧪 Test 37: Mark Lead as Spam

```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{
    "status": "spam",
    "remark": "Wrong number - not interested"
  }'
```

---

## 🧪 Test 38: Delete Template

```bash
curl -X DELETE http://localhost:3000/api/templates/TEMPLATE_UUID_HERE \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Test 39: Update Template

```bash
curl -X PATCH http://localhost:3000/api/templates/TEMPLATE_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "message": "Updated message text with new offers!",
    "isActive": true
  }'
```

---

## 🧪 Test 40: Assign Lead to Another Employee

```bash
curl -X POST http://localhost:3000/api/leads/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "leadId": "LEAD_UUID_HERE",
    "assignedTo": "OTHER_EMPLOYEE_UUID_HERE"
  }'
```

---

## ✅ Test Results Checklist

- [ ] Health check works
- [ ] Owner login successful
- [ ] Admin creation successful
- [ ] Manager creation successful
- [ ] Employee creation successful
- [ ] Team hierarchy retrieval works
- [ ] Template CRUD works
- [ ] Single lead creation works
- [ ] Bulk lead upload works
- [ ] Lead retrieval works (filtered by role)
- [ ] Lead status update works
- [ ] Follow-up creation works
- [ ] Today's follow-ups retrieval works
- [ ] Backlog retrieval works
- [ ] Meeting scheduling works
- [ ] Visit scheduling works
- [ ] Call logging works
- [ ] Notes creation works
- [ ] Daily report generation works
- [ ] Target setting works
- [ ] Monthly report works
- [ ] Dashboard stats works
- [ ] Properties proxy works (if external API configured)
- [ ] Bonus approval works
- [ ] User deactivation cascade works
- [ ] Deactivated user login blocked

---

## 🐛 Common Issues

### Issue: "Missing Supabase environment variables"
**Solution:** Check `.env` file has correct Supabase credentials

### Issue: "Invalid token"
**Solution:** Re-login and get a fresh token

### Issue: "Insufficient permissions"
**Solution:** Ensure you're using the correct role's token

### Issue: "Property API error"
**Solution:** Configure PROPERTIES_API_URL and PROPERTIES_API_KEY in `.env`

---

## 🚀 All Tests Passed?

If all tests pass, your backend is production-ready! ✅

Next steps:
1. Connect mobile app
2. Connect owner dashboard
3. Deploy to production server
