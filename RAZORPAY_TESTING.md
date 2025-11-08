# 🔍 Razorpay Integration Testing Guide

## ✅ PayPal is Working - Focus on Razorpay!

Since PayPal is already working, this guide focuses solely on fixing and testing Razorpay.

---

## 🧪 Test Your Razorpay Credentials

Run this command to test if your Razorpay credentials are valid:

```bash
node test-razorpay-credentials.js
```

---

## 📊 Expected Results

### ✅ **If Credentials Are Valid:**

```
=============================================================
📋 Environment Variables Check:
-------------------------------------------------------------
✅ RAZORPAY_KEY_ID: rzp_test_7kAotmP1o8JR8V
✅ RAZORPAY_KEY_SECRET: jPBuKq2CqukA...***
✅ NEXT_PUBLIC_RAZORPAY_KEY_ID: rzp_test_7kAotmP1o8JR8V

🔗 Credential Consistency Check:
-------------------------------------------------------------
✅ Key IDs match between backend and frontend

🔌 Testing Razorpay API Connection...
-------------------------------------------------------------
✅ Razorpay client created successfully

💰 Creating test order...
✅ Test order created successfully!
   Order ID: order_XXXXXXXXXXXX
   Status: created
   Amount: 1 INR
   Receipt: test_receipt_1234567890

=============================================================
🎉 SUCCESS! Your Razorpay credentials are valid!
=============================================================

✅ Your Razorpay integration should work now.
✅ Make sure your dev server is restarted: npm run dev
```

**Action:** If you see this, just restart server and test in browser!

---

### ❌ **If Credentials Are Invalid:**

```
=============================================================
❌ FAILED! Razorpay credentials test failed
=============================================================

📋 Error Details:
-------------------------------------------------------------
Error Message: The api key provided is invalid
Status Code: 401

💡 Possible Solutions:
-------------------------------------------------------------
❌ Authentication failed!

   Your credentials are invalid. Please:
   1. Go to: https://dashboard.razorpay.com/app/keys
   2. Select "Test Mode" (toggle in top-left)
   3. Copy "Key ID" (starts with rzp_test_...)
   4. Click "Generate Key Secret" if needed
   5. Copy "Key Secret"
   6. Update .env.local
   7. Restart dev server: npm run dev
```

**Action:** Get fresh credentials from Razorpay dashboard.

---

## 🔧 How to Get Razorpay Credentials

### Step 1: Go to Razorpay Dashboard
https://dashboard.razorpay.com/app/keys

### Step 2: Select Test Mode
- Look for the toggle in the **top-left** corner
- Make sure it says **"Test Mode"** (not "Live Mode")

### Step 3: Get Credentials
- **Key ID:** Visible on the page (starts with `rzp_test_`)
- **Key Secret:** Click "Generate Key Secret" or "Regenerate"
  - Click "Download Key Details" if needed
  - Copy the secret (you won't see it again!)

### Step 4: Update `.env.local`

```bash
RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
RAZORPAY_KEY_SECRET=jPBuKq2CqukA4JxOXKfp8QU7
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
```

**Important:**
- Use **same Key ID** for both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- No quotes needed
- No spaces around `=`

### Step 5: Restart Server

```bash
npm run dev
```

### Step 6: Run Test Again

```bash
node test-razorpay-credentials.js
```

---

## 🎯 Complete Testing Workflow

### 1. **Test Credentials First**
```bash
node test-razorpay-credentials.js
```

### 2. **If Test Passes:**
- Restart server: `npm run dev`
- Clear browser cache
- Go to cart: `http://localhost:3000/cart`
- Click "Pay with Razorpay"
- Should open Razorpay modal ✅

### 3. **If Test Fails:**
- Get new credentials from dashboard
- Update `.env.local`
- Run test again

---

## 🔍 What the Test Script Checks

1. ✅ **Environment variables exist**
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`

2. ✅ **Credentials match**
   - Backend and frontend use same Key ID

3. ✅ **API connection works**
   - Creates test order
   - Verifies API access

4. ✅ **Credentials are valid**
   - No authentication errors
   - Can read/write orders

---

## 🐛 Common Issues

### Issue 1: "Authentication failed"

**Cause:** Invalid or expired credentials

**Solution:**
1. Regenerate credentials in Razorpay dashboard
2. Make sure you're in **Test Mode**
3. Copy new credentials to `.env.local`
4. Restart server

---

### Issue 2: "RAZORPAY_KEY_ID: NOT SET"

**Cause:** Environment variable not in `.env.local`

**Solution:**
1. Check if `.env.local` exists in project root
2. Add the missing variable
3. Restart server

---

### Issue 3: "Key IDs do NOT match"

**Cause:** Different values for `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`

**Solution:**
```bash
# Both should have the SAME value
RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
```

---

### Issue 4: "Network error"

**Cause:** Cannot connect to Razorpay servers

**Solution:**
1. Check internet connection
2. Check firewall/antivirus
3. Disable VPN if using one
4. Check corporate proxy settings

---

## 📋 Current `.env.local` Status

Your current Razorpay credentials:
```bash
RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
RAZORPAY_KEY_SECRET=jPBuKq2CqukA4JxOXKfp8QU7
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_7kAotmP1o8JR8V
```

These look correct! Run the test to verify they work.

---

## ✅ Expected Browser Behavior

After credentials are valid and server is restarted:

### When You Click "Pay with Razorpay":

1. ✅ Razorpay modal opens
2. ✅ Shows payment options (UPI, Cards, NetBanking, Wallets)
3. ✅ No CSP errors in console
4. ✅ Tracking requests to `lumberjack.razorpay.com` (normal!)
5. ✅ Can complete test payment

### Browser Console Should Show:

```
✅ Using Razorpay Key: rzp_test_7...
(No red errors)
```

### Network Tab Should Show:

```
✅ checkout.razorpay.com - 200 OK
✅ lumberjack.razorpay.com/v1/track - 200 OK (analytics - normal!)
✅ api.razorpay.com - 200 OK
✅ /api/payments/razorpay/create-order - 200 OK
```

---

## 🚀 Quick Start

```bash
# 1. Test credentials
node test-razorpay-credentials.js

# 2. If test passes, restart server
npm run dev

# 3. Test in browser
# Go to: http://localhost:3000/cart
# Click: "Pay with Razorpay"
# Complete: Test payment
```

---

## 📞 Still Not Working?

After running the test and following the steps, if Razorpay still doesn't work:

**Share these details:**

1. **Output of test script** (full output)
2. **Browser console errors** (if any)
3. **Network tab failures** (status codes)
4. **Error messages shown to user**

But the test script should tell you exactly what's wrong! 🎯

---

## 🎉 Summary

| Step | Command | Expected Result |
|------|---------|-----------------|
| 1. Test | `node test-razorpay-credentials.js` | ✅ Success message |
| 2. Restart | `npm run dev` | Server starts |
| 3. Test in browser | Click Razorpay button | Modal opens |

**Run the test now and share the output!** 🚀
