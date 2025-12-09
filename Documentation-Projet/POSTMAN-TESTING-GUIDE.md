# Testing Guide - Postman Collection

## ✅ Postman Collection Status: VERIFIED & CORRECTED

Your `Catalogue-Microservices-Postman-Collection.json` is **fully compatible** with the current system after minor corrections.

---

## What Was Fixed

### Port Numbers in Description
- User Service: **8083** → **8082** ✅
- Order Service: **8085** → **8083** ✅

### Documentation Updates
- Added notes about multiple payment methods
- Added reference to PayPal being optional
- Added link to PAYPAL-SETUP.md

---

## Quick Start with Postman

### 1. Import Collection
```
1. Open Postman
2. File → Import
3. Select: Catalogue-Microservices-Postman-Collection.json
4. Click Import
```

### 2. Verify Services are Running
Use the **"1. Infrastructure Services"** folder:
- Config Server Health Check → Should return 200 OK
- Eureka Dashboard → Should show all registered services
- API Gateway Health Check → Should return 200 OK

### 3. Test Order Creation
Use the **"4. Order Service"** folder:

**Request: POST Create Order (OpenFeign)**
```
POST http://localhost:8080/api/orders
Content-Type: application/json

{
  "userId": 1,
  "adresseLivraison": "123 Rue de la Paix, 75001 Paris",
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Expected Response:**
```json
{
  "id": 6,
  "orderNumber": "ORD-2025-...",
  "userId": 1,
  "adresseLivraison": "123 Rue de la Paix, 75001 Paris",
  "status": "PENDING",
  "montantTotal": 159.98,
  "orderItems": [...]
}
```

### 4. Test Payment Creation
Use the **"5. Payment Service"** folder:

**Request: POST Create Payment (Non-PayPal)**
```
POST http://localhost:8080/api/payments
Content-Type: application/json

{
  "orderId": 1,
  "userId": 1,
  "amount": 299.99,
  "paymentMethod": "CREDIT_CARD",
  "description": "Payment for order #1"
}
```

**Valid Payment Methods:**
- `CREDIT_CARD` ✅
- `BANK_TRANSFER` ✅
- `CASH_ON_DELIVERY` ✅
- `PAYPAL` ✅ (if enabled)

---

## Testing Scenarios

### Scenario 1: Complete Order Flow
Run these requests in order:

1. **GET All Products** (verify stock)
2. **POST Create Order** (with valid productId and userId)
3. **GET Order by ID** (verify order created)
4. **POST Create Payment** (for the order)
5. **GET Payment by Order** (verify payment)

### Scenario 2: User Management
1. **POST Create User** (create new user)
2. **GET User by ID** (verify user created)
3. **GET User Orders** (OpenFeign call to Order Service)
4. **PATCH Deactivate User** (deactivate)
5. **PATCH Activate User** (reactivate)

### Scenario 3: Product & Stock Management
1. **GET All Products** (check initial stock)
2. **POST Create Order** (order some products)
3. **GET Product by ID** (verify stock decreased)

### Scenario 4: Payment Methods
Test each payment method:

**Credit Card:**
```json
{"paymentMethod": "CREDIT_CARD", ...}
```

**Bank Transfer:**
```json
{"paymentMethod": "BANK_TRANSFER", ...}
```

**Cash on Delivery:**
```json
{"paymentMethod": "CASH_ON_DELIVERY", ...}
```

**PayPal (if enabled):**
```json
Use the "POST Create PayPal Payment" endpoint
```

---

## Demo Flow (Folder: "6. DEMO Complete Flow")

The collection includes an automated demo flow:

### Steps:
1. **STEP 1: Create User** → Saves userId
2. **STEP 2: Create Order** → Saves orderId
3. **STEP 3: Create Payment** → Links to order
4. **STEP 4: Verify** → Checks all created

This flow uses Postman scripts to automatically pass IDs between requests.

---

## Important Endpoints

### Health Checks
```
GET http://localhost:8888/actuator/health  # Config Server
GET http://localhost:8761/actuator/health  # Eureka
GET http://localhost:8080/actuator/health  # API Gateway
GET http://localhost:8081/actuator/health  # Product Service
GET http://localhost:8082/actuator/health  # User Service
GET http://localhost:8083/actuator/health  # Order Service
GET http://localhost:8084/actuator/health  # Payment Service
```

### Service Registration
```
GET http://localhost:8761/  # Eureka Dashboard
Shows all registered services
```

---

## PayPal Endpoints (Optional)

### ⚠️ PayPal is DISABLED by default

If you want to test PayPal integration:

1. **Enable PayPal** (see `payment-service/PAYPAL-SETUP.md`)
2. **Use these endpoints**:
   - `POST /api/payments/paypal/create` - Create payment
   - `POST /api/payments/paypal/execute` - Execute after approval
   - `POST /api/payments/paypal/cancel/{paymentId}` - Cancel payment

3. **Without PayPal enabled**, these endpoints will return:
   ```json
   {
     "error": "PayPal integration is not configured"
   }
   ```
   This is **expected behavior** ✅

---

## Common Issues & Solutions

### Issue: "Service not found" error
**Solution**: Check Eureka dashboard (http://localhost:8761) - service must be registered

### Issue: "Connection refused"
**Solution**: Verify the service is running on the correct port

### Issue: Order creation fails with "userId not found"
**Solution**: Create a user first or use existing userId (1, 2, 3, 4, 5 from sample data)

### Issue: PayPal endpoints fail
**Solution**: This is normal if PayPal is disabled. Either:
- Use other payment methods (CREDIT_CARD, etc.)
- Enable PayPal (see PAYPAL-SETUP.md)

### Issue: Product out of stock
**Solution**: Check product stock first with GET /api/products/{id}

---

## Collection Organization

```
Catalogue-Microservices-Postman-Collection.json
├── 1. Infrastructure Services (3 requests)
├── 2. User Service (11 requests)
├── 3. Product Service (10+ requests)
├── 4. Order Service (8+ requests)
│   └── ✅ Uses correct schema (userId, not client fields)
├── 5. Payment Service (8+ requests)
│   └── ✅ Valid payment methods only
└── 6. DEMO Complete Flow (4 steps)
    └── Automated test scenario
```

---

## Testing Checklist

Before reporting issues, verify:

- [ ] All services are running (check Eureka)
- [ ] Config Server is running (starts first)
- [ ] Using correct ports (see QUICK-START.md)
- [ ] Request body matches schema
- [ ] User/Product IDs exist before creating orders
- [ ] PayPal is enabled if testing PayPal endpoints

---

## References

- **QUICK-START.md** - How to start all services
- **TROUBLESHOOTING-SUMMARY.md** - Detailed issue solutions
- **payment-service/PAYPAL-SETUP.md** - PayPal configuration guide

---

## Summary

✅ **Postman collection is verified and correct**  
✅ **Compatible with current microservices**  
✅ **All payment methods supported**  
✅ **Order schema matches entities**  
✅ **Ready to use immediately**

Import the collection and start testing! All endpoints work with the current system.

