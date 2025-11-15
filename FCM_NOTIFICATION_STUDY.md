# 🔥 FCM Push Notification Implementation Study
## Efes Kebap Admin Mobile App - Notification System Design
**Date:** November 15, 2025 02:13 AM
**Duration:** Comprehensive 1-hour study

---

## 📚 PHASE 1: GUIDE DOCUMENTS ANALYSIS

### Guides Reviewed:
1. **ALI_BABA_NOTIFICATION_FIX_COMPLETE_GUIDE.md** - Flutter/Firebase implementation
2. **FCM_NOTIFICATION_FIX_GUIDE.md** - JWT signing and OAuth2 authentication
3. **CONTINUOUS_ALARM_NOTIFICATION_IMPLEMENTATION.md** - Alarm screen and persistent notifications

---

## 🔍 PHASE 2: KEY LEARNINGS FROM GUIDES

### From ALI_BABA_NOTIFICATION_FIX_COMPLETE_GUIDE.md:

#### System Architecture (Flutter-based):
```
New Order Created → Database Trigger → Edge Function → 
Firebase OAuth2 → FCM Message → Mobile App → Local Notification
```

#### Critical Components:
1. **Database Trigger** (`notify_new_order()`)
   - Fires on order INSERT
   - Calls Supabase Edge Function via HTTP POST
   - Requires valid authentication (anon key or service role key)
   - Headers needed: `Authorization`, `apikey`, `Content-Type`

2. **Supabase Edge Function** (`send-order-notification`)
   - Authenticates with Firebase using OAuth2
   - Uses `jose` library for JWT signing (CRITICAL - no manual signing!)
   - Sends FCM message to registered devices
   - Returns success/failure count

3. **Firebase Configuration**:
   - Service Account JSON with private_key
   - Client email
   - FCM tokens stored in database
   - Private key format: literal `\n` stored, then `.replace(/\\n/g, "\n")` in code

4. **Mobile App (Flutter)**:
   - Firebase Messaging integration
   - FCM token registration to Supabase
   - Foreground/background message handlers
   - Local notification service
   - Permissions: POST_NOTIFICATIONS, WAKE_LOCK, VIBRATE

#### Common Issues Identified:
- ❌ Expired JWT tokens
- ❌ Missing authentication headers
- ❌ App not running (FCM requires app active/backgrounded)
- ❌ Permissions denied
- ❌ Manual JWT signing (always fails - use `jose` library!)

---

### From FCM_NOTIFICATION_FIX_GUIDE.md:

#### The JWT Signing Problem:
**Never manually sign JWTs!** The manual crypto.subtle.sign() approach ALWAYS fails with:
- "Invalid JWT Signature"
- "Failed to decode base64"
- "trailing data at end of DER message"

#### The Solution - Use `jose` Library:
```typescript
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.2.0/index.ts";

// Replace literal \n with actual newlines
const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

// Import the private key
const pkcs8 = await importPKCS8(privateKey, "RS256");

// Create and sign JWT
const payload = {
  iss: FIREBASE_CLIENT_EMAIL,
  scope: "https://www.googleapis.com/auth/firebase.messaging",
  aud: "https://oauth2.googleapis.com/token",
  exp: now + 3600,
  iat: now,
};

const jwt = await new SignJWT(payload)
  .setProtectedHeader({ alg: "RS256", typ: "JWT" })
  .sign(pkcs8);

// Exchange JWT for access token
const response = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
});

const data = await response.json();
return data.access_token;
```

#### Key Takeaways:
- Store Firebase private key with literal `\n` (as it appears in JSON)
- Use `jose` library for all JWT operations
- Don't regenerate Firebase keys unnecessarily (revokes old ones)
- Test immediately after each change

---

### From CONTINUOUS_ALARM_NOTIFICATION_IMPLEMENTATION.md:

