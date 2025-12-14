# E-Commerce Platform - Frontend

Modern React frontend for the E-Commerce Microservices Platform.

## Features

- **Dashboard**: Overview of the platform architecture and quick links
- **Product Catalog**: Browse products by category with add to cart functionality
- **Order Management**: Create, view, and cancel orders with real-time stock updates
- **User Management**: CRUD operations for users with role-based access (CLIENT/ADMIN)
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Real-time Integration**: Direct communication with backend microservices via API Gateway

## Technology Stack

- **React 19.2.3**: Modern React with hooks
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with modern design patterns

## Prerequisites

Before running the frontend, ensure:

1. **Node.js** (v14 or higher) is installed
2. **Backend services** are running (see main README.md)
3. All microservices are registered with Eureka (check http://localhost:8761)

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.js    # Home dashboard
│   │   ├── Products.js     # Product catalog
│   │   ├── Orders.js       # Order management
│   │   ├── Users.js        # User management
│   │   └── Navigation.js   # Navigation bar
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.js              # Main app component
│   ├── App.css             # Global styles
│   └── index.js            # Entry point
├── package.json
└── README.md
```

## API Configuration

The frontend connects to the backend via the API Gateway at `http://localhost:8080/api`

To change the API endpoint, modify `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Available Features

### 1. Dashboard
- Platform overview
- Architecture information
- Technology stack details
- Quick links to Eureka, API Gateway, and H2 consoles
- Getting started guide

### 2. Products Page
- View all products or filter by category
- Categories: ELECTRONICS, CLOTHING, BOOKS, HOME, SPORTS
- Add products to cart
- Real-time stock availability
- Product details (name, description, price, stock)

### 3. Orders Page
- View all orders with status tracking
- Create new orders
- Cancel pending orders
- Order statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- Automatic stock management

### 4. Users Page
- Create new users (CLIENT or ADMIN roles)
- Edit existing users
- Delete users
- View user information

## Integration with Backend

### Services Configuration

| Service | URL | Purpose |
|---------|-----|---------|
| API Gateway | http://localhost:8080 | All API requests route through here |
| Eureka Dashboard | http://localhost:8761 | Service registry |
| Product Service | http://localhost:8081 | Direct access (bypass gateway) |
| User Service | http://localhost:8083 | Direct access (bypass gateway) |

### API Endpoints Used

**Products:**
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `PATCH /api/products/{id}/stock` - Update stock

**Orders:**
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order
- `PATCH /api/orders/{id}/cancel` - Cancel order

**Users:**
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Troubleshooting

### Backend Services Not Running
**Error**: "Failed to load [resource]. Please ensure the backend services are running."

**Solution**:
1. Run `start-all-services.bat` in the `App/catalogue-service` directory
2. Wait for all services to register with Eureka
3. Verify at http://localhost:8761

### CORS Issues
If you encounter CORS errors, ensure the API Gateway has CORS enabled for `http://localhost:3000`

### Port Already in Use
If port 3000 is in use, you'll be prompted to use another port. Press 'Y' to continue.

## Development

### Running in Development Mode
```bash
npm start
```

### Building for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Running Tests
```bash
npm test
```

## Demo Workflow for Supervisor

### Complete Feature Demo (15 minutes)

1. **Show Dashboard** (2 min)
   - Navigate to http://localhost:3000
   - Explain architecture overview
   - Show quick links to backend services

2. **User Management** (3 min)
   - Navigate to Users page
   - Create a CLIENT user
   - Create an ADMIN user
   - Edit user details
   - Show user list

3. **Product Catalog** (3 min)
   - Navigate to Products page
   - Filter by different categories
   - Add products to cart
   - Show stock information

4. **Order Processing** (5 min)
   - Navigate to Orders page
   - Create a new order (select user and product)
   - Show order appears in list
   - Verify stock was reduced (check Products page)
   - Cancel an order
   - Verify stock was restored

5. **Backend Integration** (2 min)
   - Show Eureka Dashboard (all services UP)
   - Open H2 Console and show database changes
   - Demonstrate circuit breaker (stop a service)

## Features for Next Sprint

- [ ] User authentication and login
- [ ] Payment integration (PayPal frontend)
- [ ] Shopping cart persistence
- [ ] Order history per user
- [ ] Product search functionality
- [ ] Image upload for products
- [ ] Admin dashboard with analytics
- [ ] Real-time notifications

## Notes

- This is a frontend for an academic project
- Uses H2 in-memory database (data resets on backend restart)
- Currently no authentication implemented
- All operations are public for demonstration purposes

## Support

For issues or questions:
1. Check that all backend services are running
2. Verify Eureka Dashboard shows all services as UP
3. Check browser console for detailed error messages
4. Ensure API Gateway is accessible at http://localhost:8080

---

**Project**: E-Commerce Microservices Platform  
**Course**: Software Engineering Project  
**Duration**: 8 weeks (October - December 2025)  
**Stack**: Spring Boot 3.4.1 + React 19.2.3

