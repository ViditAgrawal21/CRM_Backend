# Properties API - Owner Dashboard Integration
## For React/Next.js Frontend Developers

**Last Updated:** February 5, 2026

---

## 📚 Overview

The Properties module allows **Owners** to manage properties via an external API. All property data is stored externally - the CRM backend acts as a proxy.

**Base URL:** `https://property-website-748576937648.us-central1.run.app`

**Authentication:** JWT token (from CRM login)

---

## 🔐 Authentication

Use your existing CRM authentication:

```javascript
// Login to CRM (same as before)
const { data } = await axios.post('/api/auth/login', {
  phone: '9999999999',
  password: 'owner123'
});

// Store token
localStorage.setItem('token', data.data.token);

// Use token in all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## 📋 API Endpoints

### 1. Get All Properties

**Endpoint:** `GET /api/properties`

**Access:** All roles (Owner, Admin, Manager, Employee)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Godrej Woodsville Premium Apartments",
      "property_type": "Apartment",
      "location": "Hinjewadi Phase 2, Pune",
      "image_url": "https://example.com/image.jpg",
      "status": "available",
      "drive_link": "https://drive.google.com/...",
      "phone": "+91 9876543210",
      "possession": "Ready to Move",
      "total_land_acres": 5.25,
      "total_towers": "8 Towers",
      "amenities_summary": "Swimming Pool, Gym, Clubhouse",
      "total_floors": 25,
      "listing_by": "Builder",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z",
      "units_line": "2BHK - 750 sqft - Rs. 80L | 3BHK - 1050 sqft - Rs. 1.25Cr"
    }
  ]
}
```

**React Example:**
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get('/api/properties');
      setProperties(data.data);
    } catch (error) {
      message.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="properties-list">
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
```

---

### 2. Get Single Property

**Endpoint:** `GET /api/properties/:id`

**Access:** All roles

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Godrej Woodsville",
    "property_type": "Apartment",
    "location": "Pune",
    ...
  }
}
```

---

### 3. Get Properties Summary

**Endpoint:** `GET /api/properties/summary`

**Access:** All roles

**Response:**
```json
{
  "success": true,
  "data": {
    "total_properties": 45,
    "status_counts": {
      "available": 30,
      "prelaunch": 5,
      "limited_inventory": 2
    },
    "recent_properties": [...]
  }
}
```

---

### 4. Create Property ⭐ Owner Only

**Endpoint:** `POST /api/properties`

**Access:** Owner only

**Request Body:**
```json
{
  "title": "Godrej Woodsville Premium Apartments",
  "property_type": "Apartment",
  "location": "Hinjewadi Phase 2, Pune",
  "image_url": "https://example.com/image.jpg",
  "status": "available",
  "drive_link": "https://drive.google.com/...",
  "phone": "+91 9876543210",
  "possession": "Ready to Move",
  "total_land_acres": 5.25,
  "total_towers": "8 Towers",
  "amenities_summary": "Swimming Pool, Gym, Clubhouse, 24/7 Security",
  "total_floors": 25,
  "listing_by": "Builder"
}
```

**Required Fields:**
- `title` (string)
- `property_type` (string): Apartment, Villa, Land, Township
- `location` (string)
- `image_url` (string)

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": { ... }
}
```

**React Form Component:**
```javascript
import { Form, Input, Select, Button, message } from 'antd';

const AddPropertyForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.post('/api/properties', values);
      message.success('Property created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <Form.Item 
        name="title" 
        label="Property Title" 
        rules={[{ required: true }]}
      >
        <Input placeholder="Godrej Woodsville" />
      </Form.Item>

      <Form.Item 
        name="property_type" 
        label="Property Type" 
        rules={[{ required: true }]}
      >
        <Select>
          <Select.Option value="Apartment">Apartment</Select.Option>
          <Select.Option value="Villa">Villa</Select.Option>
          <Select.Option value="Land">Land</Select.Option>
          <Select.Option value="Township">Township</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item 
        name="location" 
        label="Location" 
        rules={[{ required: true }]}
      >
        <Input placeholder="Hinjewadi Phase 2, Pune" />
      </Form.Item>

      <Form.Item 
        name="image_url" 
        label="Image URL" 
        rules={[{ required: true, type: 'url' }]}
      >
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item name="status" label="Status" initialValue="available">
        <Select>
          <Select.Option value="available">Available</Select.Option>
          <Select.Option value="prelaunch">Pre-launch</Select.Option>
          <Select.Option value="limited_inventory">Limited Inventory</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="possession" label="Possession">
        <Input placeholder="Ready to Move / December 2026" />
      </Form.Item>

      <Form.Item name="total_land_acres" label="Land Area (Acres)">
        <Input type="number" step="0.01" />
      </Form.Item>

      <Form.Item name="total_towers" label="Total Towers">
        <Input placeholder="8 Towers" />
      </Form.Item>

      <Form.Item name="amenities_summary" label="Amenities">
        <Input.TextArea rows={3} placeholder="Swimming Pool, Gym..." />
      </Form.Item>

      <Form.Item name="total_floors" label="Total Floors">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="listing_by" label="Listed By">
        <Select>
          <Select.Option value="Builder">Builder</Select.Option>
          <Select.Option value="Owner">Owner</Select.Option>
          <Select.Option value="Agent">Agent</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="phone" label="Contact Number">
        <Input placeholder="+91 9876543210" />
      </Form.Item>

      <Form.Item name="drive_link" label="Google Drive Link">
        <Input placeholder="https://drive.google.com/..." />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading}>
        Add Property
      </Button>
    </Form>
  );
};
```

---

### 5. Update Property ⭐ Owner Only

**Endpoint:** `PATCH /api/properties/:id`

**Access:** Owner only

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Property Name",
  "status": "prelaunch",
  "possession": "March 2027"
}
```

**React Example:**
```javascript
const updateProperty = async (propertyId, updates) => {
  try {
    await axios.patch(`/api/properties/${propertyId}`, updates);
    message.success('Property updated successfully');
    fetchProperties(); // Refresh list
  } catch (error) {
    message.error('Failed to update property');
  }
};
```

---

### 6. Delete Property ⭐ Owner Only

**Endpoint:** `DELETE /api/properties/:id`

**Access:** Owner only

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

**React Example:**
```javascript
import { Popconfirm } from 'antd';

const deleteProperty = async (propertyId) => {
  try {
    await axios.delete(`/api/properties/${propertyId}`);
    message.success('Property deleted');
    fetchProperties();
  } catch (error) {
    message.error('Failed to delete property');
  }
};

// In component
<Popconfirm
  title="Delete this property?"
  onConfirm={() => deleteProperty(property.id)}
  okText="Yes"
  cancelText="No"
>
  <Button danger>Delete</Button>
</Popconfirm>
```

---

### 7. Bulk Upload Properties ⭐ Owner Only

**Endpoint:** `POST /api/properties/bulk`

**Access:** Owner only

**Content-Type:** `multipart/form-data`

**Request:** Upload Excel file (.xlsx or .xls)

**Excel Format:**

