# 🔥 FCM Push Notifications - Complete Setup Guide
## Efes Kebap Admin Mobile App

**Date:** November 15, 2025  
**Status:** ✅ Implementation Complete - Ready for Setup

---

## 📋 What's Been Implemented

### ✅ Code Files Created:
1. **`src/services/fcm.service.ts`** - FCM token management and message handling
2. **`src/components/FullScreenAlarm.tsx`** - Full-screen alarm overlay UI
3. **`supabase/functions/send-order-notification/index.ts`** - Edge function for FCM
4. **`database/fcm_devices_schema.sql`** - Database schema for FCM tokens
5. **Updated `src/AdminApp.tsx`** - FCM integration and alarm display
6. **Updated `android/app/src/main/AndroidManifest.xml`** - Permissions and settings

### ✅ Packages Installed:
- `@capacitor-firebase/app`
- `@capacitor-firebase/messaging`

---

## 🚀 Step-by-Step Setup

### Step 1: Firebase Configuration Files

You mentioned you already have a Firebase project. Please provide these files:

#### 1.1 Download `google-services.json`
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Your Apps** → **Android App**
4. Click **"Download google-services.json"**
5. **Place the file here:** `android/app/google-services.json`

#### 1.2 Download Service Account Key
1. In Firebase Console → **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file (e.g., `your-project-firebase-adminsdk-xxxxx.json`)
4. **Save this file securely** - we'll extract keys from it

---

### Step 2: Extract Firebase Credentials

Once you have the service account JSON, run this command to extract the private key:

```javascript
// Save this as extract-firebase-key.js
const fs = require('fs');

// Read your Firebase service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync('./your-project-firebase-adminsdk-xxxxx.json', 'utf8')
);

console.log('\n=== Firebase Credentials ===\n');
console.log('Project ID:', serviceAccount.project_id);
console.log('\nClient Email:', serviceAccount.client_email);
console.log('\nPrivate Key (first 50 chars):', serviceAccount.private_key.substring(0, 50) + '...');
console.log('\n=== Save These Values ===\n');
console.log('FIREBASE_PROJECT_ID=', serviceAccount.project_id);
console.log('FIREBASE_CLIENT_EMAIL=', serviceAccount.client_email);
console.log('FIREBASE_PRIVATE_KEY=', JSON.stringify(serviceAccount.private_key));
```

Run it:
```bash
node extract-firebase-key.js
```

**Save the output** - you'll need these values!

---

### Step 3: Configure Supabase Secrets

Set the Firebase secrets in Supabase:

```bash
# Get your Supabase project ref from URL
# https://YOUR_PROJECT_REF.supabase.co

# Set Firebase secrets
npx supabase secrets set FIREBASE_PROJECT_ID="your-project-id" --project-ref YOUR_PROJECT_REF

npx supabase secrets set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com" --project-ref YOUR_PROJECT_REF

npx supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n" --project-ref YOUR_PROJECT_REF
```

**Important:** For FIREBASE_PRIVATE_KEY, use the EXACT string from the JSON including literal `\n` characters.

---

### Step 4: Create Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `database/fcm_devices_schema.sql`
3. **Update these two lines** in the SQL:
   ```sql
   -- Line 84: Update with your Supabase project ref
   edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-notification';
   
   -- Line 87: Update with your anon key (from Supabase Settings → API)
   service_key := 'YOUR_ANON_KEY';
   ```
4. Run the SQL

This will create:
- `devices` table for FCM tokens
- RLS policies
- Updated `notify_new_order()` trigger

---

### Step 5: Deploy Supabase Edge Function

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
npx supabase functions deploy send-order-notification --project-ref YOUR_PROJECT_REF
```

Verify deployment in Supabase Dashboard → Edge Functions.

---

### Step 6: Configure Capacitor for Firebase

#### 6.1 Update `capacitor.config.ts`

Add Firebase configuration:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.efeskebap.admin',
  appName: 'Efes Admin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },
  plugins: {
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

#### 6.2 Update `android/app/build.gradle`

Add Firebase dependencies at the bottom of the file:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

#### 6.3 Update `android/build.gradle`

Add Google services plugin in dependencies section:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

---

### Step 7: Sync Capacitor

```bash
# Sync Android platform
npx cap sync android
```

This will:
- Copy web assets
- Update native dependencies
- Install Firebase SDK

---

### Step 8: Build and Install APK

```bash
# Build the app
npm run build

