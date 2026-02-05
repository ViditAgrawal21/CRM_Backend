# CRM Mobile App API Documentation
## For React Native Developers

**Base URL:** `http://your-server.com/api`

**Authentication:** All endpoints (except login) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📱 Authentication

### Login
**POST** `/auth/login`

**Request:**
```json
{
  "phone": "1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "employee",
      "parentId": "manager_uuid",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Usage in React Native:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (phone, password) => {
  const response = await fetch('http://api.example.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    await AsyncStorage.setItem('token', data.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};
```

---

## 👥 Team Management (Admin Only)

### Create Team Member
**POST** `/users`

**Permissions:**
- Admin can create Manager/Employee
- Manager cannot create users

**Request:**
```json
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

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Employee Name",
    "phone": "9876543210",
    "role": "employee",
    "isActive": true
  }
}
```

### Get Team Hierarchy
**GET** `/users/team`

Returns all team members under you (managers see employees, admin sees all).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Employee 1",
      "phone": "1111111111",
      "role": "employee",
      "isActive": true,
      "level": 1
    },
    {
      "id": "uuid",
      "name": "Manager 1",
      "phone": "2222222222",
      "role": "manager",
      "isActive": true,
      "level": 1
    }
  ]
}
```

### Deactivate User (Admin/Manager Only)
**PATCH** `/users/deactivate/:userId`

Deactivate a user and all their team members (cascades down).

**Response:**
```json
{
  "success": true,
  "message": "User and their team deactivated successfully"
}
```

**Note:** Deactivated users cannot login or access any API endpoints.

### Activate User (Admin/Manager Only)
**PATCH** `/users/activate/:userId`

Reactivate a deactivated user (does not cascade - activate each user individually).

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

## 📊 Leads Management

### Get My Leads
**GET** `/leads`

Returns leads assigned to you.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "lead",
      "date": "2026-02-03",
      "name": "Customer Name",
      "phone": "1231231234",
      "configuration": "2BHK",
      "location": "Pune West",
      "remark": "Hot lead",
      "status": "contacted",
      "assignedTo": "your_uuid",
      "createdAt": "2026-02-03T10:00:00Z"
    }
  ]
}
```

### Create Lead (Admin Only)
**POST** `/leads`

**Request:**
```json
{
  "type": "lead",
  "date": "2026-02-03",
  "name": "Customer Name",
  "phone": "1231231234",
  "configuration": "2BHK",
  "location": "Pune West",
  "remark": "Interested in project X",
  "assignedTo": "employee_uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "lead",
    "date": "2026-02-03",
    "name": "Customer Name",
    "phone": "1231231234",
    "configuration": "2BHK",
    "location": "Pune West",
    "remark": "Interested in project X",
    "status": "new",
    "assignedTo": "employee_uuid"
  }
}
```

### Bulk Upload Leads (Admin Only)
**POST** `/leads/bulk`

**CSV Format:**
```
Type,Date,Customer Name,Customer Number,Configuration,Remark,Assign to
lead,2026-02-03,John Doe,1234567890,2BHK,Hot lead,9999999999
```

**Request:**
```json
{
  "csvContent": "Type,Date,Customer Name,Customer Number,Configuration,Remark,Assign to\nlead,2026-02-03,John,1234567890,2BHK,Hot,9999999999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "success": 9,
    "failed": 1,
    "results": [...]
  }
}
```

### Update Lead Status
**PATCH** `/leads/:leadId`

**Request:**
```json
{
  "status": "prospect",
  "remark": "Very interested, ready to book"
}
```

**Status Options:**
- `new` - New lead
- `contacted` - Initial contact made
- `interested` - Customer interested
- `not_interested` - Not interested
- `prospect` - Hot prospect (close to conversion)
- `converted` - Deal closed
- `spam` - Wrong number / not valid

---

## 📞 Call Tracking

### Log Phone Call
**POST** `/logs`

**When user taps phone icon in your app:**

**Request:**
```json
{
  "leadId": "uuid",
  "action": "call",
  "duration": 180,
  "outcome": "interested",
  "notes": "Discussed pricing, wants to visit site"
}
```

