# Android APK Build Guide - Efes Kebap Admin App

This guide explains how to build an Android APK from the admin panel of the Efes Kebap website.

## 📋 Prerequisites

Before building the APK, ensure you have the following installed:

1. **Node.js** (v16 or higher)
2. **Android Studio** (latest version)
3. **Java Development Kit (JDK)** (v17 recommended)
4. **Android SDK** (installed via Android Studio)

### Setting up Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (optional, for testing)
3. Set up environment variables:
   - `ANDROID_HOME` or `ANDROID_SDK_ROOT` pointing to your Android SDK location
   - Add `%ANDROID_HOME%\platform-tools` to your PATH

## 🚀 Quick Start

### Option 1: Build Everything at Once

Run this single command to build the web app and sync to Android:

```bash
npm run android:build
```

This command will:
1. Build the web application
2. Prepare the admin-only version
3. Sync files to the Android project

### Option 2: Step-by-Step Build

If you prefer to run each step separately:

```bash
# 1. Build the web application
npm run build

# 2. Prepare admin-only version
npm run prepare:admin

# 3. Sync to Android
npm run cap:sync
```

## 📱 Building the APK

### Method 1: Using Android Studio (Recommended)

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to and select the `android` folder in your project
4. Wait for Gradle to sync
5. Build the APK:
   - **Debug APK**: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - **Release APK**: `Build > Generate Signed Bundle / APK`

The APK will be generated at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Method 2: Using Command Line

#### Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

Or on Windows:
```bash
cd android
gradlew.bat assembleDebug
```

The debug APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Build Release APK

For a production-ready APK, you need to sign it:

1. Create a keystore (first time only):
```bash
keytool -genkey -v -keystore efes-admin-release.keystore -alias efes-admin -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/gradle.properties` with your keystore info:
```properties
EFES_RELEASE_STORE_FILE=../efes-admin-release.keystore
EFES_RELEASE_KEY_ALIAS=efes-admin
EFES_RELEASE_STORE_PASSWORD=your_store_password
EFES_RELEASE_KEY_PASSWORD=your_key_password
```

3. Update `android/app/build.gradle` to add signing config:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('EFES_RELEASE_STORE_FILE')) {
                storeFile file(EFES_RELEASE_STORE_FILE)
                storePassword EFES_RELEASE_STORE_PASSWORD
                keyAlias EFES_RELEASE_KEY_ALIAS
                keyPassword EFES_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

4. Build the release APK:
```bash
cd android
./gradlew assembleRelease
```

Or on Windows:
```bash
cd android
gradlew.bat assembleRelease
```

The release APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Project Structure

The admin app setup includes:

- **`src/AdminApp.tsx`** - Admin-only React app with routes for admin, orders, and ordini pages
- **`src/admin-main.tsx`** - Entry point for the admin app
- **`admin.html`** - HTML file for the admin app
- **`scripts/prepare-admin-build.js`** - Script to replace index.html with admin.html for Android
- **`capacitor.config.ts`** - Capacitor configuration
- **`android/`** - Native Android project

## 📝 Available NPM Scripts

- `npm run android:build` - Build web app and sync to Android
- `npm run build` - Build the web application
- `npm run prepare:admin` - Prepare admin-only version
- `npm run cap:sync` - Sync web assets to Android
- `npm run cap:open` - Open Android project in Android Studio

## 🎯 App Configuration

The Android app is configured with:

- **App Name**: Efes Admin
- **Package ID**: com.efeskebap.admin
- **Default Route**: `/admin` (automatically redirects to admin panel)

## 🧪 Testing the App

### Test on Emulator

1. Open Android Studio
2. Open the `android` folder
3. Click the "Run" button (green play icon)
4. Select an emulator or create a new one
5. The app will install and launch on the emulator

### Test on Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect your device via USB
4. In Android Studio, select your device from the device dropdown
5. Click "Run"

### Install APK Directly

1. Transfer the APK file to your Android device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Install the app

## 🔐 Environment Variables

Make sure your `.env` file contains all necessary Supabase and Stripe credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

These will be bundled into the app during build.

## 🐛 Troubleshooting

### Build Fails with "SDK not found"

Make sure `ANDROID_HOME` environment variable is set:
```bash
# Windows
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Mac/Linux
export ANDROID_HOME=$HOME/Android/Sdk
```

### Gradle Sync Failed

1. Open Android Studio
2. File > Invalidate Caches / Restart
3. Try syncing again

### App Crashes on Launch

1. Check that all environment variables are set correctly
2. Rebuild the app: `npm run android:build`
3. Check Android Studio Logcat for error messages

### White Screen on Launch

This usually means the web assets weren't synced properly:
```bash
npm run cap:sync
```

## 📦 Distribution

### Google Play Store

To publish on Google Play Store:

1. Create a Google Play Developer account
2. Build a signed release APK (see above)
3. Create a new app in Google Play Console
4. Upload the APK
5. Fill in app details, screenshots, and descriptions
6. Submit for review

### Direct Distribution

You can distribute the APK directly:

1. Build a signed release APK
2. Upload to your website or file hosting service
3. Share the download link
4. Users will need to enable "Install from Unknown Sources"

## 🔄 Updating the App

When you make changes to the admin panel:

1. Make your code changes
2. Run: `npm run android:build`
3. Rebuild the APK in Android Studio or via command line
4. Distribute the new APK

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Ionic Capacitor Android Guide](https://capacitorjs.com/docs/android)

## ✅ Success!

You should now have a working Android APK of the Efes Kebap Admin Panel! The app will open directly to the admin login page and provide access to all admin features including order management, product management, and settings.