#### Alarm Features (Flutter-specific):
1. **Continuous looping alarm sound** (local asset)
2. **Full-screen alarm screen** (over lock screen)
3. **Persistent notification** (can't be swiped away)
4. **Action buttons**: "STOP ALARM", "VIEW ORDER"

#### Android Permissions Required:
```xml
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.DISABLE_KEYGUARD" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### Activity Attributes:
```xml
<activity
    android:showWhenLocked="true"
    android:turnScreenOn="true">
```

---

## 🧭 PHASE 3: CURRENT CODEBASE ANALYSIS

### Current Notification System (Efes Kebap):

#### File: `src/components/UnifiedNotificationSystem.tsx`
**Current Implementation:**
- Web-based notification system (not native push)
- Uses Web Audio API for bell tones
- Service Worker for background sync
- Browser Notification API (requires permission)
- Supabase realtime subscriptions to `order_notifications` table
- Sound plays in browser when notifications arrive

**Limitations:**
- ❌ Only works when browser tab is open
- ❌ No native push notifications
- ❌ Can't wake device when locked
- ❌ Limited by browser permissions
- ❌ No persistent alarm functionality
- ❌ Doesn't work as native mobile app notification

#### File: `src/pages/ordini.tsx`
**Current Usage:**
- Imports `UnifiedNotificationSystem`
- Renders notification component in ordini page
- Current system is web-only, not mobile FCM

#### Android App Status:
- ✅ Capacitor configured (`@capacitor/android: ^7.4.4`)
- ❌ No Firebase integration
- ❌ No FCM plugins installed
- ❌ No google-services.json file
- ❌ No push notification capability

---

## 🎯 PHASE 4: GAP ANALYSIS

### What's Missing for FCM Push Notifications:

#### 1. Firebase Project Setup
- [ ] Create Firebase project
- [ ] Download `google-services.json`
- [ ] Place in `android/app/` directory
- [ ] Generate Firebase service account key (JSON)
- [ ] Extract private key and client email

#### 2. Capacitor Firebase Plugins
- [ ] Install `@capacitor-firebase/app`
- [ ] Install `@capacitor-firebase/messaging`
- [ ] Configure in `capacitor.config.ts`

#### 3. Supabase Edge Function
- [ ] Create `send-order-notification` function
- [ ] Implement OAuth2 authentication using `jose`
- [ ] Set Firebase secrets (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
- [ ] Deploy edge function

#### 4. Database Setup
- [ ] Create `devices` table for FCM token storage
- [ ] Update `notify_new_order()` trigger
- [ ] Ensure trigger has correct auth headers

#### 5. Mobile App Integration
- [ ] Create FCM service in TypeScript/React
- [ ] Request notification permissions
- [ ] Register FCM token to Supabase
- [ ] Handle foreground/background messages
- [ ] Integrate with existing `UnifiedNotificationSystem`

#### 6. Android Configuration
- [ ] Add Firebase dependencies to `build.gradle`
- [ ] Add notification permissions to `AndroidManifest.xml`
- [ ] Configure notification channels
- [ ] Add sound assets for alarm

---

## 🏗️ PHASE 5: PROPOSED ARCHITECTURE

### System Flow:
```
┌──────────────────────────────────────────────────────────────┐
│                    NEW ORDER CREATED                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│         DATABASE TRIGGER: notify_new_order()                  │
│  - Fires on orders.INSERT                                     │
│  - Builds payload (order details)                             │
│  - Calls Edge Function via HTTP POST                          │
│  - Headers: Authorization + apikey + Content-Type             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│    SUPABASE EDGE FUNCTION: send-order-notification            │
│  1. Receive payload from trigger                              │
│  2. Query devices table for FCM tokens                        │
│  3. Authenticate with Firebase OAuth2 (using jose)            │
│  4. Build FCM message payload                                 │
│  5. Send to FCM API                                           │
│  6. Return success/failure count                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│           FIREBASE CLOUD MESSAGING (FCM)                      │
│  - Validates request                                          │
│  - Routes to registered devices                               │
│  - Handles delivery (even if app closed)                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│        CAPACITOR MOBILE APP (Android)                         │
│  - FCM Service receives message                               │
│  - Shows notification with alarm sound                        │
│  - Displays in notification tray                              │
│  - Opens ordini page on tap                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 PHASE 6: MOBILE APP INTEGRATION STRATEGY

### Dual Notification System:

#### Web Version (Current):
- Uses `UnifiedNotificationSystem` (browser-based)
- Web Audio API + Service Workers
- Works in browser tabs
- No changes needed - keep as-is for web users

#### Mobile Version (New - FCM):
- Capacitor Firebase Messaging plugin
- Native push notifications via FCM
- Works even when app closed
- Alarm sound using Capacitor Audio plugin

### Detection Strategy:
```typescript
// Check if running in Capacitor native app
import { Capacitor } from '@capacitor/core';

const isNativeApp = Capacitor.isNativePlatform();

if (isNativeApp) {
  // Use FCM native push notifications
  initializeFCM();
} else {
  // Use existing UnifiedNotificationSystem (web)
  <UnifiedNotificationSystem />
}
```

---

## 🔧 PHASE 7: IMPLEMENTATION PLAN

### Step 1: Firebase Setup (30 minutes)
1. Create Firebase project at console.firebase.google.com
2. Add Android app to Firebase project
3. Download `google-services.json` → place in `android/app/`
4. Generate service account key
5. Extract private key using provided script

### Step 2: Install Dependencies (15 minutes)
```bash
npm install @capacitor-firebase/app @capacitor-firebase/messaging
npx cap sync android
```

### Step 3: Create Database Schema (15 minutes)
```sql
-- Devices table for FCM tokens
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  fcm_token TEXT NOT NULL UNIQUE,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own devices"
  ON devices FOR ALL
  USING (auth.uid() = user_id);
```

### Step 4: Create Edge Function (45 minutes)
```typescript
// supabase/functions/send-order-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.2.0/index.ts";

const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;

async function getAccessToken(): Promise<string> {
  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const pkcs8 = await importPKCS8(privateKey, "RS256");
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(pkcs8);
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("📱 Order notification payload:", payload);

    // Get FCM tokens from devices table
    // (would need Supabase client here)
    const fcmTokens = ["token1", "token2"]; // Placeholder

    // Get OAuth2 access token
    const accessToken = await getAccessToken();

    // Send to each device
    let successCount = 0;
    let failureCount = 0;

    for (const token of fcmTokens) {
      const fcmPayload = {
        message: {
          token: token,
          notification: {
            title: "🍕 Nuovo Ordine!",
            body: `Ordine ${payload.order_number} - ${payload.customer_name}`,
          },
          data: {
            order_id: payload.order_id,
            order_number: payload.order_number,
            type: "new_order",
          },
          android: {
            priority: "high",
            notification: {
              sound: "alarm",
              channelId: "order_notifications",
            },
          },
        },
      };

      const fcmResponse = await fetch(
        `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        }
      );

      if (fcmResponse.ok) {
        successCount++;
      } else {
        failureCount++;
        console.error("FCM error:", await fcmResponse.text());
      }
    }

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        success: successCount,
        failed: failureCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Step 5: Create FCM Service (React/TypeScript) (60 minutes)
