# 🍎 iOS BUILD GUIDE - Efes Admin App

**Complete step-by-step guide to build the iOS version**

---

## ⚠️ PREREQUISITES

### **Required:**
- ✅ macOS computer (Monterey 12.0 or later)
- ✅ Xcode 14.0 or later (from App Store)
- ✅ Apple Developer Account ($99/year)
- ✅ CocoaPods installed: `sudo gem install cocoapods`
- ✅ Node.js and npm installed
- ✅ Firebase project with iOS app configured

### **Not Required (Windows user):**
- ❌ Can push code from Windows
- ❌ iOS build must be done on macOS

---

## 📦 STEP 1: CLONE & SETUP

### **On macOS:**

```bash
# Clone the repository
git clone https://github.com/ahmadiiiiiiii198/salahmobileapp.git
# OR
git clone https://github.com/ahmadiemperor-ctrl/salahmobileapp.git

# Navigate to project
cd salahmobileapp

# Install dependencies
npm install

# Build the web app
npm run build
```

---

## 🍎 STEP 2: ADD iOS PLATFORM

```bash
# Add iOS platform
npx cap add ios

# This creates the ios/ folder with Xcode project
```

**Expected output:**
```
✔ Adding native Xcode project in ios/App.xcworkspace
✔ add in 15.23s
```

---

## 🔥 STEP 3: FIREBASE iOS CONFIGURATION

### **3.1: Download Firebase Config**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click on iOS app (or add new iOS app)
4. **Bundle ID:** `com.efeskebap.admin`
5. **App nickname:** `Efes Admin iOS`
6. Download `GoogleService-Info.plist`

### **3.2: Add to Xcode Project**

```bash
# Copy the file to iOS project
cp /path/to/GoogleService-Info.plist ios/App/App/GoogleService-Info.plist
```

**OR manually:**
1. Open Xcode project: `npx cap open ios`
2. Drag `GoogleService-Info.plist` into `App/App` folder in Xcode
3. Check ✅ "Copy items if needed"
4. Check ✅ Target: "App"

---

## ⚙️ STEP 4: USE iOS CONFIG

### **Replace Capacitor config for iOS build:**

```bash
# Backup Android config
cp capacitor.config.ts capacitor.config.android.ts

# Use iOS config
cp capacitor.config.ios.ts capacitor.config.ts

# Sync iOS
npx cap sync ios
```

**OR use config flag:**
```bash
npx cap sync ios --config=capacitor.config.ios.ts
```

---

## 🔧 STEP 5: XCODE CONFIGURATION

### **5.1: Open in Xcode**

```bash
npx cap open ios
```

### **5.2: Configure Project**

**In Xcode, select `App` target:**

#### **General Tab:**

1. **Bundle Identifier:** `com.efeskebap.admin`
2. **Version:** `1.0.0`
3. **Build:** `1`
4. **Deployment Target:** iOS 13.0 or later
5. **Team:** Select your Apple Developer Team

#### **Signing & Capabilities Tab:**

1. **Automatically manage signing:** ✅ Checked
2. **Team:** Your Apple Developer Team
3. **Provisioning Profile:** Automatic

#### **Add Push Notifications Capability:**

1. Click **+ Capability**
2. Search for **Push Notifications**
3. Add it

#### **Add Background Modes:**

1. Click **+ Capability**
2. Search for **Background Modes**
3. Enable:
   - ✅ **Remote notifications**
   - ✅ **Background fetch**

---

## 📝 STEP 6: UPDATE INFO.PLIST

In Xcode, open `ios/App/App/Info.plist` and add:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>fetch</string>
</array>

<key>FirebaseAppDelegateProxyEnabled</key>
<false/>

<key>NSUserTrackingUsageDescription</key>
<string>This app uses notifications to alert you of new orders</string>

<key>NSCameraUsageDescription</key>
<string>Camera access is required for scanning QR codes</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required to upload images</string>
```

---

## 🔔 STEP 7: CONFIGURE APNs

### **7.1: Enable Push Notifications in Apple Developer**

1. Go to [developer.apple.com](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers**
4. Select your App ID: `com.efeskebap.admin`
5. Enable **Push Notifications** capability
6. Click **Configure** and create certificates:
   - Development SSL Certificate
   - Production SSL Certificate

### **7.2: Upload APNs Key to Firebase**

1. In Apple Developer, go to **Keys**
2. Create new key with **Apple Push Notifications service (APNs)**
3. Download the `.p8` key file
4. Go to Firebase Console → Project Settings → Cloud Messaging
5. Under **iOS app configuration**, upload:
   - **APNs Authentication Key** (.p8 file)
   - **Key ID**
   - **Team ID**

---

## 🏗️ STEP 8: BUILD THE APP

### **8.1: Build for Testing (Simulator)**

In Xcode:
1. Select **Any iOS Device (arm64)** or specific simulator
2. Press **⌘ + B** to build
3. Press **⌘ + R** to run

### **8.2: Build for Testing (Physical Device)**

1. Connect your iPhone/iPad via USB
2. Trust computer on device
3. In Xcode, select your device
4. Press **⌘ + R** to build and run

### **8.3: Archive for App Store**

```bash
# Clean build folder
rm -rf ios/App/build