| title | property_type | location | image_url | status | possession | total_land_acres | total_towers | amenities_summary | total_floors | listing_by | phone | drive_link |
|-------|--------------|----------|-----------|--------|------------|-----------------|--------------|------------------|--------------|-----------|-------|------------|
| Godrej Woodsville | Apartment | Pune | https://... | available | Ready to Move | 5.25 | 8 Towers | Pool, Gym | 25 | Builder | +91... | https://... |

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload completed. Created 5 properties.",
  "data": {
    "created_count": 5,
    "error_count": 2,
    "errors": [
      "Row 3: Missing image_url",
      "Row 7: Invalid property type"
    ],
    "created_properties": [...]
  }
}
```

**React Upload Component:**
```javascript
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const BulkUploadProperties = () => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await axios.post('/api/properties/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success(data.message);
      
      if (data.data.error_count > 0) {
        message.warning(`${data.data.error_count} properties failed`);
        console.error('Errors:', data.data.errors);
      }

      onSuccess(data);
    } catch (error) {
      message.error('Upload failed');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      accept=".xlsx,.xls"
      maxCount={1}
      showUploadList={true}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        Upload Excel File
      </Button>
    </Upload>
  );
};
```

---

## 🎨 Complete Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Tag, 
  Popconfirm,
  Space,
  Statistic,
  Row,
  Col
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

const PropertiesManagement = () => {
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchSummary();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/properties');
      setProperties(data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    const { data } = await axios.get('/api/properties/summary');
    setSummary(data.data);
  };

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title',
      key: 'title',
      width: 250
    },
    { 
      title: 'Type', 
      dataIndex: 'property_type',
      key: 'property_type'
    },
    { 
      title: 'Location', 
      dataIndex: 'location',
      key: 'location'
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          available: 'green',
          prelaunch: 'blue',
          limited_inventory: 'orange'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    { 
      title: 'Units', 
      dataIndex: 'units_line',
      key: 'units_line',
      width: 300
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this property?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleEdit = (property) => {
    // Open edit modal
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/properties/${id}`);
    message.success('Property deleted');
    fetchProperties();
    fetchSummary();
  };

  return (
    <div className="properties-management">
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Properties" 
              value={summary?.total_properties || 0} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Available" 
              value={summary?.status_counts?.available || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Pre-launch" 
              value={summary?.status_counts?.prelaunch || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Limited Inventory" 
              value={summary?.status_counts?.limited_inventory || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
        >
          Add Property
        </Button>
        <Button 
          icon={<UploadOutlined />}
          onClick={() => setShowBulkModal(true)}
        >
          Bulk Upload
        </Button>
      </Space>

      {/* Properties Table */}
      <Table
        dataSource={properties}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modals */}
      <Modal
        title="Add Property"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        width={800}
      >
        <AddPropertyForm onSuccess={() => {
          setShowAddModal(false);
          fetchProperties();
          fetchSummary();
        }} />
      </Modal>

      <Modal
        title="Bulk Upload Properties"
        open={showBulkModal}
        onCancel={() => setShowBulkModal(false)}
        footer={null}
      >
        <BulkUploadProperties />
      </Modal>
    </div>
  );
};

export default PropertiesManagement;
```

---

## 🔒 Role-Based Access Control

| Action | Owner | Admin | Manager | Employee |
|--------|-------|-------|---------|----------|
| View Properties | ✅ | ✅ | ✅ | ✅ |
| Add Property | ✅ | ❌ | ❌ | ❌ |
| Edit Property | ✅ | ❌ | ❌ | ❌ |
| Delete Property | ✅ | ❌ | ❌ | ❌ |
| Bulk Upload | ✅ | ❌ | ❌ | ❌ |

---

## ⚠️ Error Handling

```javascript
try {
  await axios.post('/api/properties', propertyData);
} catch (error) {
  if (error.response?.status === 403) {
    message.error('Only owner can add properties');
  } else if (error.response?.status === 400) {
    message.error(error.response.data.error);
  } else {
    message.error('Failed to create property');
  }
}
```

---

## 📝 Notes

1. **No Local Storage**: Properties are NOT stored in CRM database. All data lives on external API.
2. **External API Session**: Backend automatically manages authentication with external API.
3. **Image URLs**: Must be publicly accessible URLs.
4. **Excel Template**: Available in external API docs.

---

## 🚀 Next Steps

1. Install dependencies: `npm install axios multer form-data`
2. Add environment variables to `.env`
3. Restart backend server
4. Start building your React dashboard!

---

**For issues, check:**
- External API status
- Environment variables configured
- JWT token valid
- User role is 'owner' for CRUD operations
