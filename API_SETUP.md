# API Configuration Setup

## Quick Fix for Network Error

The application now uses a Next.js proxy to avoid CORS issues. Follow these steps:

### 1. Create Environment File

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### 2. Restart Your Development Server

After creating the `.env.local` file, restart your Next.js development server:

```bash
npm run dev
```

### 3. Verify Backend Server is Running

Make sure your Laravel/backend server is running at `http://127.0.0.1:8000`. You can verify by:

- Opening `http://127.0.0.1:8000/api/login` in your browser
- Checking your backend server terminal/console

### 4. How It Works

- The Next.js app now proxies all `/api/*` requests to your backend
- This eliminates CORS issues because requests appear to come from the same origin
- The frontend makes requests to `/api/login` which gets proxied to `http://127.0.0.1:8000/api/login`

### Alternative: Direct Connection (if proxy doesn't work)

If you prefer to connect directly to the backend (bypassing the proxy), you can set:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

**Note:** If you use direct connection, make sure your backend has CORS configured to allow requests from `http://localhost:3000` (or whatever port your Next.js app runs on).

## Troubleshooting

### Still Getting Network Error?

1. **Check backend is running**: Visit `http://127.0.0.1:8000` in your browser
2. **Check port**: Make sure your backend is on port 8000
3. **Check firewall**: Windows Firewall might be blocking the connection
4. **Check backend CORS**: If using direct connection, ensure CORS allows your frontend origin

### Backend CORS Configuration (Laravel)

If you need to configure CORS in Laravel, add to `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```
