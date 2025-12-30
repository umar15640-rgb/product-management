# External API Postman Testing Documentation

## Overview
This document provides comprehensive instructions for testing the External API endpoints using Postman. The external API is designed for botflow integration where customer details and warranty/claim registration data are collected and passed to the system.

## Key Features

- **Simplified API**: Only pass serial number and customer data - system handles the rest
- **Automatic Store Detection**: Store ID is automatically found from product serial number
- **Automatic Customer Creation**: Customers are created if they don't exist
- **Automatic Date Calculation**: Warranty dates are automatically calculated
- **Automatic PDF Generation**: Warranty PDF is automatically generated after registration

## Prerequisites

1. **API Key Generation** (for GET endpoints only):
   - Login to the system
   - Navigate to Settings > API Keys
   - Click "Generate API Key"
   - Copy the generated API key (shown only once)
   - Note: API key is only required for GET endpoints (list/query operations)

2. **Base URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

3. **Authentication**:
   - **POST endpoints** (warranty/claim registration): No API key required - store is found from serial number
   - **GET endpoints** (list/query): API key required in header
   - Use either:
     - `X-API-Key: {your_api_key}`
     - `Authorization: Bearer {your_api_key}`

## API Endpoints

### 1. Register Warranty

**Endpoint**: `POST /api/external/warranties`

**Description**: Register a warranty for a product. System automatically:
- Finds the store from product serial number
- Creates customer if doesn't exist
- Calculates warranty start (current date) and end dates
- Generates QR code
- Generates warranty PDF

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "product_serial_number": "PRD-IPH-123456",
  "customer_name": "John Doe",
  "customer_phone": "+919876543210",
  "customer_email": "john@example.com",
  "customer_address": "123 Main St, City, State 12345"
}
```

**Required Fields**:
- `product_serial_number` (string): Serial number of the product
- `customer_name` (string): Customer's full name
- `customer_phone` (string): Customer's phone number (with country code)

**Optional Fields**:
- `customer_email` (string): Customer's email address
- `customer_address` (string): Customer's address

**Success Response** (201 Created):
```json
{
  "warranty": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "product_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "customer_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "store_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "warranty_start": "2024-01-15T00:00:00.000Z",
    "warranty_end": "2025-01-15T00:00:00.000Z",
    "status": "active",
    "qr_code_url": "/uploads/qr/qr-PRD-IPH-123456-1234567890.png",
    "warranty_pdf_url": "/uploads/warranties/warranty-PRD-IPH-123456-1234567890.pdf"
  },
  "message": "Warranty registered successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error or warranty already exists
- `404 Not Found`: Product not found

---

### 2. Register Claim

**Endpoint**: `POST /api/external/claims`

**Description**: Register a warranty claim. System automatically:
- Finds the store from product serial number
- Finds the warranty for the product
- Creates claim and updates warranty status

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "product_serial_number": "PRD-IPH-123456",
  "claim_type": "repair",
  "description": "Screen is cracked and not responding to touch. Device was dropped.",
  "attachments": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Required Fields**:
- `product_serial_number` (string): Serial number of the product
- `claim_type` (string): One of "repair", "replacement", "refund"
- `description` (string): Claim description (minimum 10 characters)

**Optional Fields**:
- `attachments` (array of strings): URLs to attachment files

