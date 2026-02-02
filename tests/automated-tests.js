import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:3000';
let ownerToken = '';
let adminToken = '';
let employeeToken = '';
let adminId = '';
let employeeId = '';
let leadId = '55555555-5555-5555-5555-555555555551'; // Using seeded lead
let templateId = '';
let followupId = '';
let meetingId = '';
let visitId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passCount = 0;
let failCount = 0;

// HTTP request helper
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test helper
async function test(name, fn) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passCount++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failCount++;
  }
}

// Assertion helper
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Wait for server
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await makeRequest('GET', '/health');
      if (res.status === 200) {
        console.log(`${colors.green}✓ Server is ready${colors.reset}\n`);
        return true;
      }
    } catch (e) {
      if (i < maxAttempts - 1) {
        process.stdout.write('.');
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw new Error('Server not responding. Make sure server is running on port 3000 (npm run dev)');
}

// Main test suite
async function runTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   CRM Backend Automated Test Suite    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // Wait for server to be ready
    console.log(`${colors.yellow}Waiting for server...${colors.reset}`);
    await waitForServer();

    // ===== HEALTH CHECK =====
    console.log(`${colors.blue}[1] Health Check${colors.reset}`);
    await test('GET /health should return 200', async () => {
      const res = await makeRequest('GET', '/health');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.status === 'healthy', 'Health check failed');
    });

    // ===== AUTHENTICATION =====
    console.log(`\n${colors.blue}[2] Authentication${colors.reset}`);
    
    await test('POST /api/auth/login with invalid credentials should fail', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        phone: '0000000000',
        password: 'wrong',
      });
      assert(res.status >= 400 && res.status < 500, `Expected 4xx, got ${res.status}`);
    });

    await test('POST /api/auth/login should succeed for owner', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        phone: '9999999999',
        password: 'owner123',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.success, 'Login should be successful');
      assert(res.data.data.token, 'Token should be present');
      assert(res.data.data.user.role === 'owner', 'User should be owner');
      ownerToken = res.data.data.token;
    });

    // ===== USER MANAGEMENT =====
    console.log(`\n${colors.blue}[3] User Management${colors.reset}`);

    await test('POST /api/auth/login should succeed for admin', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        phone: '8888888888',
        password: 'test123',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      adminToken = res.data.data.token;
      adminId = res.data.data.user.id;
    });

    await test('POST /api/auth/login should succeed for employee', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        phone: '6666666666',
        password: 'test123',
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      employeeToken = res.data.data.token;
      employeeId = res.data.data.user.id;
    });

    await test('GET /api/users/team should return team hierarchy', async () => {
      const res = await makeRequest('GET', '/api/users/team', null, ownerToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== TEMPLATES =====
    console.log(`\n${colors.blue}[4] Templates${colors.reset}`);

    await test('POST /api/templates should create template', async () => {
      const res = await makeRequest(
        'POST',
        '/api/templates',
        {
          title: 'Test Template',
          message: 'Hello! This is a test message for our CRM system.',
        },
        adminToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.data.data.title === 'Test Template', 'Template title should match');
      templateId = res.data.data.id;
    });

    await test('GET /api/templates should return templates', async () => {
      const res = await makeRequest('GET', '/api/templates', null, adminToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
      assert(res.data.data.length > 0, 'Should have at least one template');
    });

    await test('GET /api/templates/:id should return single template', async () => {
      const res = await makeRequest('GET', `/api/templates/${templateId}`, null, adminToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.data.id === templateId, 'Should return correct template');
    });

    // ===== LEAD MANAGEMENT =====
    console.log(`\n${colors.blue}[5] Lead Management${colors.reset}`);

    await test('GET /api/leads should return leads for employee', async () => {
      const res = await makeRequest('GET', '/api/leads', null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
      if (res.data.data.length > 0) {
        leadId = res.data.data[0].id; // Get first lead for tests
      }
    });

    await test('PATCH /api/leads/:id should update lead status', async () => {
      const res = await makeRequest(
        'PATCH',
        `/api/leads/${leadId}`,
        {
          status: 'contacted',
          remark: 'Called and spoke to customer',
        },
        employeeToken
      );
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.data.status === 'contacted', 'Status should be updated');
    });

    // ===== FOLLOWUPS =====
    console.log(`\n${colors.blue}[6] Follow-ups${colors.reset}`);

    await test('POST /api/followups should create followup', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const res = await makeRequest(
        'POST',
        '/api/followups',
        {
          leadId: leadId,
          reminderAt: tomorrow.toISOString(),
          notes: 'Call back to discuss pricing',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      followupId = res.data.data.id;
    });

    await test('GET /api/followups/today should return todays followups', async () => {
      const res = await makeRequest('GET', '/api/followups/today', null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== LOGS =====
    console.log(`\n${colors.blue}[7] Activity Logs${colors.reset}`);

    await test('POST /api/logs should create call log', async () => {
      const res = await makeRequest(
        'POST',
        '/api/logs',
        {
          leadId: leadId,
          action: 'call',
          duration: 180,
          outcome: 'interested',
          notes: 'Customer interested in 2BHK',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.data.data.action === 'call', 'Action should be call');
    });

    await test('GET /api/logs should return logs', async () => {
      const res = await makeRequest('GET', `/api/logs?leadId=${leadId}`, null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== NOTES =====
    console.log(`\n${colors.blue}[8] Notes${colors.reset}`);

    await test('POST /api/notes should create note', async () => {
      const res = await makeRequest(
        'POST',
        '/api/notes',
        {
          leadId: leadId,
          text: 'Customer prefers higher floors. Budget: 70L-80L',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
    });

    await test('GET /api/notes should return notes for lead', async () => {
      const res = await makeRequest('GET', `/api/notes?leadId=${leadId}`, null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== MEETINGS =====
    console.log(`\n${colors.blue}[9] Meetings${colors.reset}`);

    await test('POST /api/meetings should schedule meeting', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      
      const res = await makeRequest(
        'POST',
        '/api/meetings',
        {
          leadId: leadId,
          scheduledAt: tomorrow.toISOString(),
          location: 'Office - Pune',
          notes: 'Discuss pricing and payment plans',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      meetingId = res.data.data.id;
    });

    await test('GET /api/meetings should return meetings', async () => {
      const res = await makeRequest('GET', '/api/meetings', null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== VISITS =====
    console.log(`\n${colors.blue}[10] Site Visits${colors.reset}`);

    await test('POST /api/visits should schedule visit', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(11, 0, 0, 0);
      
      const res = await makeRequest(
        'POST',
        '/api/visits',
        {
          leadId: leadId,
          scheduledAt: nextWeek.toISOString(),
          siteLocation: 'Green Valley Project, Pune West',
          notes: 'Show 2BHK model flat',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      visitId = res.data.data.id;
    });

    await test('GET /api/visits should return visits', async () => {
      const res = await makeRequest('GET', '/api/visits', null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== TARGETS =====
    console.log(`\n${colors.blue}[11] Targets${colors.reset}`);

    await test('POST /api/targets should set target', async () => {
      // Use far future date (10+ years) to practically guarantee uniqueness
      const futureMonth = new Date();
      futureMonth.setFullYear(futureMonth.getFullYear() + 10 + Math.floor(Date.now() % 10));
      futureMonth.setMonth(Math.floor(Date.now() / 1000) % 12); // Month based on timestamp seconds
      futureMonth.setDate(1);
      const targetMonth = futureMonth.toISOString().substring(0, 7) + '-01';
      
      const res = await makeRequest(
        'POST',
        '/api/targets',
        {
          userId: employeeId,
          month: targetMonth,
          meetingTarget: 25,
          visitTarget: 15,
          revenueTarget: 500000,
          bonus: 10000,
        },
        adminToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
    });

    await test('GET /api/targets should return own targets', async () => {
      const res = await makeRequest('GET', '/api/targets', null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Should return array');
    });

    // ===== REPORTS =====
    console.log(`\n${colors.blue}[12] Reports${colors.reset}`);

    await test('GET /api/reports/daily should return daily report', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await makeRequest('GET', `/api/reports/daily?date=${today}`, null, employeeToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.data, 'Should have data');
    });

    await test('POST /api/reports/daily should save daily report', async () => {
      // Use unique future date to avoid conflict (1 year + random days)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 365)); // Add 0-364 random days
      const reportDate = futureDate.toISOString().split('T')[0];
      
      const res = await makeRequest(
        'POST',
        '/api/reports/daily',
        {
          reportDate: reportDate,
          nextDayPlan: 'Follow up with hot leads and schedule site visits',
        },
        employeeToken
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
    });

    // ===== DASHBOARD =====
    console.log(`\n${colors.blue}[13] Dashboard${colors.reset}`);

    await test('GET /api/dashboard/stats should return dashboard stats', async () => {
      const res = await makeRequest('GET', '/api/dashboard/stats', null, ownerToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.data.overview, 'Should have overview stats');
    });

    // ===== AUTHORIZATION TESTS =====
    console.log(`\n${colors.blue}[14] Authorization${colors.reset}`);

    await test('Employee should NOT be able to create admin', async () => {
      const res = await makeRequest(
        'POST',
        '/api/users',
        {
          name: 'Unauthorized Admin',
          phone: '5555555555',
          password: 'test123',
          role: 'admin',
        },
        employeeToken
      );
      assert(res.status === 403, `Expected 403, got ${res.status}`);
    });

    await test('Employee should NOT be able to create templates', async () => {
      const res = await makeRequest(
        'POST',
        '/api/templates',
        {
          title: 'Unauthorized Template',
          message: 'Test',
        },
        employeeToken
      );
      assert(res.status === 403, `Expected 403, got ${res.status}`);
    });

    // ===== SUMMARY =====
    console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║           Test Summary                 ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
    console.log(`${colors.green}✓ Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failCount}${colors.reset}`);
    console.log(`${colors.blue}Total: ${passCount + failCount}${colors.reset}\n`);

    if (failCount === 0) {
      console.log(`${colors.green}🎉 All tests passed! Backend is production-ready!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}❌ Some tests failed. Please review the errors above.${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}Fatal Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests();
