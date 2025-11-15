/**
 * Supabase Edge Function: send-order-notification
 * Sends FCM push notifications to registered devices when new order arrives
 * Uses Firebase OAuth2 authentication with jose library
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.2.0/index.ts";

// Environment variables (set via: npx supabase secrets set KEY=value)
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OrderPayload {
  type: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  total_amount: string;
  order_type: string;
  payment_method?: string;
  created_at: string;
}

/**
 * Get OAuth2 access token from Firebase using service account
 * Uses jose library for proper JWT signing
 */
async function getFirebaseAccessToken(): Promise<string> {
  try {
    console.log("🔐 [FCM] Getting Firebase access token...");

    // Replace literal \n with actual newlines
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    // Import private key using jose
    const pkcs8 = await importPKCS8(privateKey, "RS256");

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: FIREBASE_CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600, // 1 hour expiry
      iat: now,
    };

    // Sign JWT using jose
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(pkcs8);

    console.log("✅ [FCM] JWT signed successfully");

    // Exchange JWT for access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth2 token exchange failed: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ [FCM] Access token obtained");
    return data.access_token;
  } catch (error) {
    console.error("❌ [FCM] Failed to get access token:", error);
    throw error;
  }
}

/**
 * Send FCM message to a device
 */
async function sendFCMMessage(
  token: string,
  accessToken: string,
  orderData: OrderPayload
): Promise<boolean> {
  try {
    const fcmPayload = {
      message: {
        token: token,
        notification: {
          title: "🍕 Nuovo Ordine!",
          body: `Ordine ${orderData.order_number} - ${orderData.customer_name}`,
        },
        data: {
          order_id: orderData.order_id,
          order_number: orderData.order_number,
          customer_name: orderData.customer_name,
          total_amount: orderData.total_amount,
          order_type: orderData.order_type,
          payment_method: orderData.payment_method || "",
          type: "new_order",
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "order_notifications",
            priority: "high",
            defaultVibrateTimings: true,
            sticky: true, // Notification stays until user interacts
          },
        },
      },
    };

    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

    const response = await fetch(fcmUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fcmPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [FCM] Failed to send to ${token.substring(0, 20)}...:`, errorText);
      return false;
    }

    console.log(`✅ [FCM] Notification sent to ${token.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error(`❌ [FCM] Error sending to token:`, error);
    return false;
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 [FCM] Edge function called");
    console.log("🚀 [FCM] Method:", req.method);

    // Parse request payload
    const orderData: OrderPayload = await req.json();
    console.log("📦 [FCM] Order payload:", orderData);

    // Validate required fields
    if (!orderData.order_id || !orderData.order_number) {
      throw new Error("Missing required order fields");
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get all FCM tokens from devices table
    console.log("🔍 [FCM] Fetching device tokens...");
    const { data: devices, error: devicesError } = await supabase
      .from("devices")
      .select("fcm_token");

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    }

    if (!devices || devices.length === 0) {
      console.log("⚠️ [FCM] No devices registered");
      return new Response(
        JSON.stringify({
          message: "No devices to notify",
          success: 0,
          failed: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📱 [FCM] Found ${devices.length} devices`);

    // Get Firebase access token
    const accessToken = await getFirebaseAccessToken();

    // Send notifications to all devices
    let successCount = 0;
    let failureCount = 0;

    for (const device of devices) {
      const success = await sendFCMMessage(
        device.fcm_token,
        accessToken,
        orderData
      );

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(`✅ [FCM] Notifications sent: ${successCount} success, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        success: successCount,
        failed: failureCount,
        total_devices: devices.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ [FCM] Edge function error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
