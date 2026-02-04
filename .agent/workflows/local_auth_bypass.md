---
description: "How to bypass authentication for local testing/verification"
---

# Local Auth Bypass Workflow

When verifying changes in the browser, valid authentication is often required. Since we cannot always rely on real backend credentials or connectivity during automated testing, use the following strategies.

## Strategy 1: The `devLogin` Helper (Preferred)
In development mode (`import.meta.env.DEV`), the app exposes a global `devLogin` function.

1.  Open the target URL.
    *   **Crucially**, for the Admin Portal, you MUST open `/admin.html` specifically (e.g. `http://localhost:5173/admin.html`), as it is a separate entry point from the main customer app.
2.  Execute the following JavaScript:
    ```javascript
    if (window.devLogin) {
        window.devLogin('tenant_owner');
    } else {
        console.error('devLogin not found');
    }
    ```
3.  This function automatically sets `admin_session` and `admin_auth_token` in `localStorage` and reloads the page.

## Strategy 2: Manual LocalStorage Injection
If `devLogin` is unavailable, manually inject the required tokens.

1.  Execute the following JavaScript:
    ```javascript
    const session = {
        email: 'dev@test.com',
        loginTime: new Date().toISOString(),
        user: { id: 1, name: 'Dev Admin', email: 'dev@test.com', role: 'tenant_owner' }
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
    localStorage.setItem('admin_auth_token', 'mock-dev-token');
    
    // Fallback keys (optional, depending on common app patterns)
    localStorage.setItem('auth_token', 'mock-dev-token');
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.reload();
    ```

## Strategy 3: Mocking Network Requests (Robust)
If the backend rejects the `mock-dev-token` with a 401 error (causing the app to redirect back to login), you must mock the `fetch` API to prevent the logout signal.

1.  Execute the following JavaScript **immediately** upon page load:
    ```javascript
    // Backup original fetch
    window.originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
        // Pass through non-API requests (assets, scripts, etc.)
        if (typeof input === 'string' && !input.includes('/api/')) {
            return window.originalFetch(input, init);
        }
        
        console.log('[MockFetch] Intercepting request to:', input);
        
        // Mock specific API responses
        if (input.includes('/auth/login')) {
            return new Response(JSON.stringify({
                token: 'mock-dev-token',
                user: { id: 1, role: 'tenant_owner', email: 'dev@test.com' }
            }), { status: 200 });
        }
        
        // Generic success for other API calls to prevent 401s
        return new Response(JSON.stringify({ success: true, mocked: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    console.log('[MockFetch] Network mocking enabled.');
    ```

## Browser Subagent Prompt Template
When asking the `browser_subagent` to verify a task, include this instruction if auth is shaky:

"If authentication is required, first try `window.devLogin()`. If the app redirects or fails due to network errors (401), monkey-patch `window.fetch` to return `200 OK` responses for API calls."
