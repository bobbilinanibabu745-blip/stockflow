# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# StockFlow — Inventory Management System

StockFlow is a SaaS inventory management application that helps businesses manage products, track stock quantities, and monitor low-stock items in their own workspace.

## Features

- User signup and email-based login
- Organization creation and isolated inventory data
- Product creation, viewing, editing, and deletion
- Product search by name or SKU
- Product SKU uniqueness within each organization
- Dashboard showing total products, total stock, and low-stock items
- Configurable organization-wide default low-stock threshold
- Optional product-specific low-stock thresholds
- Product cost price, selling price, and description
- JWT authentication

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Lucide React icons

**Backend**
- Python
- Django
- Django REST Framework
- Simple JWT authentication
- SQLite database

## Project Structure

```text
stockflow/
├── backend/
│   ├── config/
│   ├── inventory/
│   ├── manage.py
│   └── db.sqlite3
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Prerequisites

Install Python, Node.js, and npm before running the application.

## Run the Backend

Open a terminal and navigate to the backend folder:

```powershell
cd backend
python -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

## Run the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173/`

## How to Use

1. Open the frontend URL in your browser.
2. Create an account with a username, email, password, and organization name.
3. Sign in using your email address and password.
4. Add products with their names, SKUs, quantities, prices, and optional stock thresholds.
5. Use the Products page to search, edit, or delete products.
6. View stock summaries and low-stock alerts on the Dashboard.
7. Configure the default low-stock threshold in Settings.

## Testing

Backend automated tests:

```powershell
python manage.py test inventory
```

Frontend production build:

```powershell
npm run build
```

The project has passed six backend automated tests and a frontend production build in the current development environment.

## Scope

StockFlow is a prototype inventory management application. It focuses on organization-level inventory management, product CRUD, stock summaries, and low-stock monitoring.

Multi-warehouse management, order management, payment processing, and external sales-channel integrations are outside the current scope.