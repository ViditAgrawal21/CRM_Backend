# CRM Owner Dashboard API Documentation
## For Web Developers (React/Next.js)

**Base URL:** `http://your-server.com/api`

**Authentication:** JWT token required in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication

### Owner Login
**POST** `/auth/login`

**Request:**
```json
{
  "phone": "9999999999",
  "password": "owner123"
}
```

**Response:**
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

**React Implementation:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://api.example.com/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const login = async (phone, password) => {
  const { data } = await api.post('/auth/login', { phone, password });
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  return data.data;
};
```

---

## 👥 Admin Management

### Create Admin
**POST** `/users`

**Only Owner can create admins.**

**Request:**
```json
{
  "name": "Admin Name",
  "phone": "8888888888",
  "password": "admin123",
  "role": "admin",
  "monthlyMeetingTarget": 0,
  "monthlyVisitTarget": 0,
  "monthlyRevenueTarget": 0,
  "monthlyBonus": 0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin Name",
    "phone": "8888888888",
    "role": "admin",
    "parentId": "owner_uuid",
    "isActive": true
  }
}
```

### Get Organization Hierarchy
**GET** `/users/team`

Returns complete organization tree.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "admin_uuid",
      "name": "Admin 1",
      "phone": "8888888888",
      "role": "admin",
      "isActive": true,
      "level": 1
    },
    {
      "id": "manager_uuid",
      "name": "Manager 1",
      "phone": "7777777777",
      "role": "manager",
      "isActive": true,
      "level": 2
    },
    {
      "id": "employee_uuid",
      "name": "Employee 1",
      "phone": "6666666666",
      "role": "employee",
      "isActive": true,
      "level": 3
    }
  ]
}
```

**Render as Tree:**
```javascript
import { Tree } from 'antd';

const OrganizationChart = () => {
  const [team, setTeam] = useState([]);
  
  useEffect(() => {
    fetchTeam();
  }, []);
  
  const fetchTeam = async () => {
    const { data } = await api.get('/users/team');
    setTeam(buildTree(data.data));
  };
  
  const buildTree = (members) => {
    // Convert flat array to tree structure
    const grouped = members.reduce((acc, member) => {
      const level = member.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(member);
      return acc;
    }, {});
    
    return grouped;
  };
  
  return (
    <div className="org-chart">
      {/* Render hierarchical tree */}
    </div>
  );
};
```

### Deactivate Admin (Cascades to All Children)
**PATCH** `/users/deactivate/:adminId`

**Important:** Deactivating an admin will automatically deactivate:
- All managers under that admin
- All employees under those managers
- Block app login for all deactivated users

**Response:**
```json
{
  "success": true,
  "message": "User and their team deactivated successfully"
}
```

**Confirmation Dialog:**
```javascript
const deactivateAdmin = async (adminId) => {
  if (window.confirm('This will deactivate the admin and ALL their team members. Continue?')) {
    await api.patch(`/users/deactivate/${adminId}`);
    toast.success('Admin and team deactivated');
    refreshTeam();
  }
};
```

---

## 📊 Analytics & Dashboard

### Get Dashboard Stats
**GET** `/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalLeads": 1500,
      "totalAdmins": 3,
      "totalManagers": 10,
      "totalEmployees": 50,
      "activeUsers": 60,
      "inactiveUsers": 3
    },
    "leadsByStatus": {
      "new": 200,
      "contacted": 400,
      "interested": 300,
      "prospect": 150,
      "converted": 100,
      "spam": 50
    },
    "leadsByType": {
      "websiteLeads": 800,
      "marketData": 700
    },
    "deletedLeads": 45,
    "thisMonth": {
      "totalMeetings": 180,
      "totalVisits": 120,
      "conversions": 25
    },
    "performance": {
      "topPerformer": {
        "name": "Employee 1",
        "role": "employee",
        "meetings": 45,
        "visits": 30
      }
    }
  }
}
```

