# Properties API Documentation

This document provides comprehensive documentation for the Properties API endpoints including GET, POST, and Bulk Upload operations.

---

## Table of Contents
1. [Public Properties Endpoints](#public-properties-endpoints)
2. [Admin Properties Endpoints](#admin-properties-endpoints)
3. [Bulk Properties Upload](#bulk-properties-upload)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

---
## base url :  https://property-website-748576937648.us-central1.run.app


## Public Properties Endpoints

### 1. Get All Properties (Public)

**Endpoint**: `GET /api/public/properties`

**Description**: Retrieves all properties with their associated units. Properties are sorted by title in ascending order.

**Authentication**: None required (Public endpoint)

**Request Example**:
```bash
curl -X GET http://localhost:5000/api/public/properties
```

**Response Format**:
```json
[
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
    "amenities_summary": "Swimming Pool, Gym, Clubhouse, 24/7 Security",
    "total_floors": 25,
    "listing_by": "Builder",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z",
    "units_line": "2BHK - 750 sqft - Rs. 80L | 3BHK - 1050 sqft - Rs. 1.25Cr"
  }
]
```

**Response Fields**:
- `id` (integer): Unique property identifier
- `title` (string): Property title/name
- `property_type` (string): Type of property (Apartment, Villa, Land, Township)
- `location` (string): Property location
- `image_url` (string): URL to property image
- `status` (string): Property status (available, prelaunch, limited_inventory)
- `drive_link` (string, optional): Google Drive link for additional resources
- `phone` (string, optional): Contact phone number
- `possession` (string, optional): Possession date/details
- `total_land_acres` (float, optional): Total land area in acres
- `total_towers` (string, optional): Number of towers
- `amenities_summary` (string, optional): Summary of amenities
- `total_floors` (integer, optional): Total number of floors
- `listing_by` (string, optional): Listed by (Builder, Owner, Agent)
- `created_at` (string): ISO 8601 timestamp of creation
- `updated_at` (string): ISO 8601 timestamp of last update
- `units_line` (string): Formatted string of all property units

**Status Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Server error (returns sample data as fallback)

---

### 2. Get Single Property (Public)

**Endpoint**: `GET /api/public/properties/{property_id}`

**Description**: Retrieves a single property by its ID.

**Authentication**: None required (Public endpoint)

**URL Parameters**:
- `property_id` (integer, required): The ID of the property

**Request Example**:
```bash
curl -X GET http://localhost:5000/api/public/properties/123
```

**Response Format**:
```json
{
  "id": 123,
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
  "updated_at": "2024-01-20T14:45:00Z"
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Property not found
- `500 Internal Server Error`: Server error

---

### 3. Get Properties Summary (Public)

**Endpoint**: `GET /api/public/properties/summary`

**Description**: Retrieves summary statistics including total count, status breakdown, and recent properties.

**Authentication**: None required (Public endpoint)

**Request Example**:
```bash
curl -X GET http://localhost:5000/api/public/properties/summary
```

**Response Format**:
```json
{
  "total_properties": 45,
  "status_counts": {
    "available": 30,
    "resell": 5,
    "rental": 3,
    "prelaunch": 5,
    "limited_inventory": 2
  },
  "recent_properties": [
    {
      "id": 123,
      "title": "Godrej Woodsville",
      "location": "Pune",
      "price": null,
      "status": "available",
      "image_url": "https://example.com/image.jpg",
      "updated_at": "2024-01-20T14:45:00Z",
      "total_units": 2,
      "property_type": "Apartment"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success

---

## Admin Properties Endpoints

### 4. Get All Properties (Admin)

**Endpoint**: `GET /api/admin/properties`

**Description**: Retrieves all properties for admin management.

**Authentication**: Required (Admin session)

**Request Example**:
```bash
curl -X GET http://localhost:5000/api/admin/properties \
  -H "Cookie: session=<session_cookie>"
```

**Response Format**: Same as public properties endpoint

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 5. Get Single Property (Admin)

**Endpoint**: `GET /api/admin/properties/{property_id}`

**Description**: Retrieves a single property for admin editing.

**Authentication**: Required (Admin session)

**URL Parameters**:
- `property_id` (integer, required): The ID of the property

**Request Example**:
```bash
curl -X GET http://localhost:5000/api/admin/properties/123 \
  -H "Cookie: session=<session_cookie>"
```

**Response Format**: Same as public single property endpoint

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Property not found
- `500 Internal Server Error`: Server error

---

### 6. Create Property (Admin)

**Endpoint**: `POST /api/admin/properties`

**Description**: Creates a new property.

**Authentication**: Required (Admin session)

**Request Headers**:
```
Content-Type: application/json
Cookie: session=<session_cookie>
```

**Request Body**:
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

**Required Fields**:
- `title` (string): Property title
- `property_type` (string): Property type
- `location` (string): Property location
- `image_url` (string): Image URL

**Optional Fields**:
- `status` (string): Defaults to "available"
- `drive_link` (string)
- `phone` (string)
- `possession` (string)
- `total_land_acres` (float)
- `total_towers` (string)
- `amenities_summary` (string)
- `total_floors` (integer)
- `listing_by` (string)

**Request Example**:
```bash
curl -X POST http://localhost:5000/api/admin/properties \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session_cookie>" \
  -d '{
    "title": "Luxury Villa",
    "property_type": "Villa",
    "location": "Mumbai",
    "image_url": "https://example.com/villa.jpg"
  }'
```

**Response Format**:
```json
{
  "id": 124,
  "title": "Luxury Villa",
  "property_type": "Villa",
  "location": "Mumbai",
  "image_url": "https://example.com/villa.jpg",
  "status": "available",
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Property created successfully
- `400 Bad Request`: Invalid data or missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 7. Update Property (Admin)

**Endpoint**: `PUT /api/admin/properties/{property_id}`

**Description**: Updates an existing property.

**Authentication**: Required (Admin session)

**URL Parameters**:
- `property_id` (integer, required): The ID of the property to update

**Request Headers**:
```
Content-Type: application/json
Cookie: session=<session_cookie>
```

**Request Body**: Same as Create Property (all fields optional for update)

**Request Example**:
```bash
curl -X PUT http://localhost:5000/api/admin/properties/123 \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session_cookie>" \
  -d '{
    "title": "Updated Property Name",
    "status": "prelaunch"
  }'
```

**Response Format**: Updated property object

**Status Codes**:
- `200 OK`: Property updated successfully
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 8. Delete Property (Admin)

**Endpoint**: `DELETE /api/admin/properties/{property_id}`

**Description**: Deletes a property.

**Authentication**: Required (Admin session)

**URL Parameters**:
- `property_id` (integer, required): The ID of the property to delete

**Request Example**:
```bash
curl -X DELETE http://localhost:5000/api/admin/properties/123 \
  -H "Cookie: session=<session_cookie>"
```

**Response Format**:
```json
{
  "message": "Property deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Property deleted successfully
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

## Bulk Properties Upload

### 9. Bulk Upload Properties (Admin)

**Endpoint**: `POST /api/admin/bulk-properties`

**Description**: Upload multiple properties at once using an Excel file (.xlsx or .xls).

**Authentication**: Required (Admin session)

**Request Headers**:
```
Content-Type: multipart/form-data
Cookie: session=<session_cookie>
```

**Request Body**:
- Form field name: `file`
- File type: Excel (.xlsx or .xls)

**Excel File Format**:

**Required Columns**:
- `title` - Property title/name
- `property_type` - Type (Apartment, Villa, Land, Township)
- `location` - Property location
- `image_url` - Image URL

**Optional Columns**:
- `status` - available, prelaunch, limited_inventory (defaults to 'available')
- `drive_link` - Google Drive link
- `phone` - Contact phone number
- `possession` - Possession date/details
- `total_land_acres` - Land area in acres (numeric)
- `total_towers` - Number of towers
- `amenities_summary` - Amenities description
- `total_floors` - Number of floors (numeric)
- `listing_by` - Builder, Owner, Agent, etc.
- `units` - JSON string for property units

**Units Column Format**:
```json
[{"bhk":"2BHK","size":"750 sqft","price":"80L"},{"bhk":"3BHK","size":"1050 sqft","price":"1.25Cr"}]
```

**Excel Example**:

| title | property_type | location | image_url | status | units |
|-------|--------------|----------|-----------|--------|-------|
| Godrej Woodsville | Apartment | Pune | https://example.com/img1.jpg | available | [{"bhk":"2BHK","size":"750 sqft","price":"80L"}] |
| Premium Villa | Villa | Mumbai | https://example.com/img2.jpg | prelaunch | [{"bhk":"4BHK","size":"2500 sqft","price":"3.5Cr"}] |

**Request Example (cURL)**:
```bash
curl -X POST http://localhost:5000/api/admin/bulk-properties \
  -H "Cookie: session=<session_cookie>" \
  -F "file=@properties.xlsx"
```

**Request Example (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/admin/bulk-properties', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response Format**:
```json
{
  "message": "Bulk upload completed. Created 5 properties.",
  "created_count": 5,
  "error_count": 2,
  "errors": [
    "Row 3: Failed to create property 'Invalid Property': Missing image_url",
    "Row 7: Invalid units JSON format for property 'Test Property'"
  ],
  "created_properties": [
    {
      "id": 125,
      "title": "Godrej Woodsville",
      "property_type": "Apartment",
      "location": "Pune",
      "image_url": "https://example.com/img1.jpg",
      "status": "available",
      "created_at": "2024-01-21T10:00:00Z",
      "updated_at": "2024-01-21T10:00:00Z"
    }
  ]
}
```

**Response Fields**:
- `message` (string): Summary message
- `created_count` (integer): Number of properties successfully created
- `error_count` (integer): Number of rows that failed
- `errors` (array, optional): List of error messages with row numbers
- `created_properties` (array, optional): Array of successfully created property objects

**Status Codes**:
- `200 OK`: All properties created successfully
- `207 Multi-Status`: Some properties created, some failed (partial success)
- `400 Bad Request`: Invalid file format or missing required columns
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error or missing dependencies

**Error Examples**:

Missing required columns:
```json
{
  "error": "Missing required columns: title, image_url"
}
```

Invalid file format:
```json
{
  "error": "File must be an Excel file (.xlsx or .xls)"
}
```

Empty file:
```json
{
  "error": "Excel file is empty"
}
```

---

## Data Models

### Property Model

```typescript
interface Property {
  id: number;
  title: string;
  property_type: string;
  location: string;
  image_url: string;
  status: 'available' | 'prelaunch' | 'limited_inventory';
  drive_link?: string;
  phone?: string;
  possession?: string;
  total_land_acres?: number;
  total_towers?: string;
  amenities_summary?: string;
  total_floors?: number;
  listing_by?: string;
  created_at: string;
  updated_at: string;
  units_line?: string; // Only in GET responses
}
```

### Property Unit Model

```typescript
interface PropertyUnit {
  id: number;
  property_id: number;
  bhk: string;
  size: string;
  price: string;
  created_at: string;
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `207 Multi-Status`: Partial success (used in bulk operations)
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Validation Errors

Property creation/update validation:
- Title must not be empty
- Property type must be valid
- Location must not be empty
- Image URL must be valid
- Total land acres must be numeric (if provided)
- Total floors must be integer (if provided)

---

## Authentication

Admin endpoints require session-based authentication. Users must first login via `/api/auth/login` to obtain a session cookie.

**Login Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

The session cookie will be automatically set and should be included in subsequent admin requests.

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## Dependencies

For bulk upload functionality, ensure these packages are installed:
```
pandas==2.2.3
openpyxl==3.1.5
```

Install via:
```bash
pip install pandas==2.2.3 openpyxl==3.1.5
```

---

## Sample Excel Template

A sample Excel template (`bulk_properties_template.xlsx`) is available in the project root directory with example data and proper column formatting.

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. The `units_line` field is automatically generated from property units
3. Bulk upload supports partial success - some properties may be created even if others fail
4. Property units can be added separately via the property units API endpoints
5. Image URLs should be publicly accessible
6. Phone numbers should include country code (e.g., +91 for India)

---

## Support

For issues or questions, please contact the development team or refer to the main API documentation.
