# NexCart — Frontend Client

Overview
--------
This project is the frontend client for an e-commerce platform. The application provides product listings, shopping cart management, payment gateway integration, order management, and user account functionality.

The UI is implemented with Angular and Tailwind CSS and is ready to connect to backend APIs for full functionality.

Features
--------------------
- User Authentication: register and log in with user accounts.
- Product Catalog: display products with details, categories and search.
- Shopping Cart: add/remove items, update quantities and proceed to checkout.
- Payment Processing: integrate payment gateways for secure transactions.
- Order Management: place orders, track status and view order history.
- Admin Panel: manage products, inventory and view analytics.

Examples for MIS Reports
------------------------
- Sales Report: Breakdown of sales by time period, product categories, and regions.
- Inventory Report: Overview of stock levels, top-selling products, and items requiring restocking.
- Customer Analytics: Customer demographics, purchasing behavior, and lifetime value.
- Abandoned Cart Report: Analysis of abandoned carts to identify potential reasons and recover lost sales.

(User roles and permissions are managed by the backend; this README focuses on the frontend client.)

Installation & Quick start
------------------------

Requirements
- Node.js (14+ recommended; Node 16+ preferred)
- npm or yarn

Install dependencies (run from the project root `nexcart-client`):

```powershell
npm install
# or
# yarn install
```

Run the development server:

```powershell
npm start
# or
# npx ng serve --open
```

Open http://localhost:4200/ in your browser.

Build for production:

```powershell
npm run build
```

Notes on backend integration
----------------------------
This frontend requires a backend API for authentication, product and cart management. Typical endpoints:

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/products`
- POST `/api/cart`

Configure your API base URL in `src/environments/environment.ts` and `src/environments/environment.prod.ts`.

Project pointers
----------------
- `src/` — application source
- `src/app/features/auth/` — auth components and `auth.service.ts`
- `src/app/features/home/` — home and modals
- `src/app/features/products/` — product list/detail and `product.service.ts`
- `src/app/core/services/` — shared services such as `cart.service.ts`

Contributing
------------
1. Fork the repository
2. Create a branch for your feature or bugfix
3. Run and test locally
4. Open a pull request describing your changes

Troubleshooting
---------------
- If the dev server fails to start, confirm Node and npm are installed and run `npm install`.
- If API calls fail due to CORS, enable CORS on the backend or use a development proxy.