**Success Response** (201 Created):
```json
{
  "claim": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "warranty_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "store_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "claim_type": "repair",
    "description": "Screen is cracked and not responding to touch.",
    "status": "pending",
    "attachments": ["https://example.com/image1.jpg"],
    "timeline_events": [
      {
        "timestamp": "2024-01-20T10:30:00.000Z",
        "action": "Claim created via external API"
      }
    ]
  },
  "message": "Claim registered successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error, warranty not active, or warranty not found
- `404 Not Found`: Product or warranty not found

---

### 3. Get Warranty by Serial Number

**Endpoint**: `GET /api/external/warranties/{serial}`

**Description**: Retrieve warranty information for a product by serial number. No API key required.

**Headers**: None required

**URL Parameters**:
- `serial` (path parameter): Product serial number

**Example Request**:
```
GET /api/external/warranties/PRD-IPH-123456
```

**Success Response** (200 OK):
```json
{
  "warranty": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "product_id": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "product_model": "iPhone 15 Pro",
      "brand": "Apple",
      "category": "Electronics",
      "serial_number": "PRD-IPH-123456"
    },
    "customer_id": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "customer_name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com"
    },
    "warranty_start": "2024-01-15T00:00:00.000Z",
    "warranty_end": "2025-01-15T00:00:00.000Z",
    "status": "active",
    "qr_code_url": "/uploads/qr/qr-PRD-IPH-123456-1234567890.png",
    "warranty_pdf_url": "/uploads/warranties/warranty-PRD-IPH-123456-1234567890.pdf"
  }
}
```

**Error Responses**:
- `404 Not Found`: Product or warranty not found

---

### 4. List Warranties (API Key Required)

**Endpoint**: `GET /api/external/warranties`

**Description**: List all warranties for the store (with optional filtering). Requires API key.

**Headers**:
```
X-API-Key: {your_api_key}
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page
- `serial_number` (optional): Filter by product serial number

**Example Request**:
```
GET /api/external/warranties?page=1&limit=20&serial_number=PRD-IPH-123456
```

**Success Response** (200 OK):
```json
{
  "warranties": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "product_id": {
        "product_model": "iPhone 15 Pro",
        "brand": "Apple",
        "category": "Electronics",
        "serial_number": "PRD-IPH-123456"
      },
      "customer_id": {
        "customer_name": "John Doe",
        "phone": "+919876543210",
        "email": "john@example.com"
      },
      "warranty_start": "2024-01-15T00:00:00.000Z",
      "warranty_end": "2025-01-15T00:00:00.000Z",
      "status": "active"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 5. Get Claims by Serial Number

**Endpoint**: `GET /api/external/claims/{serial}`

**Description**: Retrieve all claims for a product by serial number. No API key required.

**Headers**: None required

**URL Parameters**:
- `serial` (path parameter): Product serial number

**Example Request**:
```
GET /api/external/claims/PRD-IPH-123456
```

**Success Response** (200 OK):
```json
{
  "claims": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "warranty_id": {
        "product_id": {
          "product_model": "iPhone 15 Pro",
          "brand": "Apple",
          "category": "Electronics",
          "serial_number": "PRD-IPH-123456"
        },
        "customer_id": {
          "customer_name": "John Doe",
          "phone": "+919876543210",
          "email": "john@example.com"
        }
      },
      "claim_type": "repair",
      "description": "Screen is cracked",
      "status": "pending",
      "timeline_events": [
        {
          "timestamp": "2024-01-20T10:30:00.000Z",
          "action": "Claim created via external API"
        }
      ]
    }
  ]
}
```

---

### 6. List Claims (API Key Required)

**Endpoint**: `GET /api/external/claims`

**Description**: List all claims for the store (with optional filtering). Requires API key.

**Headers**:
```
X-API-Key: {your_api_key}
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page
- `serial_number` (optional): Filter by product serial number
- `status` (optional): Filter by claim status (pending, approved, rejected, completed)

**Example Request**:
```
GET /api/external/claims?page=1&limit=20&status=pending
```

