# Soft Delete API - Android Developer Guide

## Overview
The soft delete feature allows users to "trash" leads instead of permanently deleting them. Only admins can view, restore, or permanently delete trashed leads.

## User Flow

### For Manager/Employee:
1. Delete lead → Lead moves to trash (hidden from main list)
2. Cannot see deleted leads
3. Cannot restore or permanently delete

### For Admin:
1. Delete lead → Lead moves to trash
2. View all deleted leads in separate "Trash" section
3. Restore lead → Lead returns to main list
4. Permanently delete → Lead is completely removed from database

---

## API Endpoints

### 1. Soft Delete Lead (Move to Trash)
**All authenticated users can delete their own leads or assigned leads**

```
DELETE /api/leads/:id/soft
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead moved to trash",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9876543210",
    "is_deleted": true,
    "deleted_by": "admin-uuid",
    "deleted_at": "2025-02-05T10:30:00.000Z",
    ...
  }
}
```

**React Native Example:**
```javascript
const softDeleteLead = async (leadId) => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${leadId}/soft`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Remove lead from UI list
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      Alert.alert('Success', 'Lead moved to trash');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**UI Implementation:**
```javascript
// In lead list item
<TouchableOpacity 
  onPress={() => {
    Alert.alert(
      'Delete Lead',
      'Move this lead to trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => softDeleteLead(lead.id)
        }
      ]
    );
  }}
>
  <Icon name="trash" size={20} color="red" />
</TouchableOpacity>
```

---

### 2. Get Deleted Leads (Admin Only)
**Only admins can view trashed leads**

```
GET /api/leads/deleted
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "9876543210",
      "type": "lead",
      "status": "interested",
      "is_deleted": true,
      "deleted_by": "admin-uuid",
      "deleted_at": "2025-02-05T10:30:00.000Z",
      "assigned_to_user": {
        "id": "uuid",
        "name": "Manager Name",
        "phone": "9999999999"
      },
      "deleted_by_user": {
        "id": "uuid",
        "name": "Admin Name",
        "phone": "8888888888"
      },
      ...
    }
  ]
}
```

**React Native Example:**
```javascript
const getDeletedLeads = async () => {
  try {
    const response = await fetch(`${API_URL}/api/leads/deleted`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      setDeletedLeads(result.data);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**UI Screen - Trash View (Admin Only):**
```javascript
const TrashScreen = () => {
  const [deletedLeads, setDeletedLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

  const fetchDeletedLeads = async () => {
    setLoading(true);
    await getDeletedLeads();
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trash</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={deletedLeads}
          renderItem={({ item }) => (
            <DeletedLeadItem 
              lead={item}
              onRestore={() => restoreLead(item.id)}
              onPermanentDelete={() => permanentDeleteLead(item.id)}
            />
          )}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};
```

---

### 3. Restore Lead (Admin Only)
**Only admins can restore trashed leads**

```
PATCH /api/leads/:id/restore
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead restored successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9876543210",
    "is_deleted": false,
    "deleted_by": null,
    "deleted_at": null,
    ...
  }
}
```

**React Native Example:**
```javascript
const restoreLead = async (leadId) => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${leadId}/restore`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Remove from trash list
      setDeletedLeads(prev => prev.filter(lead => lead.id !== leadId));
      Alert.alert('Success', 'Lead restored successfully');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**UI Implementation:**
```javascript
// In deleted lead item
<View style={styles.actions}>
  <TouchableOpacity 
    onPress={() => {
      Alert.alert(
        'Restore Lead',
        'Move this lead back to active leads?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore', 
            onPress: () => restoreLead(lead.id)
          }
        ]
      );
    }}
    style={styles.restoreButton}
  >
    <Icon name="undo" size={18} color="green" />
    <Text style={styles.restoreText}>Restore</Text>
  </TouchableOpacity>
</View>
```

---

### 4. Permanently Delete Lead (Admin Only)
**Only admins can permanently delete trashed leads**

```
DELETE /api/leads/:id/permanent
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead permanently deleted",
  "data": {
    "success": true,
    "message": "Lead permanently deleted"
  }
}
```

**React Native Example:**
```javascript
const permanentDeleteLead = async (leadId) => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${leadId}/permanent`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Remove from trash list
      setDeletedLeads(prev => prev.filter(lead => lead.id !== leadId));
      Alert.alert('Success', 'Lead permanently deleted');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**UI Implementation:**
```javascript
// In deleted lead item
<TouchableOpacity 
  onPress={() => {
    Alert.alert(
      'Permanent Delete',
      'This will permanently delete the lead. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive',
          onPress: () => permanentDeleteLead(lead.id)
        }
      ]
    );
  }}
  style={styles.deleteButton}