**Duration:** In seconds (captured from call log)

**Outcome Options:**
- `interested` - Customer interested
- `not_interested` - Not interested
- `callback` - Call back later
- `wrong_number` - Wrong number
- `no_answer` - No answer

**Deep Link to Phone Dialer:**
```javascript
import { Linking } from 'react-native';

const makeCall = (phoneNumber) => {
  Linking.openURL(`tel:${phoneNumber}`);
};
```

---

## 💬 WhatsApp Integration

### Send WhatsApp Message
**POST** `/logs`

**When user taps WhatsApp icon:**

**Request:**
```json
{
  "leadId": "uuid",
  "action": "whatsapp",
  "templateId": "template_uuid",
  "notes": "Sent welcome message"
}
```

**Deep Link to WhatsApp:**
```javascript
import { Linking } from 'react-native';

const openWhatsApp = (phoneNumber, message) => {
  const url = `whatsapp://send?phone=91${phoneNumber}&text=${encodeURIComponent(message)}`;
  Linking.openURL(url);
};
```

---

## 📝 Message Templates

### Get All Templates
**GET** `/templates`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Welcome Message",
      "message": "Hello! Thank you for your interest in our project. We have exciting offers...",
      "isActive": true
    }
  ]
}
```

**UI Implementation:**
```javascript
// Template Picker Component
const TemplateSelector = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    const response = await fetch('API_URL/templates', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setTemplates(data.data);
  };
  
  return (
    <FlatList
      data={templates}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item)}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
};
```

### Create Template (Admin Only)
**POST** `/templates`

**Request:**
```json
{
  "title": "Follow-up Message",
  "message": "Hi, this is a follow-up on our discussion..."
}
```

---

## ⏰ Follow-ups & Reminders

### Create Follow-up
**POST** `/followups`

**Request:**
```json
{
  "leadId": "uuid",
  "reminderAt": "2026-02-04T10:00:00Z",
  "notes": "Call back to discuss pricing"
}
```

**Push Notification Setup:**
Schedule local notification for `reminderAt` time.

### Get Today's Follow-ups
**GET** `/followups/today`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reminderAt": "2026-02-03T10:00:00Z",
      "status": "pending",
      "notes": "Call back",
      "lead": {
        "id": "uuid",
        "name": "Customer Name",
        "phone": "1234567890"
      }
    }
  ]
}
```

**Display as Card/Notification:**
```javascript
const TodayFollowups = () => {
  const [followups, setFollowups] = useState([]);
  
  useEffect(() => {
    fetch('API_URL/followups/today', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setFollowups(data.data));
  }, []);
  
  return (
    <FlatList
      data={followups}
      renderItem={({ item }) => (
        <Card>
          <Text>{item.lead.name}</Text>
          <Text>{item.notes}</Text>
          <Text>{new Date(item.reminderAt).toLocaleTimeString()}</Text>
        </Card>
      )}
    />
  );
};
```

### Get Backlog (Missed Follow-ups)
**GET** `/followups/backlog`

Shows all missed reminders. Display with red badge/notification.

### Mark Follow-up Complete
**PATCH** `/followups/:followupId`

**Request:**
```json
{
  "status": "done",
  "outcome": "Scheduled meeting",
  "notes": "Customer agreed to meet tomorrow"
}
```

---

## 📅 Meetings & Visits

### Schedule Meeting
**POST** `/meetings`

**Request:**
```json
{
  "leadId": "uuid",
  "scheduledAt": "2026-02-05T14:00:00Z",
  "location": "Office",
  "notes": "Discuss pricing and payment plan"
}
```

### Schedule Site Visit
**POST** `/visits`

**Request:**
```json
{
  "leadId": "uuid",
  "scheduledAt": "2026-02-06T11:00:00Z",
  "siteLocation": "Green Valley Project, Pune",
  "notes": "Show 2BHK model flat"
}
```

### Get Meetings
**GET** `/meetings?status=scheduled`

Status options: `scheduled`, `completed`, `cancelled`, `missed`

### Get Visits
**GET** `/visits?status=scheduled`

### Complete Meeting/Visit
**PATCH** `/meetings/:meetingId`
**PATCH** `/visits/:visitId`

**Request:**
```json
{
  "status": "completed",
  "outcome": "Very positive, customer ready to book",
  "notes": "Discussed all amenities, customer liked the location"
}
```

---

## 📝 Lead Notes

### Add Note to Lead
**POST** `/notes`

**Request:**
```json
{
  "leadId": "uuid",
  "text": "Customer prefers 3BHK on higher floors. Budget: 80L"
}
```

### Get Lead Notes
**GET** `/notes?leadId=uuid`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "text": "Customer prefers 3BHK on higher floors",
      "createdAt": "2026-02-03T12:00:00Z",
      "user": {
        "name": "John Doe"
      }
    }
  ]
}
```

