# Troubleshooting Connection Issues

## Current Issue: Request Timeout

If you're seeing "Request timed out" errors, follow these steps:

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the project root (`c:\xampp\htdocs\school-frontend\.env.local`) with:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### Step 2: Verify Backend Server is Running

1. Open your browser and go to: `http://127.0.0.1:8000/api/login`
2. You should see a response (even if it's an error, that means the server is running)
3. If you get "This site can't be reached", your backend server is not running

### Step 3: Restart Next.js Dev Server

**IMPORTANT**: After creating `.env.local`, you MUST restart your Next.js dev server:
- Stop the server (Ctrl+C in the terminal)
- Run `npm run dev` again

### Step 4: Test the Connection

Try logging in again. If it still times out, try the alternative approach below.

## Alternative: Direct Connection (Bypass Proxy)

If the proxy isn't working, you can connect directly to the backend:

1. Update `.env.local` to:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

2. **Important**: Make sure your Laravel backend has CORS configured to allow requests from `http://localhost:3000` (or whatever port your Next.js app uses)

3. Restart your Next.js dev server

## Common Issues

### Backend Server Not Running
- **Symptom**: Timeout or "Connection refused" errors
- **Solution**: Start your Laravel backend server with `php artisan serve` or your preferred method

### Wrong Port
- **Symptom**: Timeout errors
- **Solution**: Verify your backend is running on port 8000. If not, update `.env.local` with the correct port

### Windows Firewall
- **Symptom**: Timeout errors
- **Solution**: Check if Windows Firewall is blocking port 8000. You may need to allow the connection

### CORS Issues (Direct Connection Only)
- **Symptom**: CORS errors in browser console
- **Solution**: Configure CORS in your Laravel backend's `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## Quick Diagnostic

Run this in your browser console to test the connection:

```javascript
fetch('http://127.0.0.1:8000/api/login', {
  method: 'OPTIONS',
  headers: { 'Accept': 'application/json' }
})
.then(r => console.log('✅ Backend is reachable', r))
.catch(e => console.error('❌ Backend connection failed', e));
```
