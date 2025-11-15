# 🧪 How to Test FCM Notification - READY NOW!
**Status:** App is running, ready for test!

---

## 🎯 Quick Test - Go to Supabase SQL Editor

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/hnoadcbppldmawognwdx/sql/new

### Step 2: Copy & Paste This SQL:
```sql
-- Create test order to trigger FCM notification
INSERT INTO orders (
  order_number, 
  customer_name, 
  customer_phone,
  total_amount, 
  status, 
  payment_method,
  order_type
) VALUES (
  'FCM-TEST-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
  'FCM Test Customer',
  '+39 123 456 7890',
  199.99,
  'pending',
  'card',
  'delivery'
)
RETURNING 
  id,
  order_number,
  customer_name,
  total_amount,
  created_at;
```

### Step 3: Click "Run" (or press CTRL+Enter)

---

## 📱 What Should Happen:

### If FCM is working:
1. 🔔 **Notification appears** on your phone
2. 🚨 **Full-screen alarm** displays (if app is open)
3. 🎵 **Sound plays**
4. 📱 Order details shown on screen

### If notification doesn't appear:
**Possible reasons:**
1. ⏳ FCM token not registered yet (devices table empty)
2. 🔕 Edge function not deployed
3. ⚙️ Trigger not configured correctly

---

## 🔍 After Running the SQL - Check These:

### Check 1: Was order created?
Look at the SQL result - you should see the new order with its ID and details.

### Check 2: Check devices table
```sql
SELECT * FROM devices ORDER BY created_at DESC LIMIT 1;
```
- **If empty:** FCM service hasn't initialized yet
- **If has data:** Token is registered ✅

### Check 3: Check database logs
Go to: https://supabase.com/dashboard/project/hnoadcbppldmawognwdx/logs/explorer

Look for:
- Trigger execution
- Edge function calls
- Any errors

---

## 🎯 Current Status:

✅ **App running** on your phone  
✅ **All code ready**  
✅ **Database ready**  
⏳ **Waiting for test order**

---

## 💡 Important Note:

**The notification system has 2 parts:**

### Part 1: FCM Token Registration (happens automatically)
- App opens → FCM initializes → Token saved to `devices` table
- **This might take 10-30 seconds on first launch**

### Part 2: Order Notification (triggered by new order)
- New order → Trigger fires → Edge function → Notification sent
- **This only works if Part 1 completed successfully**

---

## 🚀 Next Steps:

1. **Run the SQL above** in Supabase
2. **Watch your phone** for notification
3. **Tell me what happened:**
   - ✅ Got notification?
   - ❌ No notification?
   - 🤔 Something else?

Then we'll debug from there!

---

**Ready to test!** Just run that SQL in Supabase SQL Editor! 🎯
