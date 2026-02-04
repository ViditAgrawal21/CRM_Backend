# Lead vs Data - Android Developer Guide

## Overview

Both **Leads** and **Data** are stored in the same table but differentiated by the `type` field:

- **`type: 'lead'`** → Genuine leads from website (high quality, warm leads)
- **`type: 'data'`** → Leads from local market (cold leads, lower quality)

---

## Database Structure

```sql
-- In leads table
type VARCHAR(10) NOT NULL CHECK (type IN ('lead', 'data'))
```

**Example Records:**

```json
// Website Lead (Genuine)
{
  "id": "uuid-1",
  "type": "lead",
  "name": "John Doe",
  "phone": "9876543210",
  "status": "interested",
  "is_uploaded_record": false,
  "created_at": "2025-02-04T10:00:00Z"
}

// Local Market Data (Cold)
{
  "id": "uuid-2",
  "type": "data",
  "name": "Jane Smith",
  "phone": "9876543211",
  "status": "new",
  "is_uploaded_record": true,
  "uploaded_by": "admin-uuid",
  "created_at": "2025-02-04T11:00:00Z"
}
```

---

## API Usage - Filter by Type

### Get All Leads (Mixed)
```
GET /api/leads
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "lead", "name": "John", ... },
    { "type": "data", "name": "Jane", ... }
  ]
}
```

---

### Get Only Website Leads (Genuine)
```
GET /api/leads?type=lead
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "lead", "name": "John", "status": "interested", ... }
  ]
}
```

---

### Get Only Market Data (Cold Leads)
```
GET /api/leads?type=data
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "data", "name": "Jane", "status": "new", ... }
  ]
}
```

---

### Filter by Both Type and Status
```
GET /api/leads?type=lead&status=interested
GET /api/leads?type=data&status=contacted
```

---

## React Native Implementation

### 1. Separate Tabs for Leads and Data

```javascript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const LeadsScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="WebsiteLeads" 
        component={WebsiteLeadsTab}
        options={{ tabBarLabel: 'Website Leads' }}
      />
      <Tab.Screen 
        name="MarketData" 
        component={MarketDataTab}
        options={{ tabBarLabel: 'Market Data' }}
      />
    </Tab.Navigator>
  );
};
```

### 2. Fetch Website Leads

```javascript
const WebsiteLeadsTab = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsiteLeads();
  }, []);

  const fetchWebsiteLeads = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/leads?type=lead`, // Filter by type=lead
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setLeads(result.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      data={leads}
      renderItem={({ item }) => (
        <LeadCard 
          lead={item} 
          badge="Website"
          badgeColor="#4CAF50" // Green for genuine leads
        />
      )}
    />
  );
};
```

### 3. Fetch Market Data

```javascript
const MarketDataTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/leads?type=data`, // Filter by type=data
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <LeadCard 
          lead={item} 
          badge="Market"
          badgeColor="#FF9800" // Orange for cold leads
        />
      )}
    />
  );
};
```

---

## UI Differentiation - Visual Design

### Lead Card Component with Type Badge

```javascript
const LeadCard = ({ lead, badge, badgeColor }) => {
  return (
    <View style={styles.card}>
      {/* Type Badge */}
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>

      {/* Lead Info */}
      <View style={styles.content}>
        <Text style={styles.name}>{lead.name}</Text>
        <Text style={styles.phone}>{lead.phone}</Text>
        <Text style={styles.status}>{lead.status}</Text>
        
        {/* Show upload info for market data */}
        {lead.type === 'data' && lead.is_uploaded_record && (
          <Text style={styles.uploadInfo}>
            📤 Bulk Uploaded
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  uploadInfo: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
  }
});
```

---

## Creating Leads vs Data

### Create Website Lead
```javascript
const createWebsiteLead = async (leadData) => {
  const response = await fetch(`${API_URL}/api/leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'lead', // Website lead
      name: leadData.name,
      phone: leadData.phone,
      date: leadData.date,
      configuration: leadData.configuration,
      remark: leadData.remark
    })
  });
  
  const result = await response.json();
  return result;
};
```

### Bulk Upload Market Data
```javascript
const uploadMarketData = async (records) => {
  const response = await fetch(`${API_URL}/api/leads/bulk/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'data', // Market data
      date: new Date().toISOString().split('T')[0],
      records: records // Array of contacts from local market
    })
  });
  
  const result = await response.json();
  return result;
};
```

---

## Visual Comparison - UI Layout

```
┌─────────────────────────────────────┐
│  Leads         Market Data          │  ← Tabs
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────┐ Website  │
│  │ John Doe             │ ────────┐│
│  │ 9876543210           │         ││ Green badge
│  │ Status: Interested   │ ────────┘│
│  └──────────────────────┘          │
│                                     │
│  ┌──────────────────────┐ Market   │
│  │ Jane Smith           │ ────────┐│
│  │ 9876543211           │         ││ Orange badge
│  │ Status: New          │ ────────┘│
│  │ 📤 Bulk Uploaded     │          │
│  └──────────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

---

## Key Differences Summary

| Feature | Website Leads (`lead`) | Market Data (`data`) |
|---------|------------------------|----------------------|
| Source | Website forms | Local market collection |
| Quality | High (warm leads) | Lower (cold calls) |
| Badge Color | 🟢 Green | 🟠 Orange |
| Upload Method | Manual single entry | Bulk CSV upload |
| `is_uploaded_record` | Usually `false` | Usually `true` |
| Priority | Higher | Lower |
| API Filter | `?type=lead` | `?type=data` |

---

## Complete Example - Home Screen with Both Types

```javascript
const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lead', 'data'
  const [leads, setLeads] = useState([]);

  const fetchLeads = async (type = null) => {
    const url = type 
      ? `${API_URL}/api/leads?type=${type}`
      : `${API_URL}/api/leads`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await response.json();
    if (result.success) setLeads(result.data);
  };

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterButtons}>
        <TouchableOpacity 
          onPress={() => {
            setActiveTab('all');
            fetchLeads();
          }}
          style={[styles.filterBtn, activeTab === 'all' && styles.activeBtn]}
        >
          <Text>All</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setActiveTab('lead');
            fetchLeads('lead');
          }}
          style={[styles.filterBtn, activeTab === 'lead' && styles.activeBtn]}
        >
          <Text>Website Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setActiveTab('data');
            fetchLeads('data');
          }}
          style={[styles.filterBtn, activeTab === 'data' && styles.activeBtn]}
        >
          <Text>Market Data</Text>
        </TouchableOpacity>
      </View>

      {/* Leads List */}
      <FlatList
        data={leads}
        renderItem={({ item }) => (
          <LeadCard 
            lead={item}
            badge={item.type === 'lead' ? 'Website' : 'Market'}
            badgeColor={item.type === 'lead' ? '#4CAF50' : '#FF9800'}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};
```

---

## Testing

1. **Create a website lead** with `type: 'lead'`
2. **Upload market data** with `type: 'data'`
3. **Fetch all**: `GET /api/leads` → Both types returned
4. **Fetch leads only**: `GET /api/leads?type=lead` → Only website leads
5. **Fetch data only**: `GET /api/leads?type=data` → Only market data
6. **Check UI**: Verify different badges and colors display correctly
