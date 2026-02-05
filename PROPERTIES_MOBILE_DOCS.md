# Properties API - Mobile App Integration
## For React Native / Android Developers

**Last Updated:** February 5, 2026

---

## 📚 Overview

Properties module allows mobile users (**Admin, Manager, Employee**) to:
- ✅ **View all properties** (read-only)
- ✅ **View property details**
- ✅ **Share property with leads via WhatsApp**

**Base URL:** `https://property-website-748576937648.us-central1.run.app`

**Authentication:** JWT token (from CRM login)

---

## 🔐 Authentication

Same as other CRM endpoints:

```javascript
// Login
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '9876543210',
    password: 'password123'
  })
});

const { data } = await response.json();
const token = data.token;

// Store token
await AsyncStorage.setItem('authToken', token);

// Use in all requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📋 API Endpoints

### 1. Get All Properties

**Endpoint:** `GET /api/properties`

**Access:** All authenticated users

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
      "possession": "Ready to Move",
      "total_land_acres": 5.25,
      "total_towers": "8 Towers",
      "amenities_summary": "Swimming Pool, Gym, Clubhouse, 24/7 Security",
      "total_floors": 25,
      "listing_by": "Builder",
      "phone": "+91 9876543210",
      "drive_link": "https://drive.google.com/...",
      "units_line": "2BHK - 750 sqft - Rs. 80L | 3BHK - 1050 sqft - Rs. 1.25Cr",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z"
    }
  ]
}
```

**React Native Example:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PropertiesScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setProperties(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch properties');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProperty = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.propertyImage} />
      
      <View style={styles.propertyInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.type}>🏗️ {item.property_type}</Text>
        
        {item.units_line && (
          <Text style={styles.units} numberOfLines={2}>
            {item.units_line}
          </Text>
        )}
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchProperties}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  propertyInfo: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  units: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PropertiesScreen;
```

---

### 2. Get Single Property

**Endpoint:** `GET /api/properties/:id`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Godrej Woodsville",
    "property_type": "Apartment",
    "location": "Hinjewadi Phase 2, Pune",
    "image_url": "https://example.com/image.jpg",
    "status": "available",
    "possession": "Ready to Move",
    "total_land_acres": 5.25,
    "total_towers": "8 Towers",
    "amenities_summary": "Swimming Pool, Gym, Clubhouse",
    "total_floors": 25,
    "listing_by": "Builder",
    "phone": "+91 9876543210",
    "drive_link": "https://drive.google.com/...",
    "units_line": "2BHK - 750 sqft - Rs. 80L | 3BHK - 1050 sqft - Rs. 1.25Cr"
  }
}
```

**React Native Details Screen:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PropertyDetailsScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
  }, []);

  const fetchPropertyDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setProperty(result.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openDriveLink = () => {
    if (property?.drive_link) {
      Linking.openURL(property.drive_link);
    }
  };

  const callProperty = () => {
    if (property?.phone) {
      Linking.openURL(`tel:${property.phone}`);
    }
  };

  if (loading || !property) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: property.image_url }} style={styles.headerImage} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>
        
        <View style={styles.infoRow}>
          <Icon name="location-on" size={20} color="#666" />
          <Text style={styles.infoText}>{property.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="apartment" size={20} color="#666" />
          <Text style={styles.infoText}>{property.property_type}</Text>
        </View>

        {property.possession && (
          <View style={styles.infoRow}>
            <Icon name="event" size={20} color="#666" />
            <Text style={styles.infoText}>Possession: {property.possession}</Text>
          </View>
        )}

        {property.units_line && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Units</Text>
            <Text style={styles.unitsText}>{property.units_line}</Text>
          </View>
        )}

        {property.amenities_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <Text style={styles.amenitiesText}>{property.amenities_summary}</Text>
          </View>
        )}

        {property.total_land_acres && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Land Area:</Text>
            <Text style={styles.statValue}>{property.total_land_acres} Acres</Text>
          </View>
        )}

        {property.total_towers && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Towers:</Text>
            <Text style={styles.statValue}>{property.total_towers}</Text>
          </View>
        )}

        {property.total_floors && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Floors:</Text>
            <Text style={styles.statValue}>{property.total_floors}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {property.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={callProperty}>
              <Icon name="phone" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {property.drive_link && (
            <TouchableOpacity style={styles.actionButton} onPress={openDriveLink}>
              <Icon name="folder" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Documents</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]} 
            onPress={() => navigation.navigate('ShareProperty', { property })}
          >
            <Icon name="share" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Share with Lead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
```

---

### 3. Share Property via WhatsApp ⭐

**Endpoint:** `POST /api/properties/:id/share`

**Access:** All authenticated users

**Request Body (Option 1 - Using Lead ID):**
```json
{
  "leadId": "lead-uuid-here"
}
```

**Request Body (Option 2 - Direct Phone Number):**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp share link generated",
  "data": {
    "whatsappLink": "https://wa.me/919876543210?text=...",
    "property": { ... },
    "message": "🏠 *Godrej Woodsville*\n\n📍 Location: Pune\n..."
  }
}
```

**React Native Share Screen:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet
} from 'react-native';

const SharePropertyScreen = ({ route }) => {
  const { property } = route.params;
  const [leads, setLeads] = useState([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setLeads(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch leads');
    }
  };

  const shareWithLead = async (lead) => {
    setSharing(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/properties/${property.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadId: lead.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Open WhatsApp with pre-filled message
        Linking.openURL(result.data.whatsappLink);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate share link');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSharing(false);
    }
  };

  const shareWithCustomNumber = async () => {
    Alert.prompt(
      'Enter Phone Number',
      'Enter the phone number to share this property',
      async (phoneNumber) => {
        if (!phoneNumber) return;

        try {
          const token = await AsyncStorage.getItem('authToken');
          
          const response = await fetch(`${API_URL}/api/properties/${property.id}/share`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber })
          });

          const result = await response.json();
          
          if (result.success) {
            Linking.openURL(result.data.whatsappLink);
          }
        } catch (error) {
          Alert.alert('Error', error.message);
        }
      }
    );
  };

  const renderLead = ({ item }) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => shareWithLead(item)}
      disabled={sharing}
    >
      <View style={styles.leadInfo}>
        <Text style={styles.leadName}>{item.name}</Text>
        <Text style={styles.leadPhone}>{item.phone}</Text>
        {item.status && (
          <Text style={styles.leadStatus}>Status: {item.status}</Text>
        )}
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.propertyPreview}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyLocation}>{property.location}</Text>
      </View>

      <TouchableOpacity 
        style={styles.customNumberButton}
        onPress={shareWithCustomNumber}
      >
        <Icon name="phone" size={20} color="#fff" />
        <Text style={styles.customNumberText}>Share with Custom Number</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Or Select a Lead:</Text>

      <FlatList
        data={leads}
        renderItem={renderLead}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.leadsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  propertyPreview: {
    backgroundColor: '#007AFF',
    padding: 20,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  customNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    gap: 8,
  },
  customNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  leadsList: {
    padding: 15,
  },
  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 14,
    color: '#666',
  },
  leadStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default SharePropertyScreen;
