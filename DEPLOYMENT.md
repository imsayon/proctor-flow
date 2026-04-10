# PrctorFlow - Production Deployment Guide

## Project Setup

This is a production-ready deployment of PrctorFlow, an Exam Duty & Seating Allocation System built with:

- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Auth**: Dummy auth with role-based access (Admin, Faculty, Student, Other)

## Production Features

✅ **Optimized Build** - Code splitting, minification, console removal  
✅ **Environment Configuration** - Separate .env files for dev/production  
✅ **Production Deployment** - Firebase Hosting with SPA routing  
✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options  
✅ **Performance** - Lazy loading, vendor chunking, sourcemap disabled

## Deployment URL

**Live Application**: https://your-firebase-project.web.app

To update the URL:

1. Deploy to Firebase: `npm run deploy`
2. Check your Firebase Console for the hosting URL

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build for development
npm run lint             # Run ESLint
npm run deploy           # Build & deploy to Firebase
npm run deploy:hosting   # Deploy only hosting (no functions)
npm run serve:dist       # Preview production build locally
```

## Environment Variables

### .env.production

```
VITE_APP_NAME=ProctorFlow
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### .env.development

```
VITE_APP_NAME=ProctorFlow Dev
VITE_APP_VERSION=1.0.0-dev
VITE_ENVIRONMENT=development
```

## Roles & Access

1. **Admin** - Full system access, manage all resources
2. **Faculty** - Read-only access to assignments and student schedules
3. **Student** - Check seating arrangements and exam schedules
4. **Other** - Limited access user

## Getting Started

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase login
npm run deploy
```

## Firebase Configuration

Ensure you have:

1. `.firebaserc` configured with your project
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Firebase project created in Google Cloud Console

## Production Checklist

- [x] Dummy auth configured
- [x] Build optimizations enabled
- [x] Environment variables configured
- [x] Security headers configured
- [x] SPA routing configured
- [x] Code splitting enabled
- [x] Console logging removed in production
- [ ] Custom domain configured (optional)
- [ ] CORS policies configured (if needed)
- [ ] Rate limiting configured (optional)

## Monitoring

Monitor your production deployment via:

- Firebase Console: https://console.firebase.google.com
- Cloud Logging: View logs for any errors
- Performance Insights: Check Core Web Vitals

## Support

For issues or questions, refer to:

- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-10
