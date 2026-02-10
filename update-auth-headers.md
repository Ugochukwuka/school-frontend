# Authentication Headers Update Guide

All pages need to include authentication headers. The pattern is:

1. Import: `import { getAuthHeaders } from "@/app/lib/auth";`
2. For GET requests: Add `getAuthHeaders()` as second parameter
3. For POST/PUT requests: Add `getAuthHeaders()` as third parameter

Example:
```typescript
// GET request
const response = await axios.get<ApiResponse>(url, getAuthHeaders());

// POST request  
const response = await axios.post<ApiResponse>(url, data, getAuthHeaders());
```


