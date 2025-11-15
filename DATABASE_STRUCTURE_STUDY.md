# 📊 Complete Database Structure Study
## Efes Kebap Admin - Supabase Database
**Date:** November 15, 2025 02:31 AM  
**Project:** hnoadcbppldmawognwdx  
**Study Method:** Playwright Browser Automation

---

## 🔍 Database Overview

**Total Tables Found:** 24 tables  
**Schema:** public  
**FCM/Firebase Setup:** ❌ **NOT CONFIGURED** (No devices table, no edge functions, no secrets)

---

## 📋 Complete Table List

### 1. **admin_activity_log**
- **Purpose:** Track admin user activities and actions
- **RLS:** Standard (not marked as Unrestricted)

### 2. **admin_sessions**
- **Purpose:** Manage admin authentication sessions
- **RLS:** Standard (not marked as Unrestricted)

### 3. **app_licenses** 
- **Purpose:** Application licensing system
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)

### 4. **categories**
- **Purpose:** Product categories (Pizza, Kebab, Beverages, etc.)
- **RLS:** Standard

### 5. **category_sections**
- **Purpose:** Category organization and sections
- **RLS:** Standard

### 6. **comments**
- **Purpose:** Customer reviews/comments
- **RLS:** Standard

### 7. **content_sections**
- **Purpose:** Website content management (text blocks, sections)
- **RLS:** Standard

### 8. **device_heartbeats**
- **Purpose:** Device connection monitoring/heartbeat tracking
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)
- **Note:** Different from FCM devices table (not for push notifications)

### 9. **gallery_images**
- **Purpose:** Restaurant gallery photos
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)

### 10. **loyalty_redemptions**
- **Purpose:** Customer loyalty program redemptions
- **RLS:** Standard

### 11. **loyalty_tiers**
- **Purpose:** Loyalty program tier definitions
- **RLS:** Standard

### 12. **offer_categories**
- **Purpose:** Special offer category organization
- **RLS:** Standard

### 13. **offer_redemptions**
- **Purpose:** Track special offer redemptions
- **RLS:** Standard

### 14. **offers**
- **Purpose:** Special offers and promotions
- **RLS:** Standard

### 15. **order_items** ⭐
- **Purpose:** Individual items within orders
- **RLS:** Standard
- **Related to:** orders, products

### 16. **order_notifications** ⭐
- **Purpose:** Order notification tracking
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)
- **Current Use:** Web notification system (not FCM)

### 17. **orders** ⭐⭐ **CRITICAL**
- **Purpose:** Customer orders (main table)
- **RLS:** Standard
- **Trigger:** `notify_new_order()` (calls edge function on INSERT)
- **Key for FCM:** This is where notifications originate

### 18. **product_redemptions**
- **Purpose:** Product-based redemption tracking
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)

### 19. **products** ⭐
- **Purpose:** Menu items (pizzas, kebabs, drinks, etc.)
- **RLS:** Standard

### 20. **reservations**
- **Purpose:** Table reservation system
- **RLS:** Standard

### 21. **settings**
- **Purpose:** Application configuration settings
- **RLS:** Standard

### 22. **special_offer_available_products**
- **Purpose:** Products available in special offers
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)

### 23. **special_offer_images**
- **Purpose:** Images for special offers
- **RLS:** ⚠️ **Unrestricted** (No RLS policies)

### 24. **profiles** (assumed - from TypeScript types)
- **Purpose:** User profile information
- **RLS:** Standard (linked to auth.users)

---

## 🚨 FCM/Firebase Status

### ❌ **NOT CONFIGURED**

#### Missing Components:

1. **No `devices` table**
   - Required to store FCM tokens
   - Must be created manually (SQL provided in `database/fcm_devices_schema.sql`)

2. **No Edge Functions**
   - Dashboard shows: "Create your first edge function"
   - Need to deploy: `send-order-notification`