# In Xcode:
# 1. Select "Any iOS Device (arm64)"
# 2. Product → Archive
# 3. Wait for archive to complete
# 4. Click "Distribute App"
# 5. Choose distribution method:
#    - "App Store Connect" for TestFlight/App Store
#    - "Ad Hoc" for internal testing
#    - "Development" for local testing
```

---

## 🧪 STEP 9: TEST FCM NOTIFICATIONS

### **9.1: Get Device Token**

When app launches, check Xcode console for:
```
🔥 FCM Token: <your-fcm-token>
```

### **9.2: Test Notification**

```bash
# Replace with your token
FCM_TOKEN="your-device-fcm-token"

# Send test notification
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: Bearer YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "'$FCM_TOKEN'",
    "notification": {
      "title": "Test Order",
      "body": "New order #1234"
    }
  }'
```

---

## 📱 STEP 10: TESTFLIGHT DISTRIBUTION

### **10.1: Upload to App Store Connect**

1. In Xcode Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Upload build

### **10.2: Configure in App Store Connect**

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **TestFlight** tab
4. Select uploaded build
5. Add internal/external testers
6. Distribute

---

## 🔄 UPDATING THE APP

### **After code changes:**

```bash
# On Windows (or macOS):
git pull origin master
npm install
npm run build

# On macOS only:
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Increment Build number
# 2. Build & Archive
# 3. Upload to TestFlight
```

---

## ⚠️ TROUBLESHOOTING

### **Issue: Build fails with CocoaPods error**

```bash
cd ios/App
pod repo update
pod install
```

### **Issue: Provisioning profile error**

1. Xcode → Preferences → Accounts
2. Select your Apple ID
3. Download Manual Profiles
4. Or use Automatic signing

### **Issue: Firebase not initialized**

Check that `GoogleService-Info.plist` is:
1. In `ios/App/App/` folder
2. Added to Xcode project
3. Target membership includes "App"

### **Issue: No push notifications**

1. Check APNs certificates in Apple Developer
2. Verify APNs key uploaded to Firebase
3. Check capabilities in Xcode
4. Verify `Info.plist` has UIBackgroundModes

### **Issue: App crashes on launch**

Check Xcode console for errors:
```bash
# View device logs
xcrun simctl spawn booted log stream --level debug
```

---

## 📋 CHECKLIST

Before submitting to App Store:

- [ ] Firebase iOS app configured
- [ ] GoogleService-Info.plist added
- [ ] Push Notifications capability enabled
- [ ] Background Modes configured
- [ ] APNs certificates created
- [ ] APNs key uploaded to Firebase
- [ ] FCM tested and working
- [ ] App tested on physical device
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy URL ready
- [ ] Version and build numbers set
- [ ] TestFlight testing completed

---

## 🔐 SECURITY NOTES

### **Sensitive Files (DO NOT COMMIT):**
- `GoogleService-Info.plist` - iOS Firebase config
- Provisioning profiles
- Code signing certificates
- APNs authentication keys

### **Already in .gitignore:**
- `ios/` folder (generated)
- `*.p12`, `*.mobileprovision`
- `*.cer`, `*.p8`

---

## 📞 SUPPORT

### **Firebase Issues:**
- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [FCM iOS Guide](https://firebase.google.com/docs/cloud-messaging/ios/client)

### **Apple Developer:**
- [App Store Connect Help](https://developer.apple.com/support/app-store-connect/)
- [TestFlight Guide](https://developer.apple.com/testflight/)

### **Capacitor:**
- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [Capacitor Config](https://capacitorjs.com/docs/config)

---

## 🎉 SUCCESS!

Once you complete all steps:
- ✅ iOS app builds successfully
- ✅ FCM notifications working
- ✅ App distributed via TestFlight
- ✅ Ready for App Store submission

**The iOS version is now ready alongside your Android version!** 🍎📱
