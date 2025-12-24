# Product & Warranty Management System

Complete full-stack warranty management solution built with Next.js 14, MongoDB, and TypeScript.

## 🚀 Features

### Core Functionality
- ✅ Multi-tenant store management
- ✅ Product registration with auto-generated serial numbers
- ✅ Warranty lifecycle management
- ✅ Claims processing with timeline tracking
- ✅ Customer management
- ✅ Store user roles and permissions
- ✅ Comprehensive audit logging

### Integrations
- ✅ WhatsApp Business API (KWIC) integration
- ✅ PDF warranty card generation (pdf-lib)
- ✅ QR code generation for product verification
- ✅ Automated warranty PDF delivery via WhatsApp

### Security & Auth
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Protected API routes

## 📋 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **PDF Generation**: pdf-lib
- **QR Codes**: qrcode
- **Validation**: Zod
- **WhatsApp**: KWIC API

## 🗄️ Database Schema

### Collections (snake_case)

1. **user_accounts** - System users
2. **stores** - Store/business entities
3. **store_users** - User-store assignments with roles
4. **customers** - Customer records
5. **products** - Product inventory with serial numbers
6. **warranties** - Warranty registrations
7. **claims** - Warranty claims
8. **system_audit_logs** - Audit trail
9. **whatsapp_event_logs** - WhatsApp message logs

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn

### Setup Steps

1. **Clone and install dependencies**
```bash
cd /workspaces/product-management
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/product_warranty_db
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# KWIC WhatsApp API
KWIC_API_URL=https://api.kwic.io/v1
KWIC_API_KEY=your-kwic-api-key
KWIC_PHONE_NUMBER=+1234567890
```

3. **Start MongoDB**
```bash
mongod --dbpath /path/to/data
```

4. **Run development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup

## 📁 Project Structure

```
/workspaces/product-management/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── stores/         # Store CRUD
│   │   ├── customers/      # Customer CRUD
│   │   ├── products/       # Product CRUD
│   │   ├── warranties/     # Warranty CRUD
│   │   ├── claims/         # Claims CRUD
│   │   ├── store-users/    # Store user management
│   │   ├── audit-logs/     # Audit log retrieval
│   │   └── whatsapp/       # WhatsApp webhook
│   └── verify/[serial]/    # Public warranty verification
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layouts/            # Layout components
│   └── forms/              # Form components
├── lib/
│   ├── db.ts              # MongoDB connection
│   ├── auth.ts            # JWT utilities
│   ├── serial-generator.ts # Serial number generator
│   ├── qr-generator.ts    # QR code generator
│   ├── pdf-generator.ts   # PDF warranty card generator
│   ├── whatsapp-client.ts # WhatsApp API client
│   ├── audit-logger.ts    # Audit logging utility
│   └── utils.ts           # Helper functions
├── models/                # Mongoose schemas
├── middleware/            # Auth, RBAC, validation
└── types/                 # TypeScript definitions

```

## 🔐 Authentication Flow

1. User signs up via `/api/auth/signup`
2. Password is hashed with bcrypt
3. JWT token is generated and returned
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes
6. Middleware validates token and extracts user info

## 🏪 Store Management

### Serial Number Generation
- Format: `{prefix}{auto_increment}{suffix}`
- Example: `PRD0001`, `STORE-0042-2024`
- Configurable per store
- Atomic counter increment

### Store Users & Roles
- **Admin**: Full access to store
- **Manager**: Manage products, warranties, claims
- **Staff**: View-only access

## 📦 Product Registration

1. Select store
2. Enter product details (brand, model, category)
3. Serial number auto-generated
4. Purchase date and warranty period
5. Product created with unique serial

## 🛡️ Warranty Registration

1. Select product (by serial number)
2. Select customer
3. Set warranty start date
4. System calculates end date based on product warranty period
5. QR code generated for verification
6. PDF warranty certificate generated
7. PDF automatically sent via WhatsApp (if enabled)

## 📋 Claims Management

### Claim Lifecycle
1. **Pending** - Initial state
2. **Approved** - Claim accepted
3. **Rejected** - Claim denied
4. **Completed** - Claim resolved

### Timeline Tracking
- All status changes logged
- User attribution
- Notes and comments
- Timestamp for each event

## 💬 WhatsApp Integration

