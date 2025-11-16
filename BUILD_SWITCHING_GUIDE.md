# 🔄 ANDROID ↔️ iOS BUILD SWITCHING GUIDE

**Quick reference for switching between Android and iOS builds**

---

## 📱 CURRENT SETUP

### **Separate Configuration Files:**

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | **Main config** (currently Android) |
| `capacitor.config.ios.ts` | **iOS-specific config** |
| `capacitor.config.android.ts` | **Android backup** (if created) |

---

## 🤖 BUILDING FOR ANDROID

### **1. Ensure Android config is active:**

```bash
# Check current config
cat capacitor.config.ts | grep "android"
```

### **2. Build Android APK:**

```bash
# Build web app
npm run build

# Sync Android
npx cap sync android

# Open in Android Studio
npx cap open android

# OR build APK directly
cd android
./gradlew assembleDebug
```

### **3. Android config looks like:**

```typescript
{
  appId: 'com.efeskebap.admin',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: { ... }
  }
}
```

---

## 🍎 BUILDING FOR iOS

### **1. Switch to iOS config:**

```bash
# Backup current config (if needed)
cp capacitor.config.ts capacitor.config.android.ts

# Use iOS config
cp capacitor.config.ios.ts capacitor.config.ts
```

### **2. Build iOS app:**

```bash
# Build web app
npm run build

# Add iOS platform (first time only)
npx cap add ios

# Sync iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### **3. iOS config looks like:**

```typescript
{
  appId: 'com.efeskebap.admin',
  server: {
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'App'
  }
}
```

---

## 🔄 SWITCHING BETWEEN PLATFORMS

### **Method 1: Manual Copy**

```bash
# Switch to iOS
cp capacitor.config.ios.ts capacitor.config.ts
npx cap sync ios

# Switch back to Android
cp capacitor.config.android.ts capacitor.config.ts
npx cap sync android
```

### **Method 2: Use Config Flag**

```bash
# Sync iOS without changing main config
npx cap sync ios --config=capacitor.config.ios.ts

# Sync Android with main config
npx cap sync android
```

### **Method 3: NPM Scripts (Recommended)**

Add to `package.json`:

```json
{
  "scripts": {
    "android:sync": "npx cap sync android",
    "android:open": "npx cap open android",
    "android:build": "npm run build && npm run android:sync",
    
    "ios:config": "cp capacitor.config.ios.ts capacitor.config.ts",
    "ios:sync": "npx cap sync ios --config=capacitor.config.ios.ts",
    "ios:open": "npx cap open ios",
    "ios:build": "npm run build && npm run ios:sync"
  }
}
```

Then use:
```bash
# For Android
npm run android:build

# For iOS
npm run ios:build
```

---

## 📋 PLATFORM-SPECIFIC FILES

### **Android Files:**
```
android/                           ← Android project folder
android/app/google-services.json  ← Firebase Android config
capacitor.config.ts (default)      ← Main config (Android)
capacitor.config.android.ts        ← Android backup
```

### **iOS Files:**
```
ios/                               ← iOS project folder
ios/App/App/GoogleService-Info.plist ← Firebase iOS config
capacitor.config.ios.ts            ← iOS config
```

---

## ⚠️ IMPORTANT NOTES

### **DO NOT MIX:**
- ❌ Don't commit both `android/` and `ios/` folders at once
- ❌ Don't use Android config for iOS builds
- ❌ Don't confuse Firebase config files

### **ALWAYS:**
- ✅ Keep configs separate
- ✅ Verify platform before building
- ✅ Test on correct device/emulator
- ✅ Use correct Firebase config file

---

## 🔍 VERIFY CURRENT PLATFORM

```bash
# Check which config is active
cat capacitor.config.ts | head -n 20

# Look for:
# - "androidScheme" → Android config
# - "iosScheme" → iOS config
```

---

## 🧪 TESTING CHECKLIST

### **Before Android Build:**
- [ ] `capacitor.config.ts` has Android settings
- [ ] `android/` folder exists
- [ ] `google-services.json` in place
- [ ] Android device/emulator connected

### **Before iOS Build:**
- [ ] `capacitor.config.ios.ts` used
- [ ] `ios/` folder exists  
- [ ] `GoogleService-Info.plist` in place
- [ ] Xcode opened on macOS
- [ ] Apple Developer account configured

---

## 🚀 QUICK COMMANDS

### **Android (from Windows or Mac):**
```bash
npm run build && npx cap sync android && npx cap open android
```

### **iOS (from Mac only):**
```bash
npm run build && npx cap sync ios --config=capacitor.config.ios.ts && npx cap open ios
```

---

## 🎯 BEST PRACTICES

1. **Keep main config for Android** (most common build)
2. **Use iOS config file for iOS builds only**
3. **Never commit platform folders** (`android/`, `ios/`)
4. **Document which config is active in commits**
5. **Test both platforms separately**

---

## 📝 COMMIT MESSAGES

```bash
# When pushing Android-specific changes
git commit -m "Android: Update FCM configuration"

# When pushing iOS-specific changes  
git commit -m "iOS: Add iOS config file for iOS builds"

# When pushing platform-independent changes
git commit -m "feat: Add new feature (Android + iOS)"
```

---

## ✅ SUCCESS INDICATORS

### **Android Build Ready:**
```
✓ android/ folder exists
✓ google-services.json present
✓ capacitor.config.ts has android settings
✓ APK builds successfully
```

### **iOS Build Ready:**
```
✓ ios/ folder exists
✓ GoogleService-Info.plist present
✓ capacitor.config.ios.ts available
✓ Xcode project opens
✓ Push notifications capability enabled
```

---

**Keep Android and iOS builds separate and clean!** 🤖🍎
