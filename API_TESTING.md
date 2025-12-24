# API Testing Guide

Complete API endpoint testing examples using curl.

## Setup

```bash
# Base URL
BASE_URL="http://localhost:3000"

# After login, save your token
TOKEN="your-jwt-token-here"
```

## Authentication

### 1. Signup
```bash
curl -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "business_name": "Tech Store"
  }'
```

### 2. Login
```bash
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Current User
```bash
curl -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Stores

### Create Store
```bash
curl -X POST $BASE_URL/api/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "Tech Store Downtown",
    "address": "123 Main St, City",
    "contact_phone": "+1234567890",
    "serial_prefix": "TECH",
    "serial_suffix": "2024",
    "whatsapp_enabled": true,
    "whatsapp_number": "+1234567890"
  }'
```

### List Stores
```bash
curl -X GET $BASE_URL/api/stores \
  -H "Authorization: Bearer $TOKEN"
```

### Get Store by ID
```bash
curl -X GET $BASE_URL/api/stores/{STORE_ID} \
  -H "Authorization: Bearer $TOKEN"
```

### Update Store
```bash
curl -X PUT $BASE_URL/api/stores/{STORE_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "Tech Store Updated",
    "serial_prefix": "TECH2"
  }'
```

## Customers

### Create Customer
```bash
curl -X POST $BASE_URL/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "{STORE_ID}",
    "customer_name": "Jane Smith",
    "phone": "+1987654321",
    "email": "jane@example.com",
    "address": "456 Oak Ave",
    "gst_number": "GST123456"
  }'
```

### List Customers
```bash
curl -X GET "$BASE_URL/api/customers?storeId={STORE_ID}&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Customer by ID
```bash
curl -X GET $BASE_URL/api/customers/{CUSTOMER_ID} \
  -H "Authorization: Bearer $TOKEN"
```

## Products

### Create Product
```bash
curl -X POST $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "{STORE_ID}",
    "product_model": "Galaxy S23",
    "category": "Smartphone",
    "brand": "Samsung",
    "purchase_date": "2024-01-15",
    "base_warranty_months": 12
  }'
```

Response includes auto-generated serial number:
```json
{
  "product": {
    "_id": "...",
    "serial_number": "TECH12024",
    "serial_prefix_used": "TECH",
    "serial_suffix_used": "2024",
    "serial_number_index": 1,
    ...
  }
}
```

### List Products
```bash
curl -X GET "$BASE_URL/api/products?storeId={STORE_ID}&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Product by Serial Number
```bash
curl -X GET $BASE_URL/api/products/serial/{SERIAL_NUMBER}
```

## Warranties

### Register Warranty
```bash
curl -X POST $BASE_URL/api/warranties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "{PRODUCT_ID}",
    "customer_id": "{CUSTOMER_ID}",
    "warranty_start": "2024-01-15"
  }'
```

Response includes QR code and PDF URLs:
```json
{
  "warranty": {
    "_id": "...",
    "warranty_start": "2024-01-15",
    "warranty_end": "2025-01-15",
    "status": "active",
    "qr_code_url": "/uploads/qr/qr-TECH12024-....png",
    "warranty_pdf_url": "/uploads/warranties/warranty-TECH12024-....pdf"
  }
}
```

### List Warranties
```bash
curl -X GET "$BASE_URL/api/warranties?storeId={STORE_ID}&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Warranty by Serial Number (Public)
```bash
curl -X GET $BASE_URL/api/warranties/serial/{SERIAL_NUMBER}
```

## Claims

### Create Claim
```bash
curl -X POST $BASE_URL/api/claims \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "warranty_id": "{WARRANTY_ID}",
    "claim_type": "repair",
    "description": "Screen is cracked and not responding to touch"
  }'
```

### List Claims
```bash
curl -X GET "$BASE_URL/api/claims?storeId={STORE_ID}&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Claim by ID
```bash
curl -X GET $BASE_URL/api/claims/{CLAIM_ID} \
  -H "Authorization: Bearer $TOKEN"
```

### Update Claim Status
```bash
curl -X PUT $BASE_URL/api/claims/{CLAIM_ID}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Claim approved for repair"
  }'
```