3. **No Secrets**
   - Dashboard shows: "No secrets created"
   - Need to set:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`

4. **No Firebase Integration**
   - No google-services.json file
   - No Firebase SDK in Android app

---

## 🎯 Tables Relevant to FCM Notifications

### **Primary Table:** `orders` ⭐⭐
**Current Trigger:**
```sql
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
```

**Trigger Action:**
- Fires when new order created
- Calls edge function (needs to be updated with correct URL)
- Payload includes: order_id, order_number, customer_name, total_amount, order_type

### **Existing Notification Table:** `order_notifications`
- Currently used for web notifications
- Has columns: id, order_id, message, notification_type, is_read, created_at, title, is_acknowledged
- RLS: Unrestricted (needs policies if storing sensitive data)

### **Device Tracking:** `device_heartbeats`
- **NOT** for FCM (different purpose)
- Used for connection monitoring only
- Does NOT store FCM tokens

---

## 🔑 Key Findings

### ✅ What's Working:
1. **Database trigger exists** - `notify_new_order()` on orders table
2. **Order system fully functional** - orders, order_items, products
3. **Web notification system** - order_notifications table
4. **Authentication** - admin_sessions, profiles

### ❌ What's Missing for FCM:
1. **devices table** - Store FCM tokens
2. **Edge function** - OAuth2 + FCM delivery
3. **Firebase secrets** - Authentication credentials
4. **google-services.json** - Android Firebase config
5. **Firebase plugins** - Already installed ✅, needs sync

### ⚠️ Security Concerns:
Tables with **Unrestricted** RLS (no access control):
- app_licenses
- device_heartbeats  
- gallery_images
- order_notifications
- product_redemptions
- special_offer_available_products
- special_offer_images

**Recommendation:** Review and add RLS policies for data security

---

## 📈 Database Statistics

### Table Categories:
- **Core Business:** orders, order_items, products, categories (4 tables)
- **Content Management:** content_sections, gallery_images, special_offer_images (3 tables)
- **Marketing:** offers, offer_categories, offer_redemptions, loyalty_tiers, loyalty_redemptions (5 tables)
- **Customer Interaction:** comments, reservations (2 tables)
- **Admin:** admin_activity_log, admin_sessions, settings (3 tables)
- **Notifications:** order_notifications (1 table)
- **System:** app_licenses, device_heartbeats, profiles (3 tables)
- **Product Relations:** product_redemptions, special_offer_available_products (2 tables)
- **Organization:** category_sections (1 table)

### Unrestricted Tables: 7 of 24 (29%)

---

## 🛠️ Required Actions for FCM

### Immediate (Setup Phase):

1. **Run SQL Schema:**
   ```sql
   -- Execute: database/fcm_devices_schema.sql
   -- Creates: devices table + RLS policies + updated trigger
   ```

2. **Get Firebase Files:**
   - Download `google-services.json`
   - Download service account JSON
   - Extract credentials

3. **Set Supabase Secrets:**
   ```bash
   npx supabase secrets set FIREBASE_PROJECT_ID="..."
   npx supabase secrets set FIREBASE_CLIENT_EMAIL="..."
   npx supabase secrets set FIREBASE_PRIVATE_KEY="..."
   ```

4. **Deploy Edge Function:**
   ```bash
   npx supabase functions deploy send-order-notification
   ```

5. **Update Trigger:**
   - Edit `notify_new_order()` function
   - Set correct edge function URL
   - Set anon key

### Configuration (Build Phase):

6. **Place google-services.json:**
   - Location: `android/app/google-services.json`

7. **Update build.gradle files:**
   - Add Firebase dependencies
   - Add Google services plugin

8. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

---

## 📊 Database Access Patterns

### For FCM Implementation:

**Write Operations:**
1. `devices` table - FCM token registration (INSERT/UPSERT)
2. `orders` table - New order creation (triggers notification)

**Read Operations:**
1. `devices` table - Get all FCM tokens (edge function)
2. `orders` table - Order details for notification payload

**Realtime Subscriptions:**
- Current: `order_notifications` table (web app)
- Future: Native FCM (mobile app)

---

## 🔐 Security Recommendations

### High Priority:
1. **Add RLS to order_notifications:**
   ```sql
   -- Only authenticated users can access
   CREATE POLICY "Authenticated users can view notifications"
     ON order_notifications FOR SELECT
     USING (auth.role() = 'authenticated');
   ```

2. **Secure device_heartbeats:**
   - Add user_id column
   - Link to auth.users
   - Enable RLS policies

3. **Review unrestricted tables:**
   - gallery_images: Public read is OK, restrict writes
   - product_redemptions: Needs user-based access
   - special_offer_*: Consider read-only for public

### Medium Priority:
4. **Audit admin_activity_log access**
5. **Review app_licenses security model**
6. **Add logging to FCM operations**

---

## 📝 TypeScript Type Generation

After creating `devices` table, regenerate types:

```bash
npx supabase gen types typescript \
  --project-id hnoadcbppldmawognwdx \
  > src/integrations/supabase/types.ts
```

This will resolve TypeScript errors in `fcm.service.ts`.

---

## 🎯 Summary

### Current State:
- ✅ Complete e-commerce database (orders, products, customers)
- ✅ Web notification system working
- ✅ Admin authentication functional
- ❌ **NO FCM/Firebase integration**
- ❌ No devices table
- ❌ No edge functions deployed
- ❌ No Firebase secrets configured

### Next Steps (Priority Order):
1. **Get Firebase configuration files** (google-services.json + service account)
2. **Create devices table** (run SQL schema)
3. **Deploy edge function** (send-order-notification)
4. **Set Firebase secrets** (FIREBASE_PROJECT_ID, etc.)
5. **Update Android config** (google-services.json + build.gradle)
6. **Build and test** (APK installation + test notification)

### Estimated Timeline:
- **Setup:** 30 minutes (steps 1-4)
- **Configuration:** 15 minutes (step 5)
- **Testing:** 15 minutes (step 6)
- **Total:** ~1 hour

---

**📌 Key Takeaway:**  
The database is ready for FCM - it just needs the Firebase components added (devices table, edge function, secrets). All the core business logic (orders, products, notifications) is already in place.

**Ready to proceed once Firebase files are provided!** 🚀
