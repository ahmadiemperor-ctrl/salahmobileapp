import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/hooks/use-language";
import { BusinessHoursProvider } from "@/contexts/BusinessHoursContext";
import { Capacitor } from "@capacitor/core";

import ErrorBoundary from "./components/ErrorBoundary";
import Admin from "./pages/Admin";
import Ordini from "./pages/ordini";
import OrderDashboardPro from "./pages/OrderDashboardPro";
import FullScreenAlarm, { AlarmData } from "./components/FullScreenAlarm";
import { fcmService, FCMNotification } from "./services/fcm.service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const AdminApp = () => {
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);

  // DEBUG WITH VISUAL ALERTS
  setTimeout(() => {
    alert('🚨 ADMIN APP LOADED!');
    alert(`Platform: ${Capacitor.getPlatform()}`);
    alert(`Is Native: ${Capacitor.isNativePlatform()}`);
  }, 1000);

  useEffect(() => {
    console.log('🎬 [AdminApp] useEffect running');
    alert('🎬 useEffect running!');
    
    // TEMPORARILY FORCE INITIALIZATION (TESTING)
    // Initialize FCM - removing platform check temporarily for debugging
    console.log('🔥 [AdminApp] FORCE INITIALIZING FCM (testing mode)');
    alert('🔥 Starting FCM init...');
    
    fcmService.initialize().then((success) => {
      console.log('🔥 [AdminApp] Initialize returned:', success);
      alert(`FCM init result: ${success}`);
      if (success) {
        console.log('✅ [AdminApp] FCM initialized successfully');
        alert('✅ FCM SUCCESS!');
        
        // Set callback for when notifications arrive
        fcmService.setNotificationCallback((notification: FCMNotification) => {
          console.log('📬 [AdminApp] Notification received:', notification);
          
          // Convert FCM notification to alarm data
          const data: AlarmData = {
            title: notification.title,
            body: notification.body,
            order_id: notification.data.order_id,
            order_number: notification.data.order_number,
            customer_name: notification.data.customer_name,
            total_amount: notification.data.total_amount,
            order_type: notification.data.order_type,
            type: notification.data.type,
          };
          
          // Show full-screen alarm
          setAlarmData(data);
          setShowAlarm(true);
        });
      } else {
        console.error('❌ [AdminApp] FCM initialization failed');
      }
    }).catch((error) => {
      console.error('💥 [AdminApp] FCM initialization error:', error);
    });
  }, []);

  const handleStopAlarm = () => {
    console.log('🛑 [AdminApp] Stopping alarm');
    setShowAlarm(false);
    setAlarmData(null);
  };

  const handleViewOrder = () => {
    console.log('👁️ [AdminApp] Viewing order');
    setShowAlarm(false);
    setAlarmData(null);
    // Navigate to ordini page
    window.location.href = '/ordini';
  };

  return (
    <ErrorBoundary componentName="AdminApp">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <BusinessHoursProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin" replace />} />
                  <Route path="/admin" element={
                    <ErrorBoundary componentName="Admin">
                      <Admin />
                    </ErrorBoundary>
                  } />
                  <Route path="/ordini" element={
                    <ErrorBoundary componentName="Ordini">
                      <Ordini />
                    </ErrorBoundary>
                  } />
                  <Route path="/orders" element={
                    <ErrorBoundary componentName="OrderDashboard">
                      <OrderDashboardPro />
                    </ErrorBoundary>
                  } />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </BrowserRouter>
              
              {/* Full-Screen Alarm Overlay */}
              {showAlarm && alarmData && (
                <FullScreenAlarm
                  data={alarmData}
                  onStop={handleStopAlarm}
                  onViewOrder={handleViewOrder}
                />
              )}
            </BusinessHoursProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default AdminApp;