### Add Timeline Event
```bash
curl -X POST $BASE_URL/api/claims/{CLAIM_ID}/timeline \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Repair started",
    "notes": "Device sent to repair center"
  }'
```

## Store Users

### Assign User to Store
```bash
curl -X POST $BASE_URL/api/store-users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": "{STORE_ID}",
    "user_id": "{USER_ID}",
    "role": "manager",
    "permissions": ["view_products", "create_products", "manage_claims"]
  }'
```

### List Store Users
```bash
curl -X GET "$BASE_URL/api/store-users?storeId={STORE_ID}" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Store User
```bash
curl -X PUT $BASE_URL/api/store-users/{STORE_USER_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "permissions": ["*"]
  }'
```

## Audit Logs

### List All Audit Logs
```bash
curl -X GET "$BASE_URL/api/audit-logs?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Entity
```bash
curl -X GET "$BASE_URL/api/audit-logs?entity=warranties&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Store
```bash
curl -X GET "$BASE_URL/api/audit-logs?storeId={STORE_ID}&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Entity ID
```bash
curl -X GET "$BASE_URL/api/audit-logs?entityId={ENTITY_ID}" \
  -H "Authorization: Bearer $TOKEN"
```

## WhatsApp Webhook

### Simulate Incoming Message
```bash
curl -X POST $BASE_URL/api/whatsapp/kwic-hook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+1234567890",
    "message": {
      "type": "text",
      "text": {
        "body": "menu"
      }
    }
  }'
```

### Check Warranty via WhatsApp
```bash
curl -X POST $BASE_URL/api/whatsapp/kwic-hook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+1234567890",
    "message": {
      "type": "text",
      "text": {
        "body": "2"
      }
    }
  }'
```

Then send serial number:
```bash
curl -X POST $BASE_URL/api/whatsapp/kwic-hook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+1234567890",
    "message": {
      "type": "text",
      "text": {
        "body": "TECH12024"
      }
    }
  }'
```

## Testing Workflow

### Complete Flow Test

```bash
# 1. Create account
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@test.com","phone":"+1111111111","password":"test123"}' \
  | jq -r '.token')

# 2. Create store
STORE_ID=$(curl -s -X POST $BASE_URL/api/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"store_name":"Test Store","serial_prefix":"TEST","serial_suffix":""}' \
  | jq -r '.store._id')

# 3. Create customer
CUSTOMER_ID=$(curl -s -X POST $BASE_URL/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"store_id\":\"$STORE_ID\",\"customer_name\":\"Test Customer\",\"phone\":\"+2222222222\"}" \
  | jq -r '.customer._id')

# 4. Create product
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"store_id\":\"$STORE_ID\",\"product_model\":\"Test Model\",\"category\":\"Test\",\"brand\":\"Test Brand\",\"purchase_date\":\"2024-01-01\",\"base_warranty_months\":12}")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.product._id')
SERIAL_NUMBER=$(echo $PRODUCT_RESPONSE | jq -r '.product.serial_number')

# 5. Register warranty
WARRANTY_ID=$(curl -s -X POST $BASE_URL/api/warranties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":\"$PRODUCT_ID\",\"customer_id\":\"$CUSTOMER_ID\",\"warranty_start\":\"2024-01-01\"}" \
  | jq -r '.warranty._id')

# 6. Create claim
CLAIM_ID=$(curl -s -X POST $BASE_URL/api/claims \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"warranty_id\":\"$WARRANTY_ID\",\"claim_type\":\"repair\",\"description\":\"Test claim\"}" \
  | jq -r '.claim._id')

# 7. Verify warranty (public)
curl -s -X GET $BASE_URL/api/warranties/serial/$SERIAL_NUMBER | jq

echo "Test completed successfully!"
echo "Store ID: $STORE_ID"
echo "Product Serial: $SERIAL_NUMBER"
echo "Warranty ID: $WARRANTY_ID"
echo "Claim ID: $CLAIM_ID"
```

## Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Tips

1. Save your token after login for subsequent requests
2. Use jq for JSON parsing in bash scripts
3. Check audit logs to verify operations
4. Test WhatsApp flows in sequence
5. Use pagination for large datasets
6. Monitor MongoDB for data verification

---

**Happy Testing!** 🧪
