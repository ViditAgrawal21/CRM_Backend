import axios from 'axios';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'https://property-website-748576937648.us-central1.run.app';
const EXTERNAL_API_EMAIL = process.env.EXTERNAL_API_EMAIL;
const EXTERNAL_API_PASSWORD = process.env.EXTERNAL_API_PASSWORD;

// Store external session (in-memory - can move to Redis for production)
let externalSession = null;
let sessionExpiry = null;

// Login to external API
export const loginToExternalAPI = async () => {
  try {
    const response = await axios.post(`${EXTERNAL_API_BASE_URL}/api/auth/login`, {
      email: EXTERNAL_API_EMAIL,
      password: EXTERNAL_API_PASSWORD
    });

    // Extract session cookie from response headers
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      externalSession = cookies[0].split(';')[0]; // Get session part only
      sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      console.log('✅ Logged into external Properties API');
      return true;
    }

    throw new Error('No session cookie received from external API');
  } catch (error) {
    console.error('❌ Failed to login to external API:', error.message);
    throw new Error('External API authentication failed');
  }
};

// Ensure valid session
const ensureAuthenticated = async () => {
  // Check if session exists and not expired
  if (!externalSession || !sessionExpiry || Date.now() > sessionExpiry) {
    await loginToExternalAPI();
  }
};

// Get all properties (public endpoint - no auth needed)
export const getAllProperties = async () => {
  try {
    const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/public/properties`);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    throw new Error('Failed to fetch properties from external API');
  }
};

// Get single property by ID (public endpoint)
export const getPropertyById = async (propertyId) => {
  try {
    const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/public/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Property not found');
    }
    console.error('Error fetching property:', error.message);
    throw new Error('Failed to fetch property details');
  }
};

// Get properties summary (public endpoint)
export const getPropertiesSummary = async () => {
  try {
    const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/public/properties/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties summary:', error.message);
    throw new Error('Failed to fetch properties summary');
  }
};

// Create property (admin only - requires auth)
export const createProperty = async (propertyData) => {
  await ensureAuthenticated();

  try {
    const response = await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/admin/properties`,
      propertyData,
      {
        headers: {
          'Cookie': externalSession,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid property data');
    }
    throw new Error('Failed to create property');
  }
};

// Update property (admin only - requires auth)
export const updateProperty = async (propertyId, updateData) => {
  await ensureAuthenticated();

  try {
    const response = await axios.put(
      `${EXTERNAL_API_BASE_URL}/api/admin/properties/${propertyId}`,
      updateData,
      {
        headers: {
          'Cookie': externalSession,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid property data');
    }
    throw new Error('Failed to update property');
  }
};

// Delete property (admin only - requires auth)
export const deleteProperty = async (propertyId) => {
  await ensureAuthenticated();

  try {
    const response = await axios.delete(
      `${EXTERNAL_API_BASE_URL}/api/admin/properties/${propertyId}`,
      {
        headers: {
          'Cookie': externalSession
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error.message);
    throw new Error('Failed to delete property');
  }
};

// Bulk upload properties (admin only - requires auth)
export const bulkUploadProperties = async (fileBuffer, filename) => {
  await ensureAuthenticated();

  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);

    const response = await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/admin/bulk-properties`,
      formData,
      {
        headers: {
          'Cookie': externalSession,
          ...formData.getHeaders()
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk uploading properties:', error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid file format');
    }
    throw new Error('Failed to bulk upload properties');
  }
};

// Generate WhatsApp share link
export const generateWhatsAppShareLink = async (propertyId, leadPhone) => {
  try {
    // Fetch property details
    const property = await getPropertyById(propertyId);

    // Clean phone number (remove +, spaces, dashes)
    const cleanPhone = leadPhone.replace(/[\s\-\+]/g, '');
    
    // Add country code if not present (assuming India +91)
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    // Create property URL (assuming external API has a public view)
    const propertyUrl = `${EXTERNAL_API_BASE_URL}/properties/${propertyId}`;

    // Format WhatsApp message
    const message = encodeURIComponent(
      `🏠 *${property.title}*\n\n` +
      `📍 Location: ${property.location}\n` +
      `🏗️ Type: ${property.property_type}\n` +
      `${property.possession ? `🗓️ Possession: ${property.possession}\n` : ''}` +
      `${property.units_line ? `🛏️ ${property.units_line}\n` : ''}` +
      `\n📱 View full details: ${propertyUrl}\n\n` +
      `Contact us for site visit!`
    );

    // Generate WhatsApp Web link
    const whatsappLink = `https://wa.me/${fullPhone}?text=${message}`;

    return {
      whatsappLink,
      property,
      message: decodeURIComponent(message)
    };
  } catch (error) {
    console.error('Error generating WhatsApp link:', error.message);
    throw new Error('Failed to generate WhatsApp share link');
  }
};

// Legacy function for backward compatibility
export const fetchProperties = async () => {
  return await getAllProperties();
};

// Legacy function for backward compatibility
export const bulkCreateProperties = async (csvContent, userRole) => {
  if (userRole !== 'owner') {
    throw new Error('Only owner can bulk upload properties');
  }
  throw new Error('Please use Excel upload instead of CSV. Use POST /properties/bulk with multipart/form-data');

};
