# Fix Spam Score (11% → Under 5%)

## ✅ Code Changes Complete

Updated email configuration with authentication headers and DKIM support.

## 🔧 DNS Records Required

Add these DNS records to your domain registrar (GoDaddy/Namecheap/etc):

### 1. SPF Record (TXT)

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com include:sendgrid.net ~all
TTL: 3600
```

**Replace sendgrid.net with your actual email provider:**

- Gmail/Google: `include:_spf.google.com`
- SendGrid: `include:sendgrid.net`
- Mailgun: `include:mailgun.org`
- AWS SES: `include:amazonses.com`

### 2. DMARC Record (TXT)

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@prepmantras.com; ruf=mailto:dmarc@prepmantras.com; fo=1
TTL: 3600
```

### 3. DKIM Record (CNAME or TXT)

Get this from your email provider:

- **Gmail**: Google Admin Console → Apps → Gmail → Authenticate email
- **SendGrid**: Settings → Sender Authentication → Domain Authentication
- **Mailgun**: Sending → Domains → DNS Records

Example DKIM record:

```
Type: TXT
Host: default._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
TTL: 3600
```

### 4. Reverse DNS (PTR Record)

Contact your email hosting provider to set up reverse DNS pointing to your domain.

## 📧 Email Content Improvements

### Avoid These (Spam Triggers):

- ❌ ALL CAPS text
- ❌ Excessive exclamation marks!!!
- ❌ Words: FREE, GUARANTEED, CLICK NOW, LIMITED TIME
- ❌ Too many links (>5 in one email)
- ❌ Red text or large fonts
- ❌ Misleading subject lines
- ❌ No unsubscribe link

### Use These Instead:

- ✅ Professional tone
- ✅ Clear subject lines
- ✅ Plain text version alongside HTML
- ✅ Unsubscribe link (already added)
- ✅ Physical address in footer
- ✅ Proper sender name
- ✅ Mobile-responsive design

## 🌐 Domain Reputation

### Check Your Domain:

1. **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Check SPF, DMARC, DKIM, Blacklist
2. **Mail Tester**: https://www.mail-tester.com/
   - Send test email to their address
   - Get detailed spam score report

3. **Google Postmaster**: https://postmaster.google.com/
   - Monitor sender reputation with Gmail

### Improve Sending Reputation:

- Start with low volume, increase gradually
- Monitor bounce rates (<2% is good)
- Remove invalid email addresses
- Avoid purchased email lists
- Ensure opt-in consent

## 🔐 Environment Variables

Add to your `.env.local`:

```env
DOMAIN_NAME=prepmantras.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[Your DKIM private key from email provider]
-----END PRIVATE KEY-----"
```

## ✅ Checklist

- [x] Updated nodemailer.js with headers
- [ ] Add SPF record to DNS
- [ ] Add DMARC record to DNS
- [ ] Add DKIM record to DNS (get from email provider)
- [ ] Set up reverse DNS with hosting provider
- [ ] Add DKIM keys to .env.local
- [ ] Test email at mail-tester.com
- [ ] Monitor MXToolbox for blacklists
- [ ] Remove spam trigger words from email templates
- [ ] Add company physical address to email footer

## 📊 Expected Results

After implementing all fixes:

- **Current**: 11% spam score
- **After DNS**: 3-5% spam score
- **Deliverability**: 95%+ inbox placement
- **Bounce Rate**: <2%

## 🚀 Quick Test

After DNS changes (wait 24-48 hours for propagation):

1. Visit https://www.mail-tester.com/
2. Send email to provided address
3. Check your score (should be 8-10/10)
4. Fix any remaining issues shown

## 📞 Need Help?

DNS propagation takes 24-48 hours. If spam score doesn't improve:

1. Verify all DNS records at MXToolbox
2. Check email provider's DKIM setup guide
3. Ensure your IP isn't blacklisted
4. Consider using a transactional email service (SendGrid, Mailgun, AWS SES)
