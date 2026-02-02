# Portfolio Builder Platform

A credit-based SaaS platform for creating professional portfolio websites without coding knowledge.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Run Development Server
```bash
npm start
```

Visit `http://localhost:3000`

## 📦 Tech Stack

- **Frontend**: React, CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Image Hosting**: Cloudinary
- **Deployment**: Vercel

## 🎯 Features

- ✅ User authentication with email verification
- ✅ Profession-specific portfolio templates
- ✅ 8 beautiful themes (2 free, 6 premium)
- ✅ Credit-based publishing system
- ✅ Image upload via Cloudinary
- ✅ Public portfolio URLs (`/p/username`)
- ✅ Admin panel for payment approval
- ✅ Portfolio analytics (view counter)

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Complete deployment instructions
- **[Database Schema](./supabase-schema.sql)** - Supabase SQL schema

## 🏗️ Project Structure

```
portfolio-maker/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/          # Login, Signup, Protected Routes
│   │   ├── builder/       # Portfolio Builder
│   │   ├── portfolio/     # Public Portfolio Viewer
│   │   ├── dashboard/     # User Dashboard
│   │   ├── credits/       # Buy Credits
│   │   └── admin/         # Admin Panel
│   ├── context/           # Auth Context
│   ├── services/          # Supabase, Cloudinary
│   ├── pages/             # Landing Page
│   └── App.jsx
├── supabase-schema.sql    # Database schema
├── DEPLOYMENT.md          # Deployment guide
└── package.json
```

## 💳 Credit System

- Users get **1 free credit** on signup
- **1 credit = 1 published portfolio**
- Users can buy more credits
- Admin manually approves payments

## 🔐 Admin Access

1. Sign up for an account
2. Go to Supabase → Table Editor → `user_profiles`
3. Change your `role` from `user` to `admin`
4. Access admin panel at `/admin`

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick deploy to Vercel:
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

## 👥 Team

- **S.M. Mehedy Kawser** - Frontend Lead
- **Ashiq** - Backend Lead
- **Jubayer** - Full-Stack Developer

**Academic Project**
- Institution: Daffodil International University
- Course: SE 331 - Software Engineering Design Capstone Project
- Semester: Spring 2026

## 📄 License

All rights reserved. Will be licensed under MIT after project completion.

---

**Built with ❤️ by Team Galacticos**