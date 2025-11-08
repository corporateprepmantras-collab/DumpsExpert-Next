# 🔍 Check Your PayPal Configuration

## What You Need to Do RIGHT NOW

### Step 1: Check Your Terminal

Look at the terminal where you ran `npm run dev`. After clicking the PayPal button, you should see logs starting with emojis.

**Copy and paste EVERYTHING you see with these emojis:**
- 📥
- ✅
- ❌
- 📤

---

### Step 2: Check Your Browser Console

Open browser DevTools (F12), go to Console tab, and look for logs with emojis.

**You should see something like:**

```
🔵 Creating PayPal order: { amount: 10, userId: '...' }
❌ PayPal order creation failed: Error: Request failed with status code 500
❌ Error details: { 
  status: 500, 
  errorMessage: "...",
  hint: "..."
}
```

**Copy the "hint" message** - it tells you exactly what's wrong!

---

### Step 3: Most Likely Issue - Missing Credentials

The 500 error almost always means PayPal credentials are not set in `.env.local`.

#### Check if `.env.local` exists:

**Windows (PowerShell):**
```powershell
Get-Content .env.local | Select-String "PAYPAL"
```

**Windows (CMD):**
```cmd
type .env.local | findstr PAYPAL
```

**Linux/Mac:**
```bash
cat .env.local | grep PAYPAL
```

#### Expected Output:
```
PAYPAL_CLIENT_ID=AYour...Long...ClientID
PAYPAL_CLIENT_SECRET=EYour...Long...Secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYour...Long...ClientID
```

#### If You See Nothing or File Not Found:

**You need to create `.env.local`!**

1. Create the file in project root (same folder as `package.json`)
2. Add these lines:

```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
```

3. Get credentials from: https://developer.paypal.com/dashboard/
   - Go to "Apps & Credentials"
   - Select "Sandbox" tab
   - Create or select app
   - Copy Client ID and Secret

4. **RESTART SERVER:**
```bash
npm run dev
```

---

### Step 4: Test Again

After adding credentials and restarting:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload page
3. Click PayPal button
4. Watch terminal and browser console for NEW logs

---

## Quick Diagnostic Commands

### Check Environment Variables (Node.js):

```bash
node -e "console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '✓ SET' : '✗ MISSING');"
```

**Note:** This won't work because Next.js loads `.env.local` separately. Just check the file directly.

---

## What to Report Back

Please share:

1. **Terminal output** (with 📥, ✅, ❌ emojis)
2. **Browser console error details** (the object with status, errorMessage, hint)
3. **Output of** checking `.env.local` file (hide actual values)
4. **Does `.env.local` file exist?** Yes/No

---

## Example of What I Need to See

**From Terminal:**
```
📥 PayPal order creation request: { amount: 10, currency: 'USD', userId: '123' }
❌ PayPal credentials not configured: { hasClientId: false, hasClientSecret: false }
```

**From Browser Console:**
```
❌ Error details: {
  status: 500,
  errorMessage: "PayPal is not configured on the server",
  hint: "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local"
}
```

This will tell me EXACTLY what's wrong!

---

## Common Issues and Solutions

### Issue: "Cannot read .env.local"
**Solution:** File doesn't exist. Create it.

### Issue: Variables not loading
**Solution:** Restart dev server after adding variables.

### Issue: Still 500 error after adding credentials
**Solution:** Credentials might be invalid. Check they're from Sandbox, not Live.

---

## Still Stuck?

Run this and share output:

**Windows:**
```powershell
Write-Host "File exists:" (Test-Path .env.local)
If (Test-Path .env.local) { Get-Content .env.local | Select-String "PAYPAL" | ForEach-Object { $_ -replace '=.*','=***HIDDEN***' } }
```

**Linux/Mac:**
```bash
echo "File exists: $(test -f .env.local && echo 'YES' || echo 'NO')"
test -f .env.local && cat .env.local | grep PAYPAL | sed 's/=.*/=***HIDDEN***/'
```

This shows if credentials are set without revealing actual values.
