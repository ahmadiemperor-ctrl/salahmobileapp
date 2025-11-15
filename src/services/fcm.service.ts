/**
 * FCM (Firebase Cloud Messaging) Service
 * Handles push notification registration and message handling for mobile app
 */

import { FirebaseApp } from '@capacitor-firebase/app';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface FCMNotification {
  title: string;
  body: string;
  data: {
    order_id?: string;
    order_number?: string;
    type?: string;
    [key: string]: any;
  };
}

class FCMService {
  private fcmToken: string | null = null;
  private isInitialized: boolean = false;
  private onNotificationCallback: ((notification: FCMNotification) => void) | null = null;

  /**
   * Check if FCM is available (native platform only)
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize FCM service
   * - Request permissions
   * - Get FCM token
   * - Register token in database
   * - Setup message handlers
   */
  async initialize(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('❌ [FCM] Not available - not running on native platform');
      alert('❌ Not on native platform');
      return false;
    }

    if (this.isInitialized) {
      console.log('⚠️ [FCM] Already initialized');
      return true;
    }

    try {
      console.log('🚀 [FCM] Initializing...');
      alert('🚀 FCM: Starting init...');

      // Request notification permissions
      console.log('🔐 [FCM] Requesting permissions...');
      alert('🔐 Requesting permissions...');
      const permissionResult = await this.requestPermissions();
      if (!permissionResult) {
        console.error('❌ [FCM] Permission denied');
        alert('❌ Permission DENIED!');
        return false;
      }
      console.log('✅ [FCM] Permission granted');
      alert('✅ Permission OK!');

      // Get FCM token
      alert('🔑 Getting FCM token...');
      const tokenResult = await this.getFCMToken();
      if (!tokenResult) {
        console.error('❌ [FCM] Failed to get token');
        alert('❌ Failed to get token!');
        return false;
      }
      alert('✅ Token received!');

      // Setup message handlers
      alert('📬 Setting up handlers...');
      await this.setupMessageHandlers();

      this.isInitialized = true;
      console.log('✅ [FCM] Initialization complete');
      alert('✅ FCM COMPLETE!');
      return true;
    } catch (error) {
      console.error('❌ [FCM] Initialization failed:', error);
      alert(`💥 FCM ERROR: ${error}`);
      return false;
    }
  }

  /**
   * Request notification permissions from user
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔐 [FCM] Requesting notification permissions...');
      
      const result = await FirebaseMessaging.requestPermissions();
      
      if (result.receive === 'granted') {
        console.log('✅ [FCM] Notification permissions granted');
        return true;
      } else {
        console.log('❌ [FCM] Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('❌ [FCM] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get FCM token and save to database
   */
  private async getFCMToken(): Promise<boolean> {
    try {
      console.log('🔑 [FCM] Getting FCM token...');
      
      const result = await FirebaseMessaging.getToken();
      this.fcmToken = result.token;
      
      console.log('✅ [FCM] Token received:', this.fcmToken?.substring(0, 20) + '...');

      // Save to database
      const saved = await this.saveFCMTokenToDatabase(this.fcmToken);
      return saved;
    } catch (error) {
      console.error('❌ [FCM] Failed to get token:', error);
      return false;
    }
  }

  /**
   * Save FCM token to Supabase database
   */
  private async saveFCMTokenToDatabase(token: string): Promise<boolean> {
    try {
      console.log('💾 [FCM] Saving token to database...');

      // Try to get authenticated user, but not required for admin app
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null; // null is fine for devices table

      const { error } = await supabase
        .from('devices')
        .upsert({
          user_id: userId,
          fcm_token: token,
          device_info: {
            platform: Capacitor.getPlatform(),
            app_version: '1.0.0',
            timestamp: new Date().toISOString(),
          },
        }, { 
          onConflict: 'fcm_token',
        });

      if (error) {
        console.error('❌ [FCM] Failed to save token:', error);
        alert(`Token save error: ${error.message}`);
        return false;
      }

      console.log('✅ [FCM] Token saved to database');
      alert('✅ Token saved to DB!');
      return true;
    } catch (error) {
      console.error('❌ [FCM] Error saving token:', error);
      alert(`Token save exception: ${error}`);
      return false;
    }
  }

  /**
   * Setup message handlers for foreground and background notifications
   */
  private async setupMessageHandlers(): Promise<void> {
    console.log('📬 [FCM] Setting up message handlers...');

    // Foreground message handler
    await FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('📬 [FCM] Notification received (foreground):', event);
      
      const notification: FCMNotification = {
        title: event.notification.title || 'New Notification',
        body: event.notification.body || '',
        data: event.notification.data || {},
      };

      // Trigger callback if set (for full-screen alarm)
      if (this.onNotificationCallback) {
        this.onNotificationCallback(notification);
      }
    });

    // Background message tap handler
    await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('👆 [FCM] Notification tapped:', event);
      
      // Navigate to ordini page
      window.location.href = '/ordini';
    });

    // Token refresh handler
    await FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('🔄 [FCM] Token refreshed:', event.token.substring(0, 20) + '...');
      this.fcmToken = event.token;
      await this.saveFCMTokenToDatabase(event.token);
    });

    console.log('✅ [FCM] Message handlers setup complete');
  }

  /**
   * Set callback for when notification is received (for full-screen alarm)
   */
  setNotificationCallback(callback: (notification: FCMNotification) => void): void {
    this.onNotificationCallback = callback;
  }

  /**
   * Get current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      console.log('🔄 [FCM] Refreshing token...');
      const result = await FirebaseMessaging.getToken();
      
      if (result.token !== this.fcmToken) {
        this.fcmToken = result.token;
        await this.saveFCMTokenToDatabase(result.token);
        console.log('✅ [FCM] Token refreshed successfully');
      }
    } catch (error) {
      console.error('❌ [FCM] Token refresh failed:', error);
    }
  }

  /**
   * Delete FCM token (logout)
   */
  async deleteToken(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      console.log('🗑️ [FCM] Deleting token...');
      
      await FirebaseMessaging.deleteToken();
      
      // Remove from database
      if (this.fcmToken) {
        await supabase
          .from('devices')
          .delete()
          .eq('fcm_token', this.fcmToken);
      }

      this.fcmToken = null;
      this.isInitialized = false;
      console.log('✅ [FCM] Token deleted');
    } catch (error) {
      console.error('❌ [FCM] Token deletion failed:', error);
    }
  }
}

// Export singleton instance
export const fcmService = new FCMService();
