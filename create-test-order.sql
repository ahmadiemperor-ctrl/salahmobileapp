-- 🔔 FCM NOTIFICATION TEST - Create Test Order
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
  status,
  created_at;
