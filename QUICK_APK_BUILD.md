# Quick APK Build Reference

## 🚀 One-Command Build

```bash
npm run android:build
```

Then open Android Studio and build the APK.

## 📱 Build APK in Android Studio

1. Open the `android` folder in Android Studio
2. Wait for Gradle sync
3. `Build > Build Bundle(s) / APK(s) > Build APK(s)`
4. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 💻 Build APK via Command Line

### Debug APK
```bash
cd android
gradlew.bat assembleDebug
```

### Release APK (requires keystore setup)
```bash
cd android
gradlew.bat assembleRelease
```

## 🔄 Update After Code Changes

```bash
npm run android:build
```

Then rebuild APK in Android Studio.

## 📋 Prerequisites Checklist

- ✅ Node.js installed
- ✅ Android Studio installed
- ✅ Java JDK installed
- ✅ ANDROID_HOME environment variable set
- ✅ All dependencies installed (`npm install`)

## 🎯 What You Get

- **App Name**: Efes Admin
- **Package**: com.efeskebap.admin
- **Entry Point**: Admin Panel (auto-redirects to `/admin`)
- **Features**: Full admin panel, order management, product management

## 📍 APK Location

- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

For detailed instructions, see [ANDROID_APK_BUILD_GUIDE.md](./ANDROID_APK_BUILD_GUIDE.md)
