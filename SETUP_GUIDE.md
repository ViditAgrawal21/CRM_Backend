# 🚀 Complete Setup Guide

## Step-by-Step Instructions to Run the CRM Backend

### ✅ Step 1: Database Setup (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://ophsbkkeqmywadeeorjh.supabase.co
   - Login to your Supabase account

2. **Run Database Schema**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**
   - Open the file `database-setup.sql` from this project
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor (Ctrl+V)
   - Click **Run** button (or press F5)
   
3. **Verify Success**
   - You should see: ✅ "Database schema created successfully! Owner user: 9999999999 / owner123"
   - This message means:
     * All tables are created
     * All functions are created
     * Initial owner user is seeded

### ✅ Step 2: Start the Server (Already Running!)

The server is already running on port 3000. You can see it's active.

If you need to restart it:
```bash
# Stop current server (Ctrl+C)
# Then start again:
npm run dev
```

### ✅ Step 3: Run Automated Tests

**AFTER completing Step 1** (database setup), run:

```bash
npm test
```

Expected Results:
- ✓ Passed: 31 tests
- ✗ Failed: 0 tests
- 🎉 All tests passed! Backend is production-ready!

## 📋 Test Checklist

Manual verification steps:

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Expected:** `{"status":"healthy"}`

### 2. Owner Login
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"phone\":\"9999999999\",\"password\":\"owner123\"}"
```
**Expected:** JWT token in response

### 3. Verify All 14 Modules Work

The automated test suite (`npm test`) will verify:

- [x] Health Check
- [x] Authentication (login with invalid/valid credentials)
- [x] User Management (create admin, manager, employee)
- [x] Team Hierarchy (recursive team query)
- [x] Templates (CRUD operations)
- [x] Lead Management (single, bulk, update, assign)
- [x] Follow-ups (create, today, backlog)
- [x] Activity Logs (call, WhatsApp, template)
- [x] Notes (create, retrieve)
- [x] Meetings (schedule, retrieve, update)
- [x] Site Visits (schedule, retrieve, update)
- [x] Targets (set, get own, get team, approve bonus)
- [x] Reports (daily, monthly)
- [x] Dashboard (statistics)
- [x] Authorization (role-based access control)
- [x] Deactivation Cascade

## 🎯 Default Credentials

After running `database-setup.sql`:

**Owner Account:**
- Phone: `9999999999`
- Password: `owner123`

## 📁 Project Files Reference

- `database-setup.sql` - Complete database schema + seed data
- `TESTING_GUIDE.md` - Manual testing with cURL commands (40 tests)
- `tests/automated-tests.js` - Automated test suite (31 tests)
- `MOBILE_API_DOCS.md` - React Native developer documentation
- `OWNER_DASHBOARD_API_DOCS.md` - Web dashboard documentation
- `API_DOCUMENTATION.md` - General API reference
- `README.md` - Project overview

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:** Check `.env` file exists with:
```env
SUPABASE_URL=https://ophsbkkeqmywadeeorjh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Error: "Invalid phone or password" on login
**Solution:** Database not set up. Run `database-setup.sql` in Supabase SQL Editor.

### Error: "relation 'users' does not exist"
**Solution:** Run `database-setup.sql` in Supabase SQL Editor to create all tables.

### Tests show "Server failed to start"
**Solution:** Make sure server is running with `npm run dev` in a separate terminal.

### Tests show "Expected 200, got 500"
**Solution:** Database schema not created. Run `database-setup.sql` in Supabase.

### Tests show "Expected 201, got 401" (Unauthorized)
**Solution:** Owner user not created. Run `database-setup.sql` to seed owner account.

## ✨ Next Steps After All Tests Pass

1. **Connect Mobile App**
   - Use `MOBILE_API_DOCS.md` for React Native integration
   - Base URL: `http://your-server-ip:3000/api`

2. **Connect Owner Dashboard**
   - Use `OWNER_DASHBOARD_API_DOCS.md` for web dashboard
   - Implement protected routes with JWT

3. **Deploy to Production**
   - Change `JWT_SECRET` to a strong random value
   - Deploy to cloud provider (AWS, DigitalOcean, Heroku, etc.)
   - Update mobile/web apps with production URL

## 📞 Support

If you encounter any issues:

1. Check this troubleshooting guide first
2. Review the error message carefully
3. Check Supabase dashboard logs
4. Verify `.env` configuration
5. Ensure database schema is created

## 🎉 Success Indicators

You're ready for production when:

- ✅ `npm test` shows: **All 31 tests passed!**
- ✅ Health endpoint returns `{"status":"healthy"}`
- ✅ Owner login works and returns JWT token
- ✅ Can create admin user
- ✅ Can create and assign leads
- ✅ All CRUD operations work
- ✅ Authorization works (employees can't create admins)
- ✅ Cascade deactivation works

## 📊 Architecture Overview

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ JWT Auth
         │
┌────────▼────────┐       ┌──────────────┐
│  CRM Backend    │◄─────►│  Supabase    │
│  (Express.js)   │       │  PostgreSQL  │
└────────┬────────┘       └──────────────┘
         │
         │ JWT Auth
         │
┌────────▼────────┐
│  Owner Dashboard│
│  (React Web)    │
└─────────────────┘
```

## 🔐 Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to strong random value (32+ chars)
- [ ] Change owner password from `owner123`
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS for specific origins (not `*`)
- [ ] Review Supabase Row Level Security (RLS) policies
- [ ] Set up regular database backups
- [ ] Enable rate limiting for API endpoints
- [ ] Monitor server logs for suspicious activity

---

**Ready to test?**

1. Run `database-setup.sql` in Supabase ✅
2. Run `npm test` ✅
3. See all tests pass 🎉