---

## 📊 Daily Report

### Get Daily Report
**GET** `/reports/daily?date=2026-02-03`

**Response:**
```json
{
  "success": true,
  "data": {
    "reportDate": "2026-02-03",
    "totalCalls": 15,
    "todayMeetings": 3,
    "todayVisits": 2,
    "meetingsTillNow": 45,
    "visitsTillNow": 30,
    "prospectsTillNow": 12,
    "prospects": [
      {
        "name": "John Doe",
        "phone": "1234567890"
      }
    ]
  }
}
```

**Report Card UI:**
```javascript
const DailyReportCard = () => {
  const [report, setReport] = useState(null);
  
  useEffect(() => {
    fetchDailyReport();
  }, []);
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Daily Update</Text>
      <View style={styles.row}>
        <StatItem label="Visits Till Now" value={report?.visitsTillNow} />
        <StatItem label="Meetings Till Now" value={report?.meetingsTillNow} />
      </View>
      <View style={styles.row}>
        <StatItem label="Today Meetings" value={report?.todayMeetings} />
        <StatItem label="Today Visits" value={report?.todayVisits} />
      </View>
      <StatItem label="Total Calls" value={report?.totalCalls} />
      <StatItem label="Prospects" value={report?.prospectsTillNow} />
    </View>
  );
};
```

### Submit Daily Report (Share to Manager)
**POST** `/reports/daily`

**Request:**
```json
{
  "reportDate": "2026-02-03",
  "nextDayPlan": "Follow up with 5 hot leads. 2 site visits planned for Project A."
}
```

**Response (201 Created):**
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
    "nextDayPlan": "Follow up with 5 hot leads. 2 site visits planned for Project A."
  }
}
```

**Share via WhatsApp to Manager:**
```javascript
const shareReportToManager = async (report, managerPhone) => {
  const message = `
Daily Update - ${report.reportDate}

Visits Till Now: ${report.visitsTillNow}
Meetings Till Now: ${report.meetingsTillNow}
Prospects: ${report.prospectsTillNow}

Today Meeting: ${report.todayMeetings}
Today Visit: ${report.todayVisits}
Total Calls: ${report.totalCalls}

Next Day Plan:
${report.nextDayPlan}
  `.trim();
  
  const url = `whatsapp://send?phone=91${managerPhone}&text=${encodeURIComponent(message)}`;
  Linking.openURL(url);
};
```

---

## 📈 Monthly Report & Targets

### Get Monthly Report
**GET** `/reports/monthly?month=2026-02-01`

**Response:**
```json
{
  "success": true,
  "data": {
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
}
```

**Progress Bar UI:**
```javascript
const MonthlyTargetCard = () => {
  const [report, setReport] = useState(null);
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Monthly Target - February 2026</Text>
      
      <View style={styles.targetRow}>
        <Text>Meetings: {report?.achievement.meetings}/{report?.target.meetings}</Text>
        <ProgressBar progress={parseFloat(report?.achievement.meetingProgress)} />
      </View>
      
      <View style={styles.targetRow}>
        <Text>Visits: {report?.achievement.visits}/{report?.target.visits}</Text>
        <ProgressBar progress={parseFloat(report?.achievement.visitProgress)} />
      </View>
      
      {report?.targetMet && (
        <View style={styles.bonus}>
          <Text>🎉 Target Achieved! Bonus: ₹{report.target.bonus}</Text>
          {report.bonusApproved ? (
            <Text style={styles.approved}>✅ Bonus Approved</Text>
          ) : (
            <Text style={styles.pending}>⏳ Awaiting Approval</Text>
          )}
        </View>
      )}
    </View>
  );
};
```

---

## 🏠 Properties (View Only for Admin/Manager/Employee)

### Get All Properties
**GET** `/properties`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectName": "Green Valley",
      "builders": "ABC Builders",
      "location": "Pune West",
      "configuration": "2BHK, 3BHK",
      "price": "50L - 80L",
      "possession": "Dec 2026",
      "link": "https://example.com/project",
      "contactUs": "1234567890",
      "amenitiesSummary": "All 3BHK Flat 2 Covered Car Parking",
      "driveLink": "https://drive.google.com/..."
    }
  ]
}
```

