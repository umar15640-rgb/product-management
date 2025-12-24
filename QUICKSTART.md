# 🚀 Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/product_warranty_db
JWT_SECRET=my-super-secret-key-change-this
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI with your Atlas connection string
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to: http://localhost:3000

## First Steps

### 1. Create Account
- Go to http://localhost:3000/signup
- Fill in your details
- Click "Sign Up"

### 2. Create Your First Store
- Navigate to "Stores" in sidebar
- Click "Add Store"
- Enter store details
- Set serial prefix (e.g., "PRD")
- Click "Create Store"

### 3. Add a Customer
- Navigate to "Customers"
- Click "Add Customer"
- Select your store
- Enter customer details
- Click "Create Customer"

### 4. Register a Product
- Navigate to "Products"
- Click "Add Product"
- Select your store
- Enter product details
- Serial number will be auto-generated
- Click "Create Product"

### 5. Register Warranty
- Navigate to "Warranties"
- Click "Register Warranty"
- Select product and customer
- Set warranty start date
- Click "Register Warranty"
- PDF and QR code will be generated automatically

### 6. Test Warranty Verification
- Copy the serial number from your product
- Visit: http://localhost:3000/verify/{SERIAL_NUMBER}
- View warranty details

## WhatsApp Setup (Optional)

### 1. Get KWIC API Credentials
- Sign up at KWIC WhatsApp Business API
- Get your API key and phone number

### 2. Update .env
```env
KWIC_API_URL=https://api.kwic.io/v1
KWIC_API_KEY=your-api-key-here
KWIC_PHONE_NUMBER=+1234567890
```

### 3. Configure Webhook
- Set webhook URL in KWIC dashboard
- URL: https://your-domain.com/api/whatsapp/kwic-hook

### 4. Test WhatsApp
- Send "menu" to your WhatsApp number
- Follow the interactive prompts

## Common Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Default Test Data

After setup, you can create test data:

**Test Store:**
- Name: "Tech Store"
- Prefix: "TECH"
- Suffix: "2024"

**Test Product:**
- Brand: "Samsung"
- Model: "Galaxy S23"
- Category: "Smartphone"
- Warranty: 12 months

**Test Customer:**
- Name: "John Doe"
- Phone: "+1234567890"
- Email: "john@example.com"

## Next Steps

1. ✅ Explore the dashboard
2. ✅ Create multiple stores
3. ✅ Add store users with different roles
4. ✅ Register products and warranties
5. ✅ Create and manage claims
6. ✅ Review audit logs
7. ✅ Test WhatsApp integration

## Need Help?

- Check SYSTEM_DOCUMENTATION.md for detailed docs
- Review API routes in /app/api/
- Check MongoDB collections for data structure
- Review console logs for errors

## Production Deployment

See SYSTEM_DOCUMENTATION.md for:
- Production build steps
- Environment configuration
- Hosting recommendations
- Security best practices

---

**Ready to go!** 🎉

Start by creating your account at http://localhost:3000/signup