**Dashboard Layout:**
```javascript
const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  
  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card>
          <Statistic title="Total Leads" value={stats?.overview.totalLeads} />
        </Card>
        <Card>
          <Statistic 
            title="Website Leads" 
            value={stats?.leadsByType.websiteLeads}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card>
          <Statistic 
            title="Market Data" 
            value={stats?.leadsByType.marketData}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
        <Card>
          <Statistic title="Active Users" value={stats?.overview.activeUsers} />
        </Card>
        <Card>
          <Statistic title="This Month Meetings" value={stats?.thisMonth.totalMeetings} />
        </Card>
        <Card>
          <Statistic title="Conversions" value={stats?.thisMonth.conversions} />
        </Card>
        <Card>
          <Statistic 
            title="Deleted Leads" 
            value={stats?.deletedLeads}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </div>
      
      {/* Lead Status Chart */}
      <Card title="Leads by Status">
        <PieChart data={stats?.leadsByStatus} />
      </Card>
      
      {/* Organization Hierarchy */}
      <Card title="Organization Structure">
        <OrganizationChart />
      </Card>
      
      {/* Top Performers */}
      <Card title="Top Performers">
        <TopPerformersTable />
      </Card>
    </div>
  );
};
```

---

## 📋 Leads Management

### Get All Leads (Mixed - Website + Market Data)
**GET** `/leads`

Returns all leads (both website leads and market data).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "lead",
      "name": "John Doe",
      "phone": "9876543210",
      "status": "interested",
      "configuration": "3BHK",
      "location": "Pune West",
      "remark": "Interested in Green Valley",
      "assignedToUser": {
        "id": "uuid",
        "name": "Employee 1",
        "phone": "6666666666"
      },
      "createdByUser": {
        "id": "uuid",
        "name": "Admin 1",
        "phone": "8888888888"
      },
      "isUploadedRecord": false,
      "createdAt": "2026-02-04T10:00:00Z"
    },
    {
      "id": "uuid",
      "type": "data",
      "name": "Jane Smith",
      "phone": "9876543211",
      "status": "new",
      "isUploadedRecord": true,
      "uploadedBy": "admin-uuid",
      "createdAt": "2026-02-04T11:00:00Z"
    }
  ]
}
```

### Get Website Leads Only (Genuine Leads)
**GET** `/leads?type=lead`

Returns only genuine leads from website.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "lead",
      "name": "John Doe",
      "phone": "9876543210",
      "status": "interested"
    }
  ]
}
```

### Get Market Data Only (Cold Leads)
**GET** `/leads?type=data`

Returns only market data (bulk uploaded cold leads).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "data",
      "name": "Jane Smith",
      "phone": "9876543211",
      "status": "new",
      "isUploadedRecord": true
    }
  ]
}
```

### Filter Leads by Type and Status
**GET** `/leads?type=lead&status=interested`

Combine filters for precise results.

**Leads Dashboard Component:**
```javascript
import { Tabs, Table, Tag } from 'antd';

const LeadsManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [leads, setLeads] = useState([]);
  
  const fetchLeads = async (type = null, status = null) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const { data } = await api.get(`/leads?${params}`);
    setLeads(data.data);
  };
  
  const columns = [
    { 
      title: 'Type', 
      dataIndex: 'type',
      render: (type) => (
        <Tag color={type === 'lead' ? 'green' : 'orange'}>
          {type === 'lead' ? 'Website' : 'Market'}
        </Tag>
      )
    },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Status', dataIndex: 'status' },
    { 
      title: 'Source',
      render: (record) => record.isUploadedRecord ? '📤 Bulk Upload' : '✍️ Manual'
    }
  ];
  
  return (
    <div>
      <Tabs onChange={(key) => {
        setActiveTab(key);
        if (key === 'all') fetchLeads();
        else if (key === 'lead') fetchLeads('lead');
        else if (key === 'data') fetchLeads('data');
      }}>
        <Tabs.TabPane tab="All Leads" key="all" />
        <Tabs.TabPane tab="Website Leads" key="lead" />
        <Tabs.TabPane tab="Market Data" key="data" />
      </Tabs>
      
      <Table dataSource={leads} columns={columns} />
    </div>
  );
};
```

### View Deleted Leads (Trash)
**GET** `/leads/deleted`

Owner can see all deleted leads from entire organization.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "lead",
      "name": "John Doe",
      "phone": "9876543210",
      "status": "interested",
      "isDeleted": true,
      "deletedBy": "manager-uuid",
      "deletedAt": "2026-02-04T15:30:00Z",
      "deletedByUser": {
        "id": "uuid",
        "name": "Manager 1",
        "phone": "7777777777"
      }
    }
  ]
}
```

### Restore Deleted Lead
**PATCH** `/leads/:id/restore`

Owner can restore any deleted lead.

**Response:**
```json
{
  "success": true,
  "message": "Lead restored successfully",
  "data": {
    "id": "uuid",
    "isDeleted": false,
    "deletedBy": null,
    "deletedAt": null
  }
}
```

