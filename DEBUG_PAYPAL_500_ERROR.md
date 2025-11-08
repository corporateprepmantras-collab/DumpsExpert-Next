# Debugging PayPal 500 Error

## 🔴 Current Issue
Getting HTTP 500 error when calling `/api/payments/paypal/create-order`

## 🔍 What This Means
The server is receiving the request but failing to process it. This is usually due to:
1. **Missing PayPal credentials** (most common)
2. **Invalid PayPal credentials**
3. **Server configuration issue**

## ✅ Step-by-Step Debugging

### Step 1: Check Your Terminal (Server Logs)

After clicking the PayPal button, look at your **terminal where `npm run dev` is running**.

You should see logs like this:

#### ✅ Good (Working):
```
📥 PayPal order creation request: { amount: 10, currency: 'USD', userId: '...' }
✅ PayPal credentials found, creating environment...
✅ PayPal client created, preparing order request...
📤 Sending request to PayPal...
✅ PayPal order created successfully: { orderId: '...', status: '...' }
```

#### ❌ Bad (Credentials Missing):
```
📥 PayPal order creation request: { amount: 10, currency: 'USD', userId: '...' }
❌ PayPal credentials not configured: { hasClientId: false, hasClientSecret: false }
```

#### ❌ Bad (Invalid Credentials):
```
📥 PayPal order creation request: { amount: 10, currency: 'USD', userId: '...' }
✅ PayPal credentials found, creating environment...
✅ PayPal client created, preparing order request...
📤 Sending request to PayPal...
❌ PayPal order creation failed:
   Error name: AuthenticationError
   Error message: Authentication failed
```

---

### Step 2: Fix Based on Error Message

#### Issue A: "PayPal credentials not configured"

**This means:** `.env.local` is missing or credentials not set

**Fix:**

1. Check if `.env.local` file exists:
```bash
ls -la .env.local
```

2. Check if credentials are in the file:
```bash
cat .env.local | grep PAYPAL
```

Should show:
```
PAYPAL_CLIENT_ID=AYour...ClientID...Here
PAYPAL_CLIENT_SECRET=EYour...Secret...Here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYour...ClientID...Here
```

3. If missing, add them:
```bash
# Open .env.local in editor
nano .env.local

# Or use echo to append
echo "PAYPAL_CLIENT_ID=your_client_id" >> .env.local
echo "PAYPAL_CLIENT_SECRET=your_secret" >> .env.local
echo "NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id" >> .env.local
```

4. **IMPORTANT:** Restart your dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

#### Issue B: "Authentication failed" or 401 Error

**This means:** Credentials are set but invalid

**Possible causes:**
- Using **Live** credentials instead of **Sandbox**
- Typo in credentials
- Extra spaces in credentials
- Credentials expired or revoked

**Fix:**

1. Go to PayPal Developer Dashboard:
   https://developer.paypal.com/dashboard/

2. Navigate to: **Apps & Credentials**

3. Select: **Sandbox** tab (NOT Live!)

4. Click on your app or create new one

5. Copy credentials carefully:
   - Click "Show" next to Secret
   - Copy WITHOUT extra spaces
   - Make sure no line breaks

6. Update `.env.local`:
```bash
PAYPAL_CLIENT_ID=AYourClientIDHere
PAYPAL_CLIENT_SECRET=EYourSecretHere
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYourClientIDHere
```

7. Restart server

---

#### Issue C: Other Errors

**Check terminal logs for specific error message.**

Common issues:
- Network/firewall blocking PayPal API
- Invalid amount format
- PayPal API temporarily down

---

### Step 3: Verify Credentials Format

#### Valid Sandbox Client ID Format:
```
AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS
```
- Starts with 'A'
- About 80 characters long
- Mix of letters, numbers, hyphens

#### Valid Sandbox Secret Format:
```
EHlz4mrDnuPo1UvzFhxK6VH5kqNfwR3yxC2sWc-bNFPQj3UGl8m5XkBrPaGq
```
- Starts with 'E'
- About 80 characters long
- Mix of letters, numbers, hyphens

---

### Step 4: Test Credentials

Run this command to check environment variables:

```bash
# In project root
node -e "require('dotenv').config({path:'.env.local'}); console.log('Client ID:', process.env.PAYPAL_CLIENT_ID ? 'SET ✓' : 'MISSING ✗'); console.log('Secret:', process.env.PAYPAL_CLIENT_SECRET ? 'SET ✓' : 'MISSING ✗'); console.log('Public ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'SET ✓' : 'MISSING ✗');"
```

Should output:
```
Client ID: SET ✓
Secret: SET ✓
Public ID: SET ✓
```

---

### Step 5: Create Test Sandbox Account

If credentials are correct but still failing, create a fresh sandbox account:

1. Go to: https://developer.paypal.com/dashboard/accounts

2. Click: **Create Account**

3. Settings:
   - Account Type: **Business**
   - Email: `test-business@example.com`
   - Password: Choose secure password
   - PayPal Balance: $1000 (or any amount)

4. Also create a **Personal** account for testing payments

5. Test payment flow with these accounts

---

## 🧪 Quick Test

After fixing credentials, test with curl:

```bash
curl -X POST http://localhost:3000/api/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "currency": "USD", "userId": "test123"}'
```

#### Expected Response (Success):
```json
{
  "success": true,
  "orderId": "7XX123456X789XXXX"
}
```

#### Expected Response (No Credentials):
```json
{
  "error": "PayPal is not configured on the server",
  "hint": "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local"
}
```

---

## 📋 Checklist

- [ ] `.env.local` file exists
- [ ] `PAYPAL_CLIENT_ID` is set
- [ ] `PAYPAL_CLIENT_SECRET` is set
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- [ ] Using **Sandbox** credentials (not Live)
- [ ] No extra spaces in credentials
- [ ] Dev server restarted after adding credentials
- [ ] Browser cache cleared
- [ ] Terminal shows no error logs

---

## 🎯 Most Common Solution

**99% of 500 errors are due to missing credentials.**

1. Add credentials to `.env.local`
2. Restart dev server
3. Try again

---

## 📞 Still Not Working?

**Share these details:**

1. Output of terminal logs (copy/paste the emoji logs)
2. Response from browser network tab
3. Output of this command:
```bash
cat .env.local | grep PAYPAL | sed 's/=.*/=***HIDDEN***/'
```

This will show if variables are set without revealing actual values.
