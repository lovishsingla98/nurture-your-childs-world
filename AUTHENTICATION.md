# Authentication System Documentation

This document describes the Firebase Authentication implementation with Google Gmail provider for the Nurture website.

## 🔐 **Authentication Features**

### **Provider**: Google Gmail
- One-click sign-in with Google account
- Automatic token management
- Secure authentication flow
- Email verification support

### **User Experience**
- Seamless login/logout
- Persistent sessions
- Loading states and error handling
- Responsive design

## 🏗️ **Architecture**

### **Components Structure**
```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── components/
│   └── auth/
│       ├── LoginButton.tsx      # Google sign-in button
│       ├── UserProfile.tsx      # User profile dropdown
│       ├── AuthWrapper.tsx      # Authentication wrapper
│       └── ProtectedRoute.tsx   # Route protection
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   └── api.ts                   # Authenticated API client
└── pages/
    └── Dashboard.tsx            # Protected dashboard page
```

## 🔧 **Configuration**

### **Firebase Setup**
The authentication is configured in `src/lib/firebase.ts`:

```typescript
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
```

### **Environment Variables**
Required environment variables in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📱 **Components**

### **AuthContext**
Provides authentication state and methods throughout the app:

```typescript
const { user, loading, signInWithGoogle, logout } = useAuth();
```

**Features:**
- User state management
- Loading states
- Google sign-in
- Logout functionality
- Token management

### **LoginButton**
Google sign-in button with loading states and error handling:

```typescript
<LoginButton variant="default" size="lg">
  Sign in with Google
</LoginButton>
```

**Features:**
- Google branding
- Loading spinner
- Error handling
- Customizable styling

### **UserProfile**
User profile dropdown with logout functionality:

```typescript
<UserProfile />
```

**Features:**
- User avatar
- Display name and email
- Logout option
- Loading states

### **AuthWrapper**
Conditional rendering based on authentication state:

```typescript
<AuthWrapper requireAuth={true}>
  <ProtectedContent />
</AuthWrapper>
```

### **ProtectedRoute**
Route protection with login redirect:

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🔗 **API Integration**

### **Authenticated API Client**
The `src/lib/api.ts` automatically includes authentication tokens:

```typescript
// Automatically includes Bearer token
const response = await apiClient.getUserProfile();
```

**Features:**
- Automatic token inclusion
- Error handling
- Type-safe responses
- Centralized API management

### **Token Management**
- Tokens stored in localStorage
- Automatic token refresh
- Secure token handling

## 🛡️ **Security**

### **Token Security**
- Firebase ID tokens for authentication
- Automatic token validation
- Secure token storage
- Token refresh handling

### **Route Protection**
- Protected routes require authentication
- Automatic redirect to login
- Session persistence

## 🎨 **UI/UX Features**

### **Loading States**
- Spinner animations
- Disabled buttons during loading
- Smooth transitions

### **Error Handling**
- User-friendly error messages
- Toast notifications
- Graceful fallbacks

### **Responsive Design**
- Mobile-friendly components
- Adaptive layouts
- Touch-friendly interactions

## 📊 **User Flow**

### **Sign In Flow**
1. User clicks "Sign in with Google"
2. Google popup opens
3. User authenticates with Google
4. Firebase creates/updates user account
5. ID token stored in localStorage
6. User redirected to dashboard

### **Sign Out Flow**
1. User clicks profile dropdown
2. User clicks "Sign out"
3. Firebase signs out user
4. Token removed from localStorage
5. User redirected to home page

### **Protected Route Flow**
1. User navigates to protected route
2. AuthContext checks authentication
3. If authenticated: show content
4. If not authenticated: show login page

## 🔄 **State Management**

### **Authentication State**
```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
}
```

### **User Object**
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}
```

## 🚀 **Usage Examples**

### **Basic Authentication Check**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.displayName}!</div>;
};
```

### **Protected Component**
```typescript
import { AuthWrapper } from '@/components/auth/AuthWrapper';

const ProtectedComponent = () => (
  <AuthWrapper requireAuth={true}>
    <div>This content requires authentication</div>
  </AuthWrapper>
);
```

### **Conditional Rendering**
```typescript
import { AuthButtons } from '@/components/auth/AuthWrapper';

const Header = () => (
  <header>
    <AuthButtons />
  </header>
);
```

## 🧪 **Testing**

### **Development Testing**
1. Start the development server
2. Click "Sign in with Google" in header
3. Complete Google authentication
4. Verify user profile appears
5. Test dashboard access
6. Test logout functionality

### **Production Testing**
1. Deploy to production
2. Test authentication flow
3. Verify token management
4. Test protected routes
5. Verify error handling

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Popup Blocked**
- Solution: Allow popups for the site
- Fallback: Manual redirect flow

**2. Token Expired**
- Solution: Automatic token refresh
- Fallback: Re-authentication

**3. Network Errors**
- Solution: Check Firebase configuration
- Fallback: Offline mode

### **Debug Steps**
1. Check browser console for errors
2. Verify Firebase configuration
3. Check environment variables
4. Test authentication flow
5. Verify API endpoints

## 📈 **Future Enhancements**

### **Planned Features**
- Email/password authentication
- Phone number authentication
- Social media providers (Facebook, Apple)
- Multi-factor authentication
- Account linking
- Profile management

### **Security Improvements**
- Token encryption
- Session management
- Rate limiting
- Audit logging

## 🔗 **Related Documentation**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Google Identity Platform](https://developers.google.com/identity)
- [React Context API](https://react.dev/reference/react/createContext)
- [Protected Routes](https://reactrouter.com/en/main/start/concepts#protected-routes)