### Permanently Delete Lead
**DELETE** `/leads/:id/permanent`

Owner can permanently delete any lead from database.

⚠️ **Warning:** This action cannot be undone!

**Response:**
```json
{
  "success": true,
  "message": "Lead permanently deleted"
}
```

**Trash Management Component:**
```javascript
import { Table, Button, Popconfirm, Space } from 'antd';

const TrashManagement = () => {
  const [deletedLeads, setDeletedLeads] = useState([]);
  
  useEffect(() => {
    fetchDeletedLeads();
  }, []);
  
  const fetchDeletedLeads = async () => {
    const { data } = await api.get('/leads/deleted');
    setDeletedLeads(data.data);
  };
  
  const restoreLead = async (leadId) => {
    await api.patch(`/leads/${leadId}/restore`);
    message.success('Lead restored');
    fetchDeletedLeads();
  };
  
  const permanentDelete = async (leadId) => {
    await api.delete(`/leads/${leadId}/permanent`);
    message.success('Lead permanently deleted');
    fetchDeletedLeads();
  };
  
  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Phone', dataIndex: 'phone' },
    { 
      title: 'Deleted By', 
      render: (record) => record.deletedByUser?.name 
    },
    { 
      title: 'Deleted At', 
      dataIndex: 'deletedAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      render: (record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => restoreLead(record.id)}
          >
            Restore
          </Button>
          
          <Popconfirm
            title="Permanently delete this lead?"
            description="This action cannot be undone!"
            onConfirm={() => permanentDelete(record.id)}
            okText="Delete Forever"
            okButtonProps={{ danger: true }}
          >
            <Button danger>Delete Forever</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <h2>Trash ({deletedLeads.length})</h2>
      <Table dataSource={deletedLeads} columns={columns} />
    </div>
  );
};
```

---

## 🏠 Properties Management

### Get All Properties
**GET** `/properties?location=Pune`

Fetches from external website API.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectName": "Green Valley Residency",
      "builders": "ABC Builders",
      "location": "Pune West",
      "configuration": "2BHK, 3BHK, 4BHK",
      "price": "₹50L - ₹1.2Cr",
      "possession": "December 2026",
      "link": "https://website.com/green-valley",
      "contactUs": "1234567890"
    }
  ]
}
```

### Add Property
**POST** `/properties`

**Only Owner can add properties.**

Sends data to external website API.

**Request:**
```json
{
  "projectName": "Sunset Heights",
  "builders": "XYZ Developers",
  "location": "Pune East",
  "configuration": "3BHK, 4BHK",
  "price": "₹80L - ₹1.5Cr",
  "possession": "June 2027",
  "link": "https://website.com/sunset-heights",
  "contactUs": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "external_api_id",
    "message": "Property added to website"
  }
}
```

**Form Component:**
```javascript
import { Form, Input, Button } from 'antd';

const AddPropertyForm = () => {
  const [form] = Form.useForm();
  
  const onSubmit = async (values) => {
    try {
      await api.post('/properties', values);
      message.success('Property added successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add property');
    }
  };
  
  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      <Form.Item name="builders" label="Builders" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      <Form.Item name="location" label="Location" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      <Form.Item name="configuration" label="Configuration" rules={[{ required: true }]}>
        <Input placeholder="2BHK, 3BHK" />
      </Form.Item>
      
      <Form.Item name="price" label="Price Range" rules={[{ required: true }]}>
        <Input placeholder="₹50L - ₹80L" />
      </Form.Item>
      
      <Form.Item name="possession" label="Possession" rules={[{ required: true }]}>
        <Input placeholder="December 2026" />
      </Form.Item>
      
      <Form.Item name="link" label="Website Link">
        <Input type="url" />
      </Form.Item>
      
      <Form.Item name="contactUs" label="Contact Number" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      <Button type="primary" htmlType="submit">Add Property</Button>
    </Form>
  );
};
```

### Bulk Upload Properties (CSV)
**POST** `/properties/bulk`

**CSV Format:**
```csv
Project Name,Builders,Location,Configuration,Price,Possession,Link,Contact Us
Green Valley,ABC,Pune West,"2BHK, 3BHK",50L-80L,Dec 2026,http://link.com,1234567890
```

**Request:**
```json
{
  "csvContent": "Project Name,Builders,Location,Configuration,Price,Possession,Link,Contact Us\nGreen Valley,ABC,Pune West,2BHK,50L,Dec 2026,http://link.com,1234567890"
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

**CSV Upload Component:**
```javascript
import { Upload, Button } from 'antd';
import Papa from 'papaparse';

const BulkPropertyUpload = () => {
  const handleUpload = (file) => {
    Papa.parse(file, {
      complete: async (result) => {
        const csvContent = Papa.unparse(result.data);
        
        try {
          const { data } = await api.post('/properties/bulk', { csvContent });
          message.success(`${data.data.success} properties uploaded successfully`);
          if (data.data.failed > 0) {
            message.warning(`${data.data.failed} properties failed`);
          }
        } catch (error) {
          message.error('Upload failed');
        }
      }
    });
    
    return false; // Prevent auto upload
  };
  
  return (
    <Upload beforeUpload={handleUpload} accept=".csv">
      <Button icon={<UploadOutlined />}>Upload CSV</Button>
    </Upload>
  );
};
```

---

## 🎯 Targets & Bonus Management

### View Team Targets
**GET** `/targets/team?month=2026-02-01`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "target_uuid",
      "month": "2026-02-01",
      "user": {
        "id": "uuid",
        "name": "Employee 1",
        "role": "employee",
        "phone": "6666666666"
      },
      "meetingTarget": 25,
      "visitTarget": 15,
      "revenueTarget": 500000,
      "bonus": 10000,
      "meetingAchieved": 28,
      "visitAchieved": 16,
      "bonusApproved": false
    }
  ]
}
```

**Targets Table:**
```javascript
import { Table, Tag, Button } from 'antd';

