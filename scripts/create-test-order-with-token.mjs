#!/usr/bin/env node

/**
 * Create Test Order Script with Service Role Token
 * This script uses a service role token to create a test order directly
 * Run with: node scripts/create-test-order-with-token.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://hnoadcbppldmawognwdx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhub2FkY2JwcGxkbWF3b2dud2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODgwMjEsImV4cCI6MjA3MjA2NDAyMX0.cMQBW7VFcWFdVsXY-0H0PaLRDSY13jicT4lPGh9Pmlo';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🧪 Test Order Creation Script with Service Role Token');
console.log('================================================\n');

async function studyDatabase() {
  console.log('📊 Step 1: Studying Database...\n');

  // Check recent orders
  const { data: recentOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('❌ Failed to fetch orders:', ordersError.message);
  } else {
    console.log(`📦 Recent Orders (${recentOrders?.length || 0}):`);
    recentOrders?.forEach((order, i) => {
      console.log(`   ${i + 1}. ${order.order_number} - ${order.status} - €${order.total_amount}`);
    });
    console.log('');
  }

  // Check products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, category_id, is_active')
    .eq('is_active', true)
    .limit(5);

  if (productsError) {
    console.error('❌ Failed to fetch products:', productsError.message);
  } else {
    console.log(`🍕 Active Products (${products?.length || 0}):`);
    products?.forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name} - €${product.price}`);
    });
    console.log('');
  }

  // Check categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .limit(5);

  if (categoriesError) {
    console.error('❌ Failed to fetch categories:', categoriesError.message);
  } else {
    console.log(`📁 Categories (${categories?.length || 0}):`);
    categories?.forEach((category, i) => {
      console.log(`   ${i + 1}. ${category.name} (${category.slug})`);
    });
    console.log('');
  }

  return { recentOrders, products, categories };
}

async function createTestOrder(dbInfo) {
  console.log('📝 Step 2: Creating Test Order...\n');

  const { products } = dbInfo;
  const chosenProduct = products?.[0];
  
  const orderNumber = `TEST-${Date.now().toString().slice(-8)}`;
  const quantity = 2;
  const productPrice = chosenProduct?.price || 25.99;
  const totalAmount = productPrice * quantity;

  console.log(`🎯 Order Details:`);
  console.log(`   Order Number: ${orderNumber}`);
  console.log(`   Product: ${chosenProduct?.name || 'Test Product'}`);
  console.log(`   Quantity: ${quantity}`);
  console.log(`   Price: €${productPrice}`);
  console.log(`   Total: €${totalAmount}\n`);

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: 'Test Customer (Script)',
      customer_email: 'test@efeskebap.com',
      customer_phone: '+39 333 123 4567',
      customer_address: 'Via Test 123, Torino, 10100',
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'pay_later',
      delivery_type: 'delivery',
      notes: 'Test order created via service role token script',
      metadata: {
        createdBy: 'service-role-script',
        scriptToken: 'sbp_***',
        timestamp: new Date().toISOString(),
        productSnapshot: chosenProduct,
        testOrder: true
      }
    })
    .select()
    .single();

  if (orderError) {
    console.error('❌ Failed to create order:', orderError.message);
    throw orderError;
  }

  console.log('✅ Order created successfully!');
  console.log(`   Order ID: ${order.id}`);
  console.log(`   Order Number: ${order.order_number}\n`);

  // Create order item
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      product_id: chosenProduct?.id || 'test-product-id',
      product_name: chosenProduct?.name || 'Test Kebap',
      quantity: quantity,
      product_price: productPrice,
      subtotal: totalAmount,
      metadata: {
        scriptCreated: true
      }
    });

  if (itemError) {
    console.warn('⚠️  Failed to create order item:', itemError.message);
  } else {
    console.log('✅ Order item created successfully!\n');
  }

  // Create notification
  const { error: notificationError } = await supabase
    .from('order_notifications')
    .insert({
      order_id: order.id,
      notification_type: 'new_order',
      message: `New test order ${order.order_number} from Test Customer`,
      is_read: false
    })
    .select();

  if (notificationError) {
    console.warn('⚠️  Failed to create notification:', notificationError.message);
  } else {
    console.log('✅ Notification created successfully!\n');
  }

  return order;
}

async function main() {
  try {
    // Step 1: Study the database
    const dbInfo = await studyDatabase();

    // Step 2: Create test order
    const order = await createTestOrder(dbInfo);

    // Summary
    console.log('================================================');
    console.log('✅ TEST ORDER CREATED SUCCESSFULLY!');
    console.log('================================================');
    console.log(`📦 Order Number: ${order.order_number}`);
    console.log(`💶 Total Amount: €${order.total_amount}`);
    console.log(`📍 Status: ${order.status}`);
    console.log(`🔔 Check your admin panel to see the new order!`);
    console.log('');

  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().then(() => {
  console.log('🏁 Script completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
