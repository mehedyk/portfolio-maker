# 🚀 Portfolio Builder - Deployment Guide

Complete guide to deploy your Portfolio Builder Platform to Vercel with Supabase backend.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase account (sign up at [supabase.com](https://supabase.com))
- Cloudinary account (sign up at [cloudinary.com](https://cloudinary.com))

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `portfolio-builder`
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** (bottom right)
7. You should see: "Success. No rows returned"

### 1.3 Get API Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### 1.4 Enable Email Confirmations

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, make sure **"Enable email confirmations"** is ON
3. Scroll down to **Email Templates** → **Confirm signup**
4. You can customize the email template if you want

---

## Step 2: Cloudinary Setup

### 2.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Verify your email

### 2.2 Create Upload Preset

1. Go to **Settings** (gear icon top right)
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **"Add upload preset"**
5. Configure:
   - **Preset name**: `portfolio-builder`
   - **Signing Mode**: **Unsigned**
   - **Folder**: `portfolio-builder`
6. Click **"Save"**

### 2.3 Get Credentials

1. Go back to **Dashboard**
2. Copy these values:
   - **Cloud name**: (shown at top)
   - **Upload preset**: `portfolio-builder` (what you just created)

---

## Step 3: Push Code to GitHub

### Option A: Using Git (If you have Git installed)

```bash
# Navigate to your project folder
cd k:\Own\portfolio-maker

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Portfolio Builder Platform"

# Create main branch
git branch -M main

# Add your GitHub repository (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/portfolio-maker.git

# Push to GitHub
git push -u origin main
```

### Option B: Using GitHub Web Interface (Easier)

1. Go to [github.com](https://github.com) and sign in
2. Click **"New repository"** (green button)
3. Repository name: `portfolio-maker`
4. Set to **Public**
5. **DON'T** check "Initialize with README"
6. Click **"Create repository"**
7. On your computer, compress the entire `portfolio-maker` folder as ZIP
8. On GitHub, click **"uploading an existing file"**
9. Drag and drop your ZIP file or select all files
10. Click **"Commit changes"**

---

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find your `portfolio-maker` repository
4. Click **"Import"**

### 4.2 Configure Build Settings

Vercel should auto-detect React. If not, set:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4.3 Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | Your Supabase Project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `REACT_APP_CLOUDINARY_UPLOAD_PRESET` | `portfolio-builder` |

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Click **"Visit"** to see your live site!

---

## Step 5: Create Admin Account

### 5.1 Sign Up

1. Go to your deployed site
2. Click **"Sign Up"**
3. Create your account (this will be your admin account)
4. Check your email and verify your account

### 5.2 Make Yourself Admin

1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. Select **user_profiles** table
4. Find your user row
5. Click on the **role** cell
6. Change from `user` to `admin`
7. Click the checkmark to save

### 5.3 Test Admin Access

1. Go back to your site
2. Login with your account
3. You should now see **"Admin Panel"** button in the dashboard
4. Click it to access admin features!

---

## Step 6: Test Everything

### ✅ Authentication
- [ ] Sign up with a new account
- [ ] Check email for verification
- [ ] Verify email and login

### ✅ Portfolio Creation
- [ ] Click "Create Portfolio"
- [ ] Select a profession
- [ ] Choose a theme
- [ ] Fill in your details
- [ ] Upload images
- [ ] Click "Publish" (uses 1 credit)

### ✅ Public Portfolio
- [ ] Visit `/p/yourusername`
- [ ] Portfolio displays correctly
- [ ] View count increases

### ✅ Credit System
- [ ] Try to publish another portfolio
- [ ] Should show "Insufficient credits"
- [ ] Go to "Buy Credits"
- [ ] Submit a test payment request

### ✅ Admin Panel
- [ ] Login as admin
- [ ] Go to Admin Panel
- [ ] See the payment request
- [ ] Approve it
- [ ] User should get credits

---

## 🎉 You're Done!

Your Portfolio Builder Platform is now live! Here's what you have:

- **Live URL**: `https://your-project.vercel.app`
- **Admin Panel**: `/admin`
- **Public Portfolios**: `/p/username`

---

## 🔧 Updating Your Site

Whenever you make changes to your code:

### If using Git:
```bash
git add .
git commit -m "Your update message"
git push
```

### If using GitHub web:
1. Go to your repository
2. Click "Add file" → "Upload files"
3. Upload changed files
4. Commit

**Vercel will automatically redeploy!** ⚡

---

## 💡 Tips

### Payment Methods
Update the payment numbers in `src/components/credits/BuyCredits.jsx`:
```javascript
<div className="payment-method">
  <strong>bKash:</strong> YOUR-BKASH-NUMBER
</div>
```

### Credit Pricing
Adjust prices in `src/components/credits/BuyCredits.jsx`:
```javascript
const creditPackages = [
  { credits: 1, price: 500, popular: false },
  { credits: 5, price: 2000, popular: true },
  { credits: 10, price: 3500, popular: false },
];
```

### Email Templates
Customize Supabase email templates:
- Supabase Dashboard → Authentication → Email Templates

---

## 🐛 Troubleshooting

### Build fails on Vercel
- Check environment variables are set correctly
- Make sure all dependencies are in `package.json`

### Can't login after signup
- Check Supabase email settings
- Look in spam folder for verification email
- Check Supabase logs: Authentication → Logs

### Images not uploading
- Verify Cloudinary upload preset is "Unsigned"
- Check cloud name and preset name in environment variables

### Admin panel not accessible
- Make sure you changed role to 'admin' in Supabase
- Refresh the page after changing role

---

## 📞 Need Help?

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

**Made with ❤️ by Team Galacticos**