const TargetsTable = () => {
  const [targets, setTargets] = useState([]);
  
  const columns = [
    { title: 'Name', dataIndex: ['user', 'name'] },
    { title: 'Role', dataIndex: ['user', 'role'] },
    { 
      title: 'Meetings', 
      render: (record) => (
        <span>
          {record.meetingAchieved}/{record.meetingTarget}
          {record.meetingAchieved >= record.meetingTarget && (
            <Tag color="green">✓</Tag>
          )}
        </span>
      )
    },
    { 
      title: 'Visits', 
      render: (record) => (
        <span>
          {record.visitAchieved}/{record.visitTarget}
          {record.visitAchieved >= record.visitTarget && (
            <Tag color="green">✓</Tag>
          )}
        </span>
      )
    },
    { title: 'Bonus', dataIndex: 'bonus', render: (val) => `₹${val}` },
    {
      title: 'Status',
      render: (record) => {
        const targetMet = record.meetingAchieved >= record.meetingTarget && 
                         record.visitAchieved >= record.visitTarget;
        
        if (!targetMet) {
          return <Tag color="orange">In Progress</Tag>;
        }
        
        if (record.bonusApproved) {
          return <Tag color="green">Bonus Approved</Tag>;
        }
        
        return (
          <Button 
            type="primary" 
            onClick={() => approveBonus(record.id)}
          >
            Approve Bonus
          </Button>
        );
      }
    }
  ];
  
  return <Table dataSource={targets} columns={columns} />;
};
```

### Approve Bonus
**POST** `/targets/approve-bonus`

**Request:**
```json
{
  "targetId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bonus approved successfully",
  "data": {
    "bonusApproved": true,
    "bonusApprovedBy": "owner_uuid",
    "bonusApprovedAt": "2026-02-03T12:00:00Z"
  }
}
```

---

## 📈 Reports & Analytics

### Team Performance Report
**GET** `/reports/monthly?month=2026-02-01`

Get monthly performance for specific user.

### Custom Analytics Query

**Example: Get conversion rate by admin**
```javascript
const getAdminPerformance = async () => {
  const team = await api.get('/users/team');
  const admins = team.data.data.filter(u => u.role === 'admin');
  
  const performance = await Promise.all(
    admins.map(async (admin) => {
      const leads = await api.get(`/leads?createdBy=${admin.id}`);
      const converted = leads.data.data.filter(l => l.status === 'converted');
      
      return {
        name: admin.name,
        totalLeads: leads.data.data.length,
        converted: converted.length,
        conversionRate: (converted.length / leads.data.data.length * 100).toFixed(2)
      };
    })
  );
  
  return performance;
};
```

---

## 📊 Data Visualization Examples

### Lead Funnel Chart
```javascript
import { Funnel } from '@ant-design/charts';