### Get Single Property
**GET** `/properties/:id`

Fetch details of a specific property.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectName": "Green Valley",
    "builders": "ABC Builders",
    "location": "Pune West",
    "configuration": "2BHK, 3BHK",
    "price": "50L - 80L",
    "possession": "Dec 2026"
  }
}
```

### Get Properties Summary
**GET** `/properties/summary`

Get count and summary of properties.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 155,
    "byLocation": {
      "Pune West": 45,
      "Pune East": 38
    }
  }
}
```

### Share Property via WhatsApp (API)
**POST** `/properties/:id/share`

Generate WhatsApp share link from backend.

**Request:**
```json
{
  "phoneNumber": "9876543210"
}
```

**OR with Lead ID:**
```json
{
  "leadId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsappUrl": "https://wa.me/919876543210?text=...",
    "message": "🏡 Green Valley\n\n🏗️ Builder: ABC Builders..."
  }
}
```

**Usage:**
```javascript
import { Linking } from 'react-native';

const sharePropertyToLead = async (propertyId, leadId) => {
  const response = await fetch(`API_URL/properties/${propertyId}/share`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ leadId })
  });
  
  const data = await response.json();
  
  if (data.success) {
    Linking.openURL(data.data.whatsappUrl);
  }
};
```

**Share Property via WhatsApp (Direct):**
```javascript
const shareProperty = (property, customerPhone) => {
  const message = `
🏡 ${property.projectName}

🏗️ Builder: ${property.builders}
📍 Location: ${property.location}
🏠 Configuration: ${property.configuration}
💰 Price: ${property.price}
🗓️ Possession: ${property.possession}

🔗 More Details: ${property.link}

