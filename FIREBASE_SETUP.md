# Firebase Firestore Integration Setup

This guide will help you set up Firebase Firestore to store waitlist and feedback data for your website deployed on GCP EC2.

## Prerequisites

- A Google Cloud Platform account
- A Firebase project (can be the same as your GCP project)
- Your website already deployed on GCP EC2

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional but recommended)

## Step 2: Set up Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll set up proper rules later)
4. Select a region close to your EC2 instance (e.g., us-central1)
5. Click "Done"

## Step 3: Create a Web App

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register your app with a nickname (e.g., "Nurture Website")
5. Copy the configuration object

## Step 4: Configure Environment Variables

1. Copy `firebase.env.example` to `.env` in your project root
2. Fill in the values from your Firebase config:

```bash
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

## Step 5: Set up Firestore Security Rules

1. In Firebase Console, go to "Firestore Database" > "Rules"
2. Replace the default rules with the content from `firestore.rules.example`
3. Click "Publish"

## Step 6: Deploy to EC2

### Option A: Environment Variables on EC2

1. SSH into your EC2 instance
2. Navigate to your project directory
3. Create the `.env` file with your Firebase config
4. Rebuild and restart your application

### Option B: Using PM2 Ecosystem (Recommended)

Create an `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [{
    name: 'nurture-website',
    script: 'serve',
    args: 'dist -s -l 3000',
    env: {
      VITE_FIREBASE_API_KEY: 'your_actual_api_key',
      VITE_FIREBASE_AUTH_DOMAIN: 'your_project_id.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'your_actual_project_id',
      VITE_FIREBASE_STORAGE_BUCKET: 'your_project_id.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'your_actual_sender_id',
      VITE_FIREBASE_APP_ID: 'your_actual_app_id'
    }
  }]
};
```

Then deploy:
```bash
npm run build
pm2 start ecosystem.config.js
```

## Step 7: Test the Integration

1. Visit your website
2. Try submitting the waitlist form
3. Try submitting feedback
4. Check Firebase Console > Firestore Database to see the data

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to Firebase Authentication domains
2. **Permission Denied**: Check your Firestore rules
3. **Environment Variables Not Loading**: Ensure `.env` file is in the project root and properly formatted

### Fallback Behavior

The forms are designed with fallback behavior:
- If Firestore is unavailable, data will be saved to localStorage
- Users will still see success messages
- You can retrieve localStorage data for manual processing

### Monitoring

1. Go to Firebase Console > Firestore Database > "Data" tab
2. You should see two collections: `waitlist` and `feedback`
3. Each document will have a timestamp and the form data

## Security Notes

- The current setup allows public write access to waitlist and feedback collections
- Data is write-only (users cannot read existing entries)
- For admin access, consider setting up Firebase Admin SDK
- Monitor usage in Firebase Console to prevent abuse

## Cost Considerations

- Firestore has a generous free tier (50,000 reads/writes per day)
- Each form submission counts as 1 write operation
- Current usage should stay well within free limits

## Next Steps

1. Set up Firebase Admin SDK for data access
2. Create admin dashboard to view submissions
3. Set up email notifications for new submissions
4. Implement data export functionality 