const LeadFunnelChart = ({ stats }) => {
  const data = [
    { stage: 'New Leads', value: stats.new },
    { stage: 'Contacted', value: stats.contacted },
    { stage: 'Interested', value: stats.interested },
    { stage: 'Prospects', value: stats.prospect },
    { stage: 'Converted', value: stats.converted }
  ];
  
  const config = {
    data,
    xField: 'stage',
    yField: 'value',
    label: {
      formatter: (datum) => `${datum.value}\n(${((datum.value / stats.new) * 100).toFixed(1)}%)`
    }
  };
  
  return <Funnel {...config} />;
};
```

### Team Performance Comparison
```javascript
import { Column } from '@ant-design/charts';

const TeamPerformanceChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchTeamPerformance();
  }, []);
  
  const config = {
    data,
    xField: 'name',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0]
    }
  };
  
  return <Column {...config} />;
};
```

---

## 🔍 Advanced Filters

### Filter Leads by Multiple Criteria
```javascript
const LeadsTable = () => {
  const [filters, setFilters] = useState({
    type: '', // 'lead' or 'data'
    status: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const fetchFilteredLeads = async () => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/leads?${params}`);
    return data.data;
  };
  
  return (
    <>
      <Form layout="inline">
        <Form.Item>
          <Select 
            placeholder="Type" 
            onChange={(val) => setFilters({...filters, type: val})}
            allowClear
          >
            <Option value="lead">Website Leads</Option>
            <Option value="data">Market Data</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Select 
            placeholder="Status" 
            onChange={(val) => setFilters({...filters, status: val})}
            allowClear
          >
            <Option value="new">New</Option>
            <Option value="contacted">Contacted</Option>
            <Option value="prospect">Prospect</Option>
            <Option value="interested">Interested</Option>
            <Option value="converted">Converted</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <DatePicker.RangePicker 
            onChange={(dates) => setFilters({
              ...filters, 
              dateFrom: dates[0], 
              dateTo: dates[1]
            })}
          />
        </Form.Item>
        
        <Button type="primary" onClick={fetchFilteredLeads}>
          Apply Filters
        </Button>
      </Form>
      
      <Table dataSource={leads} columns={columns} />
    </>
  );
};
```

---

## 📤 Export Data

### Export Leads to CSV
```javascript
import { CSVLink } from 'react-csv';

const ExportLeadsButton = () => {
  const [leads, setLeads] = useState([]);
  
  const headers = [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Configuration', key: 'configuration' },
    { label: 'Status', key: 'status' },
    { label: 'Assigned To', key: 'assignedToName' }
  ];
  
  return (
    <CSVLink 
      data={leads} 
      headers={headers} 
      filename="leads_export.csv"
    >
      <Button icon={<DownloadOutlined />}>Export to CSV</Button>
    </CSVLink>
  );
};
```

---

## 🔔 Real-time Updates (Optional)

### WebSocket Connection for Live Stats
```javascript
import { io } from 'socket.io-client';

const useLiveStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const socket = io('ws://your-server.com');
    
    socket.on('stats-update', (data) => {
      setStats(data);
    });
    
    return () => socket.disconnect();
  }, []);
  
  return stats;
};
```

---

## 🛡️ Role-Based Access Control

### Protected Routes
```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = 'owner' }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute requiredRole="owner">
    <OwnerDashboard />
  </ProtectedRoute>
} />
```

---

## 📱 Responsive Design

The dashboard should be responsive and work on:
- Desktop (1920x1080+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

**Use Ant Design's Grid System:**
```javascript
import { Row, Col } from 'antd';

<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <StatCard />
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    <StatCard />
  </Col>
</Row>
```

---

## 🎨 Recommended UI Libraries

- **Ant Design** - Complete UI framework
- **Recharts / @ant-design/charts** - Data visualization
- **React Table** - Advanced tables
- **Date-fns** - Date formatting
- **Axios** - HTTP client
- **React Query** - Data fetching & caching

---

## 📦 Sample Dashboard Structure

```
src/
├── components/
│   ├── AdminList.jsx
│   ├── OrganizationChart.jsx
│   ├── PropertyForm.jsx
│   ├── TargetsTable.jsx
│   ├── LeadsTable.jsx
│   ├── TrashManagement.jsx
│   └── StatCard.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── AdminManagement.jsx
│   ├── LeadsManagement.jsx
│   ├── Trash.jsx
│   ├── Properties.jsx
│   ├── Analytics.jsx
│   └── Settings.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useStats.js
│   └── useTeam.js
├── services/
│   └── api.js
└── App.jsx
```

---

**Owner Dashboard is ready for implementation!** 🚀

All endpoints are production-ready and optimized for web applications.