### Webhook Endpoint
`POST /api/whatsapp/kwic-hook`

### Supported Flows

**Main Menu**
- Send "menu" or "hi" to see options

**1. Register Warranty**
- User provides serial number
- System registers warranty

**2. Check Warranty**
- User provides serial number
- System returns warranty details and expiry

**3. Create Claim**
- User provides serial number
- User describes issue
- Claim created automatically

**4. Check Claim Status**
- User provides claim ID
- System returns current status and timeline

### Session Management
- In-memory session storage
- State machine for conversation flow
- Context preservation across messages

## 📊 Audit Logging

All critical operations are logged:
- Entity type (stores, products, warranties, claims)
- Action (create, update, delete)
- User who performed action
- Old and new values (for updates)
- Timestamp

### Viewing Audit Logs
- Navigate to `/audit-logs`
- Filter by entity type
- View complete change history
- Diff viewer for updates

## 🔍 Warranty Verification

Public endpoint for QR code verification:
`/verify/{serial_number}`

Displays:
- Product details
- Customer information
- Warranty period
- Current status
- Days remaining
- Download PDF option

## 📄 PDF Warranty Certificate

Generated using pdf-lib with:
- Store branding
- Customer details
- Product information
- Warranty period
- Embedded QR code
- Terms and conditions

## 🔒 Security Best Practices

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - No plain text storage

2. **JWT Tokens**
   - 7-day expiration
   - Signed with secret key
   - Validated on every request

3. **API Protection**
   - All routes require authentication
   - RBAC middleware for store access
   - Input validation with Zod

4. **Data Validation**
   - Schema validation on all inputs
   - Type safety with TypeScript
   - Mongoose schema validation

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
- Set strong JWT_SECRET
- Use production MongoDB URI
- Configure KWIC API credentials
- Set correct NEXT_PUBLIC_APP_URL

### Recommended Hosting
- **Frontend/Backend**: Vercel, AWS, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3 (for PDFs/QR codes)

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Stores
- `GET /api/stores` - List stores
- `POST /api/stores` - Create store
- `GET /api/stores/[id]` - Get store
- `PUT /api/stores/[id]` - Update store
- `DELETE /api/stores/[id]` - Delete store

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `GET /api/products/serial/[serial]` - Get by serial

### Warranties
- `GET /api/warranties` - List warranties
- `POST /api/warranties` - Register warranty
- `GET /api/warranties/[id]` - Get warranty
- `GET /api/warranties/serial/[serial]` - Get by serial

### Claims
- `GET /api/claims` - List claims
- `POST /api/claims` - Create claim
- `GET /api/claims/[id]` - Get claim
- `PUT /api/claims/[id]/status` - Update status
- `POST /api/claims/[id]/timeline` - Add timeline event

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer
- `PUT /api/customers/[id]` - Update customer

### Store Users
- `GET /api/store-users` - List store users
- `POST /api/store-users` - Assign user to store
- `PUT /api/store-users/[id]` - Update assignment
- `DELETE /api/store-users/[id]` - Remove assignment

### Audit Logs
- `GET /api/audit-logs` - List audit logs (with filters)

### WhatsApp
- `POST /api/whatsapp/kwic-hook` - Webhook endpoint

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Store creation
- [ ] Product creation with serial generation
- [ ] Customer creation
- [ ] Warranty registration
- [ ] PDF generation
- [ ] QR code generation
- [ ] Claim creation and status updates
- [ ] WhatsApp message handling
- [ ] Audit log recording
- [ ] Public warranty verification

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure network connectivity

### PDF Generation Fails
- Check file system permissions
- Verify public/uploads directory exists
- Check disk space

### WhatsApp Not Working
- Verify KWIC API credentials
- Check webhook URL is publicly accessible
- Review whatsapp_event_logs collection

### Serial Numbers Not Generating
- Check store serial_counter field
- Verify atomic increment operation
- Review product creation logs

## 📞 Support

For issues or questions:
1. Check audit logs for error details
2. Review MongoDB logs
3. Check Next.js console output
4. Verify environment variables

## 📄 License

Proprietary - All rights reserved

## 👥 Contributors

Built as a complete full-stack warranty management solution.

---

**Version**: 1.0.0  
**Last Updated**: 2024
