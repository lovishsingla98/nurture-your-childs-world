# API Integration Documentation

This document explains how the website is now integrated with the production Firebase Cloud Functions APIs.

## 🔗 **Production API Endpoints**

The website now uses these production endpoints instead of direct Firestore calls:

### **Base URL**: `https://us-central1-nurture-466617.cloudfunctions.net/api`

### **Waitlist APIs**
- `POST /waitlist/add` - Add waitlist entry
- `GET /waitlist/entries` - Get all waitlist entries
- `GET /waitlist/count` - Get waitlist count

### **Feedback APIs**
- `POST /feedback/add` - Add feedback entry
- `GET /feedback/entries` - Get all feedback entries
- `GET /feedback/count` - Get feedback count

## 📝 **Updated Functions in `src/lib/firestore.ts`**

### **Waitlist Functions**
```typescript
// Add waitlist entry
export const addWaitlistEntry = async (data: Omit<WaitlistEntry, 'timestamp'>): Promise<DocumentReference>

// Get waitlist entries (optional limit)
export const getWaitlistEntries = async (limit?: number): Promise<WaitlistEntry[]>

// Get waitlist count
export const getWaitlistCount = async (): Promise<number>
```

### **Feedback Functions**
```typescript
// Add feedback entry
export const addFeedbackEntry = async (data: Omit<FeedbackEntry, 'timestamp'>): Promise<DocumentReference>

// Get feedback entries (optional limit)
export const getFeedbackEntries = async (limit?: number): Promise<FeedbackEntry[]>

// Get feedback count
export const getFeedbackCount = async (): Promise<number>
```

## 🔄 **What Changed**

### **Before (Direct Firestore)**
- Website directly accessed Firebase Firestore
- No server-side validation
- Limited error handling
- No centralized data management

### **After (Production APIs)**
- Website calls Firebase Cloud Functions APIs
- Server-side validation and error handling
- Centralized data management
- Better security and scalability
- Consistent response format

## 🧪 **Testing the Integration**

### **Test Waitlist Form**
1. Go to the website
2. Find the waitlist form
3. Fill in the required fields (name, email)
4. Submit the form
5. Check browser console for success message
6. Verify data is stored in Firebase

### **Test Feedback Form**
1. Go to the website
2. Find the feedback form
3. Fill in the message field (required)
4. Optionally add name and email
5. Submit the form
6. Check browser console for success message
7. Verify data is stored in Firebase

## 🛠️ **Error Handling**

The new API integration includes proper error handling:

```typescript
try {
  const result = await addWaitlistEntry(data);
  // Success - show success message
} catch (error) {
  // Error - show error message to user
  console.error('Error:', error.message);
}
```

## 📊 **Data Structure**

### **Waitlist Entry**
```typescript
interface WaitlistEntry {
  name: string;        // Required
  email: string;       // Required
  age?: string;        // Optional
  interests?: string;  // Optional
  timestamp?: any;     // Auto-generated
}
```

### **Feedback Entry**
```typescript
interface FeedbackEntry {
  name?: string;       // Optional
  email?: string;      // Optional
  message: string;     // Required
  timestamp?: any;     // Auto-generated
}
```

## 🔧 **Development vs Production**

### **Development (Local)**
- Uses Firebase emulator
- Direct Firestore access
- Local testing

### **Production (Deployed)**
- Uses Firebase Cloud Functions
- API-based access
- Production data storage

## 📈 **Benefits**

1. **Security**: Server-side validation and authentication
2. **Scalability**: Cloud Functions can handle high traffic
3. **Consistency**: Standardized API responses
4. **Monitoring**: Better logging and error tracking
5. **Maintenance**: Centralized code management

## 🚀 **Next Steps**

1. **Test Forms**: Verify both waitlist and feedback forms work
2. **Monitor Logs**: Check Firebase Console for any issues
3. **Performance**: Monitor API response times
4. **Analytics**: Track form submissions and success rates

## 🔍 **Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Check if API allows cross-origin requests
2. **Network Errors**: Verify API endpoint is accessible
3. **Validation Errors**: Check required fields are provided
4. **Rate Limiting**: Monitor API usage limits

### **Debug Steps**
1. Check browser console for errors
2. Verify API endpoint URLs are correct
3. Test API endpoints directly with curl/Postman
4. Check Firebase Console for function logs
