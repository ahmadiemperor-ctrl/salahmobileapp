// Database Study + Test Order Script
// Usage: Copy entire file into the browser console while running the site (admin page recommended)
// Then run: studyDbAndCreateOrder()

console.log('📊 Database Study + Test Order Script loaded');

const studyDbAndCreateOrder = async (options = {}) => {
  const {
    orderAmount = 29.5,
    quantity = 1,
    notes = 'Test order created by database study script'
  } = options;

  try {
    const { supabase } = await import('./src/integrations/supabase/client.js');

    const logSection = (title) => {
      console.log('\n==============================');
      console.log(title);
      console.log('==============================');
    };

    logSection('1️⃣ Studying database tables');

    // Recent orders
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Failed to fetch orders:', ordersError.message);
    } else {
      console.table(recentOrders || [], ['order_number', 'status', 'total_amount', 'created_at']);
    }

    // Product snapshot
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, category_id, stock_quantity, is_active')
      .order('updated_at', { ascending: false })
      .limit(8);

    if (productsError) {
      console.error('❌ Failed to fetch products:', productsError.message);
    } else {
      console.log('💐 Product sample (latest 8):');
      console.table(products || [], ['id', 'name', 'price', 'category_id', 'stock_quantity', 'is_active']);
    }

    // Categories snapshot
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .order('sort_order', { ascending: true })
      .limit(12);

    if (categoriesError) {
      console.error('❌ Failed to fetch categories:', categoriesError.message);
    } else {
      console.log('📁 Categories snapshot:');
      console.table(categories || [], ['id', 'name', 'slug', 'sort_order']);
    }

    // Order counts by status
    if (recentOrders && recentOrders.length > 0) {
      const statusMap = recentOrders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Status distribution (last 5 orders):', statusMap);
    }

    logSection('2️⃣ Creating test order');

    const chosenProduct = (products || []).find((p) => p.is_active) || products?.[0];
    const finalPrice = chosenProduct?.price ?? orderAmount;

    const orderNumber = `DBTEST-${Date.now().toString().slice(-6)}`;

    const { data: order, error: orderCreateError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: 'Database Script Tester',
        customer_email: 'tester@example.com',
        customer_phone: '+39 333 000 0000',
        customer_address: 'Via Automazione 42, Torino',
        total_amount: finalPrice * quantity,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'pay_later',
        metadata: {
          createdBy: 'db-study-script',
          categoryContext: chosenProduct?.category_id || null,
          productSnapshot: chosenProduct || null,
          inspectedTables: {
            orders: recentOrders?.length || 0,
            products: products?.length || 0,
            categories: categories?.length || 0,
          },
          timestamp: new Date().toISOString(),
        },
        notes,
      })
      .select()
      .single();

    if (orderCreateError) {
      console.error('❌ Failed to create test order:', orderCreateError.message);
      return;
    }

    console.log('✅ Order created:', order.order_number);

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: chosenProduct?.id || 'db-study-product',
        product_name: chosenProduct?.name || 'Database Study Bouquet',
        quantity,
        product_price: finalPrice,
        subtotal: finalPrice * quantity,
        metadata: {
          script: 'db-study-order',
          priceReference: finalPrice,
        },
      });

    if (itemError) {
      console.warn('⚠️ Order created but failed to add line item:', itemError.message);
    } else {
      console.log('🧾 Order item saved successfully');
    }

    // Optional notification record
    const { error: notificationError } = await supabase
      .from('order_notifications')
      .insert({
        order_id: order.id,
        notification_type: 'new_order',
        message: `Nuovo ordine di test ${order.order_number} creato tramite script database`,
        is_read: false,
      });

    if (notificationError) {
      console.warn('⚠️ Notification not created:', notificationError.message);
    } else {
      console.log('🔔 Notification record inserted');
    }

    logSection('3️⃣ Summary');
    console.log('🆔 Order ID:', order.id);
    console.log('📦 Order Number:', order.order_number);
    console.log('💶 Total:', order.total_amount);
    console.log('📝 Notes:', notes);
    console.log('\n✅ Done! Check the admin Orders view to see the new test order.');

    return { order, chosenProduct };
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
};

window.studyDbAndCreateOrder = studyDbAndCreateOrder;
console.log('💡 Run studyDbAndCreateOrder() to start. Optionally pass { orderAmount, quantity, notes }.');