📞 Contact: ${property.contactUs}
  `.trim();
  
  const url = `whatsapp://send?phone=91${customerPhone}&text=${encodeURIComponent(message)}`;
  Linking.openURL(url);
};
```

---

## 🎯 Common UI Flows

### 1. Lead Detail Screen
```javascript
const LeadDetailScreen = ({ route }) => {
  const { lead } = route.params;
  
  return (
    <ScrollView>
      <Text>{lead.name}</Text>
      <Text>{lead.phone}</Text>
      
      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button 
          title="📞 Call" 
          onPress={() => {
            Linking.openURL(`tel:${lead.phone}`);
            // Log call after
            logCall(lead.id);
          }}
        />
        
        <Button 
          title="💬 WhatsApp" 
          onPress={() => {
            // Show template picker
            showTemplatePicker();
          }}
        />
        
        <Button 
          title="⏰ Set Reminder" 
          onPress={() => {
            // Show date/time picker
            createFollowup();
          }}
        />
        
        <Button 
          title="📅 Schedule Meeting" 
          onPress={() => {
            scheduleMeeting();
          }}
        />
        
        <Button 
          title="🏠 Schedule Visit" 
          onPress={() => {
            scheduleVisit();
          }}
        />
      </View>
      
      {/* Notes Section */}
      <NotesSection leadId={lead.id} />
      
      {/* Activity Log */}
      <ActivityLog leadId={lead.id} />
    </ScrollView>
  );
};
```

### 2. Call Outcome Dialog
After call ends, show outcome picker:
```javascript
const CallOutcomeDialog = ({ onSubmit }) => {
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  
  const options = [
    { value: 'interested', label: '✅ Interested - Schedule Follow-up', action: 'followup' },
    { value: 'not_interested', label: '❌ Not Interested - Mark as Spam', action: 'spam' },
    { value: 'meeting', label: '📅 Wants Meeting', action: 'meeting' },
    { value: 'visit', label: '🏠 Wants Site Visit', action: 'visit' },
    { value: 'callback', label: '🔄 Call Back Later', action: 'followup' }
  ];
  
  const handleSubmit = () => {
    const selectedOption = options.find(o => o.value === outcome);
    
    if (selectedOption.action === 'spam') {
      updateLeadStatus('spam');
    } else if (selectedOption.action === 'followup') {
      navigateToFollowupCreation();
    } else if (selectedOption.action === 'meeting') {
      navigateToMeetingSchedule();
    } else if (selectedOption.action === 'visit') {
      navigateToVisitSchedule();
    }
    
    onSubmit({ outcome, notes });
  };
  
  return (
    <Modal>
      <Picker selectedValue={outcome} onValueChange={setOutcome}>
        {options.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      <TextInput 
        placeholder="Notes" 
        value={notes} 
        onChangeText={setNotes} 
      />
      <Button title="Submit" onPress={handleSubmit} />
    </Modal>
  );
};
```

### 3. Dashboard Screen
```javascript
const DashboardScreen = () => {
  return (
    <ScrollView>
      {/* Today's Follow-ups with Badge */}
      <Card>
        <Text>Today's Reminders</Text>
        <Badge count={todayFollowupsCount} />
        <FlatList data={todayFollowups} ... />
      </Card>
      
      {/* Backlog/Missed with Red Badge */}
      <Card>
        <Text>Missed Follow-ups</Text>
        <Badge count={backlogCount} color="red" />
        <FlatList data={backlog} ... />
      </Card>
      
      {/* Upcoming Meetings */}
      <Card>
        <Text>Upcoming Meetings</Text>
        <FlatList data={upcomingMeetings} ... />
      </Card>
      
      {/* Daily Stats */}
      <DailyReportCard />
      
      {/* Monthly Target Progress */}
      <MonthlyTargetCard />
    </ScrollView>
  );
};
```

---

## 🔔 Push Notifications Setup

### Local Notifications for Reminders
```javascript
import PushNotification from 'react-native-push-notification';

const scheduleFollowupNotification = (followup) => {
  PushNotification.localNotificationSchedule({
    id: followup.id,
    title: `Follow-up: ${followup.lead.name}`,
    message: followup.notes,
    date: new Date(followup.reminderAt),
    allowWhileIdle: true,
  });
};
```

---

## 🚨 Error Handling

All API errors return:
```json
{
  "error": "Error message",
  "details": [...]
}
```

**Account Deactivation (403 Forbidden):**
When admin is deactivated, all team members get this error:
```json
{
  "error": "Account deactivated",
  "message": "Your account has been deactivated. Please contact your administrator.",
  "code": "ACCOUNT_DEACTIVATED"
}
```

**Handle errors with auto-logout:**
```javascript
const apiCall = async () => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle account deactivation
      if (response.status === 403 && data.code === 'ACCOUNT_DEACTIVATED') {
        await AsyncStorage.clear();
        Alert.alert(
          'Account Deactivated',
          data.message,
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
        return null;
      }
      
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    Alert.alert('Error', error.message);
    return null;
  }
};
```

**Global Error Interceptor (Recommended):**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://api.example.com/api'
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403 && 
        error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
      // Clear storage and logout
      await AsyncStorage.clear();
      
      Alert.alert(
        'Account Deactivated',
        error.response.data.message,
        [{ text: 'OK', onPress: () => RootNavigation.replace('Login') }]
      );
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Token Management

```javascript
// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Logout if token expired
const checkAuth = async () => {
  const token = await AsyncStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    // Redirect to login
    navigation.navigate('Login');
    return false;
  }
  
  return true;
};
```

---

## 📱 Permissions Required

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
```

---

**Ready to integrate! All endpoints are production-ready.** 🚀
