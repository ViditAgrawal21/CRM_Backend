import { config } from '../../config/index.js';
import { parse } from 'csv-parse/sync';

// This module acts as a PROXY to external property API
// NO database storage for properties

export const fetchProperties = async (filters = {}) => {
  // Call external API
  const queryParams = new URLSearchParams(filters);
  const url = `${config.properties.apiUrl}/properties?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.properties.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`External API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const createProperty = async (propertyData, userRole) => {
  // Only owner can add properties
  if (userRole !== 'owner') {
    throw new Error('Only owner can add properties');
  }

  // Send to external API
  const response = await fetch(`${config.properties.apiUrl}/properties`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.properties.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(propertyData)
  });

  if (!response.ok) {
    throw new Error(`External API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const bulkCreateProperties = async (csvContent, userRole) => {
  // Only owner can bulk upload properties
  if (userRole !== 'owner') {
    throw new Error('Only owner can bulk upload properties');
  }

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const results = [];

  for (const record of records) {
    try {
      const propertyData = {
        projectName: record['Project Name'],
        builders: record.Builders,
        location: record.Location,
        configuration: record.Configuration,
        price: record.Price,
        possession: record.Possession,
        link: record.Link || '',
        contactUs: record['Contact Us']
      };

      const response = await fetch(`${config.properties.apiUrl}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.properties.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });

      if (response.ok) {
        const data = await response.json();
        results.push({ success: true, data });
      } else {
        results.push({ success: false, error: response.statusText, record });
      }
    } catch (error) {
      results.push({ success: false, error: error.message, record });
    }
  }

  return results;
};