```typescript
// src/services/fcm.service.ts
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

class FCMService {
  private fcmToken: string | null = null;

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('❌ FCM only available on native platforms');
      return;
    }

    try {
      // Request permissions
      const { receive } = await FirebaseMessaging.requestPermissions();
      
      if (receive === 'granted') {
        console.log('✅ Notification permissions granted');
        
        // Get FCM token
        const { token } = await FirebaseMessaging.getToken();
        this.fcmToken = token;
        console.log('🔑 FCM Token:', token);

        // Save to Supabase
        await this.saveFCMToken(token);

        // Listen for messages
        await this.setupMessageHandlers();
      }
    } catch (error) {
      console.error('❌ FCM initialization failed:', error);
    }
  }

  private async saveFCMToken(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('devices')
      .upsert({
        user_id: user.id,
        fcm_token: token,
        device_info: {
          platform: Capacitor.getPlatform(),
          timestamp: new Date().toISOString(),
        },
      }, { onConflict: 'fcm_token' });

    if (error) {
      console.error('❌ Failed to save FCM token:', error);
    } else {
      console.log('✅ FCM token saved to database');
    }
  }

  private async setupMessageHandlers() {
    // Foreground messages
    await FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('📬 Notification received (foreground):', event);
      // Show local notification or update UI
      this.showLocalNotification(event.notification);
    });

    // Background message tap
    await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('👆 Notification tapped:', event);
      // Navigate to ordini page
      window.location.href = '/ordini';
    });
  }

  private showLocalNotification(notification: any) {
    // Play alarm sound using Capacitor
    // Show in-app notification
    console.log('🔔 Showing notification:', notification.title);
  }

  async refreshToken() {
    if (!Capacitor.isNativePlatform()) return;
    
    const { token } = await FirebaseMessaging.getToken();
    if (token !== this.fcmToken) {
      this.fcmToken = token;
      await this.saveFCMToken(token);
    }
  }
}

export const fcmService = new FCMService();
```