**Success Response** (200 OK):
```json
{
  "claims": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "warranty_id": {
        "product_id": {
          "product_model": "iPhone 15 Pro",
          "brand": "Apple"
        },
        "customer_id": {
          "customer_name": "John Doe"
        }
      },
      "claim_type": "repair",
      "status": "pending"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 7. Get Product by Serial Number

**Endpoint**: `GET /api/external/products/{serial}`

**Description**: Retrieve product information by serial number. No API key required.

**Headers**: None required

**URL Parameters**:
- `serial` (path parameter): Product serial number

**Example Request**:
```
GET /api/external/products/PRD-IPH-123456
```

**Success Response** (200 OK):
```json
{
  "product": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "product_model": "iPhone 15 Pro",
    "brand": "Apple",
    "category": "Electronics",
    "serial_number": "PRD-IPH-123456",
    "manufacturing_date": "2024-01-01T00:00:00.000Z",
    "base_warranty_months": 12,
    "store_id": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "store_name": "My Store"
    }
  }
}
```

---

## Postman Environment Variables

Create a Postman environment with these variables:

```json
{
  "base_url": "http://localhost:3000",
  "api_key": "your_api_key_here"
}
```

## Postman Collection Setup

1. **Create Collection**: Create a new collection named "Product Management External API"
2. **Add Environment Variables**: Set up environment variables as above
3. **Add Requests**: Create requests for each endpoint
4. **Set Authorization**: Use collection-level authorization with Bearer Token (for GET endpoints only)
5. **Add Tests**: Add response validation tests

## Testing Checklist

### Warranty Registration Tests
- [ ] Test with all required fields
- [ ] Test with optional fields
- [ ] Test with invalid product serial number (should return 404)
- [ ] Test with duplicate warranty (should return 400)
- [ ] Test with missing required fields (should return 400)
- [ ] Verify customer is created if doesn't exist
- [ ] Verify warranty PDF is generated

### Claim Registration Tests
- [ ] Test with all required fields
- [ ] Test with attachments
- [ ] Test with invalid product serial number (should return 404)
- [ ] Test with no warranty (should return 404)
- [ ] Test with inactive warranty (should return 400)
- [ ] Test with description too short (should return 400)
- [ ] Test with invalid claim type (should return 400)

### Query Tests
- [ ] Test warranty lookup by serial number (no API key)
- [ ] Test claims lookup by serial number (no API key)
- [ ] Test product lookup by serial number (no API key)
- [ ] Test list warranties with API key
- [ ] Test list claims with API key and filters
- [ ] Test with invalid serial number (should return 404)

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["customer_name"],
      "message": "Required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Product not found with the provided serial number"
}
```

## Botflow Integration Example

### Step 1: Collect Customer Details
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+919876543210",
  "customer_email": "john@example.com",
  "customer_address": "123 Main St"
}
```

### Step 2: Collect Warranty Registration Details
```json
{
  "product_serial_number": "PRD-IPH-123456"
}
```

### Step 3: Register Warranty
```bash
POST /api/external/warranties
{
  "product_serial_number": "PRD-IPH-123456",
  "customer_name": "John Doe",
  "customer_phone": "+919876543210",
  "customer_email": "john@example.com",
  "customer_address": "123 Main St"
}
```

### Step 4: Collect Claim Details (if needed)
```json
{
  "claim_type": "repair",
  "description": "Screen is cracked"
}
```

### Step 5: Register Claim
```bash
POST /api/external/claims
{
  "product_serial_number": "PRD-IPH-123456",
  "claim_type": "repair",
  "description": "Screen is cracked and not responding to touch"
}
```

## Best Practices

1. **No API Key for POST**: Warranty and claim registration don't require API keys
2. **Store Auto-Detection**: Store is automatically found from product serial number
3. **Customer Auto-Creation**: Customers are automatically created if they don't exist
4. **Date Auto-Calculation**: Warranty dates are automatically calculated
5. **PDF Auto-Generation**: Warranty PDF is automatically generated after registration
6. **Error Handling**: Always check error responses and handle appropriately
7. **Validation**: Validate data before sending to API

## Notes

- **POST endpoints** (warranty/claim registration) don't require API keys - they find the store from the product serial number
- **GET endpoints** (list/query operations) require API keys for security
- All dates are automatically calculated - no need to pass warranty_start or warranty_end
- Warranty PDF is automatically generated after warranty creation
- Customers are automatically created if they don't exist (matched by phone number)