>
  <Icon name="trash" size={18} color="red" />
  <Text style={styles.deleteText}>Delete Forever</Text>
</TouchableOpacity>
```

---

## Complete UI Component Example

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeletedLeadItem = ({ lead, onRestore, onPermanentDelete }) => {
  return (
    <View style={styles.card}>
      {/* Lead Info */}
      <View style={styles.header}>
        <Text style={styles.name}>{lead.name}</Text>
        <Text style={styles.phone}>{lead.phone}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>Type: <Text style={styles.value}>{lead.type}</Text></Text>
        <Text style={styles.label}>Status: <Text style={styles.value}>{lead.status}</Text></Text>
        <Text style={styles.label}>Deleted By: <Text style={styles.value}>{lead.deleted_by_user?.name}</Text></Text>
        <Text style={styles.label}>Deleted At: <Text style={styles.value}>
          {new Date(lead.deleted_at).toLocaleString()}
        </Text></Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onRestore}
          style={[styles.button, styles.restoreButton]}
        >
          <Icon name="restore" size={18} color="#fff" />
          <Text style={styles.buttonText}>Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onPermanentDelete}
          style={[styles.button, styles.deleteButton]}
        >
          <Icon name="delete-forever" size={18} color="#fff" />
          <Text style={styles.buttonText}>Delete Forever</Text>
        </TouchableOpacity>
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
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  details: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  value: {
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    gap: 6,
  },
  restoreButton: {
    backgroundColor: '#51cf66',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeletedLeadItem;
```

---

## Navigation Setup

```javascript
// Add Trash screen to admin navigation
import TrashScreen from './screens/TrashScreen';

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Leads" component={LeadsScreen} />
    <Stack.Screen name="Trash" component={TrashScreen} 
      options={{
        headerTitle: 'Deleted Leads',
        headerStyle: { backgroundColor: '#ff6b6b' },
        headerTintColor: '#fff'
      }}
    />
  </Stack.Navigator>
);

// Add trash button in header (Admin only)
const LeadsScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (['owner', 'admin'].includes(user.role)) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Trash')}
            style={{ marginRight: 15 }}
          >
            <Icon name="delete" size={24} color="#333" />
          </TouchableOpacity>
        )
      });
    }
  }, []);

  // ... rest of component
};
```

---

## Permission Matrix

| Action | Owner | Admin | Manager | Employee |
|--------|-------|-------|---------|----------|
| Soft Delete Own Lead | ✅ | ✅ | ✅ | ✅ |
| Soft Delete Team Lead | ✅ | ✅ | ❌ | ❌ |
| View Deleted Leads | ✅ All | ✅ Own | ❌ | ❌ |
| Restore Lead | ✅ All | ✅ Own | ❌ | ❌ |
| Permanent Delete | ✅ All | ✅ Own | ❌ | ❌ |

---

## Error Handling

```javascript
const handleLeadAction = async (action, leadId) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/leads/${leadId}/${action}`, {
      method: action === 'restore' ? 'PATCH' : 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }

    if (result.success) {
      // Update UI based on action
      if (action === 'soft') {
        setLeads(prev => prev.filter(l => l.id !== leadId));
      } else if (action === 'restore' || action === 'permanent') {
        setDeletedLeads(prev => prev.filter(l => l.id !== leadId));
      }
      Alert.alert('Success', result.message);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Checklist

- [ ] Manager can soft delete assigned lead
- [ ] Employee can soft delete assigned lead
- [ ] Soft deleted lead disappears from main list
- [ ] Admin can see trash screen
- [ ] Admin can view all deleted leads (own created)
- [ ] Owner can view all deleted leads (entire team)
- [ ] Admin can restore deleted lead
- [ ] Restored lead appears in main list
- [ ] Admin can permanently delete lead
- [ ] Permanently deleted lead is removed from database
- [ ] Manager/Employee cannot access trash endpoints
- [ ] Proper error messages for unauthorized access

---

## Database Migration (Supabase)

Run these queries in Supabase SQL Editor:

```sql
-- Add soft delete columns
ALTER TABLE leads 
ADD COLUMN is_deleted BOOLEAN DEFAULT false,
ADD COLUMN deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX idx_leads_deleted_by ON leads(deleted_by);
```

---

## Notes

1. **Soft delete vs Hard delete**: Soft delete marks records as deleted but keeps them in database. Hard (permanent) delete removes records completely.

2. **Two-step deletion**: Users first soft delete (trash), then admins can permanently delete. This prevents accidental data loss.

3. **Filtered queries**: Main lead list now filters out `is_deleted: true` records automatically.

4. **Admin privileges**: Only owner/admin can see, restore, or permanently delete trashed leads.

5. **Audit trail**: `deleted_by` and `deleted_at` fields track who deleted and when.