### Step 6: Integrate in AdminApp (30 minutes)
```typescript
// src/AdminApp.tsx
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { fcmService } from '@/services/fcm.service';

const AdminApp = () => {
  useEffect(() => {
    // Initialize FCM if native app
    if (Capacitor.isNativePlatform()) {
      fcmService.initialize();
    }
  }, []);

  // ... rest of app
};
```

### Step 7: Android Configuration (30 minutes)

#### Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

#### Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### Step 8: Deploy and Test (30 minutes)
1. Deploy edge function
2. Set Firebase secrets in Supabase
3. Build Android APK
4. Install on device
5. Grant notification permissions
6. Create test order
7. Verify notification arrives

**Total Estimated Time:** 4.5 hours

---

## 📊 PHASE 8: SUCCESS METRICS

### Must Have:
- [ ] Push notifications arrive when app is closed
- [ ] Tapping notification opens ordini page
- [ ] Alarm sound plays on notification
- [ ] Notification shows in Android notification tray
- [ ] FCM token properly registered and saved

### Nice to Have:
- [ ] Persistent notification (can't swipe away)
- [ ] Action buttons in notification
- [ ] Full-screen alarm overlay
- [ ] Continuous looping until acknowledged
- [ ] Works over lock screen

---

## 🚨 PHASE 9: CRITICAL WARNINGS

### What NOT To Do:
1. **❌ NEVER manually sign JWTs** - Always use `jose` library
2. **❌ DON'T commit Firebase keys to Git** - Use Supabase secrets
3. **❌ DON'T regenerate Firebase keys unnecessarily** - Revokes old tokens
4. **❌ DON'T double-escape private key** - Store as-is from JSON
5. **❌ DON'T test with app completely killed** - FCM requires app backgrounded

### Required Order of Operations:
1. Firebase project setup FIRST
2. Install dependencies SECOND
3. Configure android files THIRD
4. Create edge function FOURTH
5. Test incrementally - don't skip steps!

---

## 🎓 PHASE 10: KEY DIFFERENCES FROM FLUTTER GUIDES

### Flutter → React/Capacitor Translation:

| Flutter | React/Capacitor |
|---------|-----------------|
| `firebase_messaging` package | `@capacitor-firebase/messaging` |
| `flutter_local_notifications` | Capacitor Local Notifications |
| `shared_preferences` | LocalStorage or Capacitor Preferences |
| `audioplayers` package | Capacitor Audio or HTML5 Audio |
| Dart async/await | TypeScript async/await |
| `pubspec.yaml` | `package.json` |
| `AndroidManifest.xml` | Same location |
| `google-services.json` | Same location |

### Architecture Similarities:
- ✅ Database trigger → Edge function → FCM → Device (SAME)
- ✅ OAuth2 with Firebase (SAME)
- ✅ FCM token storage (SAME)
- ✅ Android permissions (SAME)
- ✅ Notification channels (SAME)

---

## 🔑 PHASE 11: PERMISSION REQUEST FLOW

### User Experience:
```
1. User opens admin app on phone
   ↓
2. App detects it's running as native Capacitor app
   ↓
3. FCM service initializes
   ↓
4. System shows native permission dialog:
   "Allow Efes Admin to send you notifications?"
   [Block] [Allow]
   ↓
5. User taps "Allow"
   ↓
6. App receives FCM token
   ↓
7. Token saved to Supabase devices table
   ↓
8. System ready to receive push notifications
```

### Code:
```typescript
const { receive } = await FirebaseMessaging.requestPermissions();

if (receive === 'granted') {
  // Permissions granted - proceed
} else {
  // Show explanation and retry
  alert('Notifications are required to receive order alerts');
}
```

---

## 🎯 PHASE 12: NEXT STEPS SUMMARY

### Immediate Actions:
1. ✅ Study complete (this document)
2. ⏭️ Get user approval to proceed with implementation
3. ⏭️ Create Firebase project
4. ⏭️ Download `google-services.json`
5. ⏭️ Install Capacitor Firebase plugins

### Implementation Order:
```
Firebase Setup → Install Plugins → Database Schema → 
Edge Function → FCM Service → Integration → Testing
```

### Timeline:
- **Setup Phase:** 1 hour
- **Backend Phase:** 1.5 hours  
- **Mobile Integration:** 1.5 hours
- **Testing & Polish:** 0.5 hours
- **Total:** 4.5 hours

---

## 📚 PHASE 13: REFERENCE LINKS

### Firebase Documentation:
- https://firebase.google.com/docs/cloud-messaging
- https://firebase.google.com/docs/admin/setup

### Capacitor Firebase:
- https://github.com/capawesome-team/capacitor-firebase
- https://capawesome.io/plugins/firebase/messaging/

### Supabase Edge Functions:
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/functions/secrets

### OAuth2 JWT:
- https://developers.google.com/identity/protocols/oauth2/service-account
- https://github.com/panva/jose (jose library)

---

## 🎉 STUDY CONCLUSION

**Status:** ✅ **COMPREHENSIVE STUDY COMPLETE**

### What We Learned:
1. FCM push notifications require Firebase project + OAuth2 authentication
2. JWT signing MUST use `jose` library (never manual)
3. System architecture: Trigger → Edge Function → FCM → Device
4. Capacitor provides native FCM support via plugins
5. Need to request notification permissions on first launch
6. Can work alongside existing web notification system

### What's Required:
- Firebase project with service account key
- Capacitor Firebase plugins
- Supabase Edge Function with `jose` library
- Database table for FCM tokens
- Android manifest permissions
- React service for FCM integration

### Estimated Effort:
**4.5 hours** for complete implementation

### Risk Assessment:
- **Low Risk:** Well-documented pattern from Flutter guides
- **Known Issues:** All documented with solutions
- **Testing Strategy:** Incremental with immediate feedback

### Ready for Implementation:
**YES** - All requirements identified, architecture designed, code examples prepared

---

**Created:** November 15, 2025 02:13 AM
**Project:** Efes Kebap Admin Mobile App
**Status:** 📋 **STUDY COMPLETE - AWAITING APPROVAL TO IMPLEMENT**

---

## 📞 Questions to Clarify Before Implementation:

1. Do you have an existing Firebase project, or should we create a new one?
2. Do you want the full alarm screen experience (like Flutter guides), or basic notifications are enough?
3. Should notifications work only in the mobile app, or also in web browser?
4. Any specific alarm sound preference, or use default notification sound?
5. Should we implement "can't swipe away" persistent notifications, or standard dismissible ones?

**Next Step:** Get your approval and answers to proceed with implementation! 🚀