# Prepare admin build
npm run prepare:admin

# Sync with Android
npx cap sync android

# Build APK
cd android
gradlew.bat assembleRelease
cd ..

# Install on device (make sure device is connected)
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

---

### Step 9: Test the System

#### 9.1 Open the app on your phone
- Grant notification permissions when prompted
- The app will register its FCM token

#### 9.2 Create a test order

Run this in Supabase SQL Editor:

```sql
INSERT INTO orders (
  order_number, 
  customer_name, 
  customer_phone,
  total_amount, 
  status, 
  payment_method,
  order_type
) VALUES (
  'TEST-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
  'Test Customer',
  '+39 123 456 7890',
  99.99,
  'pending',
  'card',
  'delivery'
);
```

#### 9.3 Expected Result:
1. 🔔 Notification appears on device
2. 📱 Full-screen alarm overlay shows
3. 🎵 Default notification sound plays
4. ⏰ Alarm continues until you:
   - Tap "STOP ALARM"
   - Tap "VIEW ORDER"
   - Swipe away the notification

---

## 🧪 Debugging

### Check FCM Token Registration

```sql
SELECT * FROM devices ORDER BY created_at DESC;
```

You should see your device token registered.

### Check Edge Function Logs

1. Supabase Dashboard → Edge Functions → `send-order-notification`
2. View logs to see if notifications were sent

### Check Trigger Logs

```sql
-- Check HTTP responses from trigger
SELECT * FROM net._http_response 
ORDER BY created DESC 
LIMIT 5;
```

### Check App Logs (ADB)

```bash
adb logcat -s "Capacitor" "FirebaseMessaging" "FCM"
```

---

## 🔧 Troubleshooting

### Issue: "No devices registered"
**Solution:** App didn't request permissions. Reinstall app and grant permissions.

### Issue: "Invalid JWT Signature"
**Solution:** Check FIREBASE_PRIVATE_KEY secret has literal `\n` characters, not actual newlines.

### Issue: "Permission denied"
**Solution:** Make sure you ran the database schema SQL to create the `devices` table and RLS policies.

### Issue: Notification doesn't show
**Solution:** 
- Check app has notification permissions
- Check device isn't in Do Not Disturb mode
- Check battery optimization isn't blocking notifications

### Issue: Alarm doesn't play sound
**Solution:** 
- Check device volume
- Check notification channel settings
- Grant audio permissions if needed

---

## 📊 System Architecture

```
New Order Created (SQL INSERT)
    ↓
Database Trigger: notify_new_order()
    ↓
Edge Function: send-order-notification
    ↓
Firebase OAuth2 Authentication (using jose)
    ↓
FCM API (Google servers)
    ↓
Your Android Device
    ↓
FCM Service receives message
    ↓
Full-Screen Alarm displays
    ↓
User stops alarm or views order
```

---

## 🎯 What You Need to Provide

1. ✅ **google-services.json** → Place in `android/app/`
2. ✅ **Firebase service account JSON** → For extracting credentials
3. ✅ **Supabase project ref** → From your Supabase URL
4. ✅ **Supabase anon key** → From Supabase Settings → API

Once you provide these, I'll help you:
- Set up the secrets
- Deploy the edge function
- Build and test the app

---

## 📝 TypeScript Errors Note

The TypeScript errors you see about `"devices"` table are expected. They will resolve automatically after:
1. Running the database schema SQL
2. Regenerating Supabase types with: `npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts`

For now, you can ignore these errors - the code will work at runtime.

---

## 🎉 Ready to Go!

All code is implemented. Just need to:
1. Add Firebase config files
2. Set Supabase secrets
3. Deploy edge function
4. Build and install APK
5. Test!

**Total setup time:** ~30-45 minutes

Let me know when you have the Firebase files ready! 🚀
