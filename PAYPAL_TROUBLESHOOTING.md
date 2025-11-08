# PayPal Integration Troubleshooting Guide

## Issue: PayPal Logger API Error

The error you're seeing (`https://www.sandbox.paypal.com/xoplatform/logger/api/logger`) typically indicates one of these issues:

## ✅ Fixes Applied

### 1. **Updated Content Security Policy (CSP)**
- Added proper PayPal domains to CSP headers
- Allowed `connect-src`, `frame-src`, and `script-src` for PayPal sandbox

### 2. **Forced USD Currency**
- PayPal sandbox works best with USD
- Updated both frontend and backend to use USD

### 3. **Added Application Context**
- Added proper `application_context` to PayPal order creation
- Includes return URLs and branding

### 4. **Enhanced Error Handling**
- Better logging for debugging
- Validates credentials before making API calls

### 5. **PayPal Client ID Validation**
- Frontend now checks if valid client ID exists
- Shows helpful error message if not configured

## 🔧 Required Setup Steps

### Step 1: Verify Environment Variables

Make sure your `.env.local` file contains these variables:

```bash
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 2: Get PayPal Sandbox Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Navigate to "Apps & Credentials"
4. Select "Sandbox" (not Live)
5. Create a new app or use existing one
6. Copy the **Client ID** and **Secret**

### Step 3: Restart Your Development Server

After adding environment variables, restart Next.js:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Clear Browser Cache

- Clear browser cache and cookies
- Or use incognito/private browsing mode

## 🔍 Debugging Checklist

### Check 1: Verify Credentials Are Loaded

Open browser console and check:

```javascript
// This should NOT be "YOUR_PAYPAL_CLIENT_ID"
console.log(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
```

### Check 2: Check Network Tab

1. Open DevTools → Network tab
2. Try making a payment
3. Look for:
   - `/api/payments/paypal/create-order` - Should return 200 with `orderId`
   - PayPal SDK requests - Should load successfully

### Check 3: Check Server Logs

Look for these messages in your terminal:

```
✅ Good: "PayPal order created successfully: { orderId: '...', status: '...' }"
❌ Bad: "PayPal credentials not configured"
❌ Bad: "PayPal order creation failed"
```

## 🐛 Common Issues & Solutions

### Issue: "YOUR_PAYPAL_CLIENT_ID" Error

**Cause:** Environment variable not set

**Solution:**
```bash
# Add to .env.local
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_actual_client_id
```

### Issue: CSP Blocking PayPal

**Cause:** Content Security Policy blocking PayPal scripts

**Solution:** ✅ Already fixed in `src/app/layout.js`

### Issue: Currency Not Supported

**Cause:** PayPal sandbox might not support your currency

**Solution:** ✅ Already fixed - now uses USD

### Issue: CORS Errors

**Cause:** Incorrect PayPal configuration or missing domains

**Solution:** Ensure these are in your CSP:
- `https://www.paypal.com`
- `https://*.paypal.com`
- `https://www.sandbox.paypal.com`

## 🧪 Testing PayPal Integration

### Test with Sandbox Accounts

1. Create a **Personal Sandbox Account** (buyer)
2. Use these test credentials:
   - Email: From PayPal sandbox account
   - Password: From PayPal sandbox account

### Test Payment Flow

1. Add items to cart
2. Click PayPal button
3. Log in with sandbox account
4. Complete payment
5. Verify order creation

## 📋 Expected Behavior

### Successful Flow:

1. **Frontend**: User clicks PayPal button
2. **API Call**: `/api/payments/paypal/create-order` returns `orderId`
3. **PayPal SDK**: Opens PayPal popup/redirect
4. **User**: Logs in and approves payment
5. **Callback**: `onApprove` called with order data
6. **API Call**: `/api/payments/paypal/verify` confirms payment
7. **Success**: Order created, user redirected to dashboard

### Error Indicators:

- ❌ No PayPal button appears → Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- ❌ Button appears but doesn't work → Check CSP headers
- ❌ Payment fails after approval → Check verification API
- ❌ Logger API errors → Check CSP and credentials

## 🔐 Security Notes

1. **Never commit `.env.local`** to version control
2. Use **Sandbox** credentials for development
3. Switch to **Live** credentials only in production
4. Rotate credentials regularly

## 📞 Still Having Issues?

1. Check browser console for errors
2. Check server terminal for errors
3. Verify PayPal sandbox status: https://status.paypal.com/
4. Test with a fresh sandbox account
5. Try in different browser/incognito mode

## 🔄 Next Steps After Fixing

Once working in development:

1. Test all payment scenarios
2. Test with different amounts
3. Test cancellation flow
4. Test error scenarios
5. Get production credentials
6. Update to `LiveEnvironment` for production

## Production Checklist

- [ ] Get PayPal Live credentials
- [ ] Update environment variables for production
- [ ] Change `SandboxEnvironment` to `LiveEnvironment`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Test thoroughly in production
- [ ] Set up payment failure monitoring
- [ ] Configure PayPal webhooks (optional)
