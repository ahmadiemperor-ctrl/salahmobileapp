import type { CapacitorConfig } from '@capacitor/cli';

/**
 * iOS-specific Capacitor Configuration
 * This file is separate from the main config to avoid conflicts with Android build
 * 
 * To use this config for iOS builds:
 * 1. Rename this to capacitor.config.ts when building for iOS
 * 2. Or use: npx cap sync ios --config=capacitor.config.ios.ts
 */

const config: CapacitorConfig = {
  appId: 'com.efeskebap.admin',
  appName: 'Efes Admin',
  webDir: 'dist',
  
  server: {
    // Use HTTPS for iOS
    iosScheme: 'https'
  },
  
  ios: {
    // iOS-specific settings
    contentInset: 'automatic',
    
    // Scheme for iOS app URLs
    scheme: 'App'
  },
  
  plugins: {
    // Firebase App configuration
    FirebaseApp: {
      // iOS Firebase config file location
      // Place GoogleService-Info.plist in ios/App/App/ folder
    },
    
    // Firebase Messaging (FCM) configuration
    FirebaseMessaging: {
      // Request notification permissions on app start
      presentationOptions: ["badge", "sound", "alert"]
    },
    
    // Push Notifications
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    
    // Local Notifications (for FCM)
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
