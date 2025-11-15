-- ============================================
-- FCM Devices Table Schema
-- Stores FCM tokens for push notifications
-- ============================================

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_fcm_token ON devices(fcm_token);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow users to view their own devices
CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own devices
CREATE POLICY "Users can insert own devices"
  ON devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own devices
CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own devices
CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service role to access all devices (for edge function)
CREATE POLICY "Service role can access all devices"
  ON devices FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_devices_updated_at_trigger ON devices;
CREATE TRIGGER update_devices_updated_at_trigger
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_devices_updated_at();

-- Grant necessary permissions
GRANT ALL ON devices TO authenticated;
GRANT ALL ON devices TO service_role;

-- ============================================
-- Update notify_new_order trigger to call edge function
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  edge_function_url text;
  service_key text;
  response record;
  headers jsonb;
BEGIN
  -- Build payload with order details
  payload := jsonb_build_object(
    'type', 'new_order',
    'order_id', NEW.id::text,
    'order_number', NEW.order_number,
    'customer_name', NEW.customer_name,
    'total_amount', NEW.total_amount::text,
    'order_type', NEW.order_type,
    'payment_method', NEW.payment_method,
    'created_at', NEW.created_at::text
  );

  -- Set edge function URL (update with your Supabase project ref)
  edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-notification';
  
  -- Use anon key (get from Supabase dashboard)
  service_key := 'YOUR_ANON_KEY';

  -- Build headers with both Authorization and apikey
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || service_key,
    'apikey', service_key,
    'Content-Type', 'application/json'
  );

  -- Call edge function using pg_net extension
  BEGIN
    SELECT INTO response * FROM net.http_post(
      url := edge_function_url,
      body := payload,
      headers := headers
    );

    RAISE NOTICE 'FCM notification triggered, response: %', response;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to send FCM notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to orders table (if not exists)
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- ============================================
-- Instructions for setup:
-- ============================================

-- 1. Run this SQL in Supabase SQL Editor
-- 2. Update edge_function_url with your Supabase project reference
-- 3. Update service_key with your anon key
-- 4. Create the edge function (see edge-function folder)
-- 5. Deploy edge function: npx supabase functions deploy send-order-notification
-- 6. Test by creating a new order

COMMENT ON TABLE devices IS 'Stores FCM device tokens for push notifications';
COMMENT ON COLUMN devices.fcm_token IS 'Firebase Cloud Messaging token for the device';
COMMENT ON COLUMN devices.device_info IS 'JSON object containing device metadata (platform, app version, etc)';