```

---

## 📱 Complete Navigation Setup

```javascript
// In your navigation stack
import { createStackNavigator } from '@react-navigation/stack';
import PropertiesScreen from './screens/PropertiesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import SharePropertyScreen from './screens/SharePropertyScreen';

const Stack = createStackNavigator();

const PropertiesNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Properties" 
      component={PropertiesScreen}
      options={{ title: 'Properties' }}
    />
    <Stack.Screen 
      name="PropertyDetails" 
      component={PropertyDetailsScreen}
      options={{ title: 'Property Details' }}
    />
    <Stack.Screen 
      name="ShareProperty" 
      component={SharePropertyScreen}
      options={{ title: 'Share Property' }}
    />
  </Stack.Navigator>
);
```

---

## 🎨 WhatsApp Message Format

When you share a property, the WhatsApp message will be:

```
🏠 *Godrej Woodsville Premium Apartments*

📍 Location: Hinjewadi Phase 2, Pune
🏗️ Type: Apartment
🗓️ Possession: Ready to Move
🛏️ 2BHK - 750 sqft - Rs. 80L | 3BHK - 1050 sqft - Rs. 1.25Cr

📱 View full details: https://property-website.com/properties/123

Contact us for site visit!
```

---

## 🔒 Role Access

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| View Properties | ✅ | ✅ | ✅ |
| View Details | ✅ | ✅ | ✅ |
| Share via WhatsApp | ✅ | ✅ | ✅ |
| Add/Edit/Delete | ❌ | ❌ | ❌ |

*Only Owner can add/edit/delete properties via web dashboard*

---

## ⚠️ Error Handling

```javascript
const shareProperty = async (propertyId, leadId) => {
  try {
    const response = await fetch(`${API_URL}/api/properties/${propertyId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leadId })
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        Alert.alert('Error', 'Property or Lead not found');
      } else if (response.status === 400) {
        Alert.alert('Error', result.error || 'Invalid request');
      } else {
        Alert.alert('Error', 'Failed to share property');
      }
      return;
    }

    if (result.success) {
      Linking.openURL(result.data.whatsappLink);
    }
  } catch (error) {
    Alert.alert('Network Error', error.message);
  }
};
```

---

## 📝 Notes

1. **WhatsApp Requirement**: User must have WhatsApp installed for sharing to work
2. **Phone Format**: API accepts any format (9876543210, +919876543210) - automatically formats
3. **Internet Required**: Properties are fetched from external API in real-time
4. **No Local Storage**: Properties are not cached locally (always fresh data)

---

## 🚀 Quick Start Checklist

- [ ] Add `AsyncStorage` for token storage
- [ ] Install `react-native-vector-icons` for icons
- [ ] Update API_URL in config
- [ ] Test login and token storage
- [ ] Test properties list
- [ ] Test property details
- [ ] Test WhatsApp share with lead
- [ ] Test custom number share

---

## 🛠️ Dependencies

```bash
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
```

---

**Happy Coding! 🎉**
