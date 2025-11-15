/**
 * Full-Screen Alarm Component
 * Displays full-screen overlay when order notification arrives
 * Continuous notification until user stops alarm or swipes notification
 */

import React, { useEffect, useState } from 'react';
import { Bell, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface AlarmData {
  title: string;
  body: string;
  order_id?: string;
  order_number?: string;
  customer_name?: string;
  total_amount?: string;
  order_type?: string;
  type?: string;
}

interface FullScreenAlarmProps {
  data: AlarmData;
  onStop: () => void;
  onViewOrder: () => void;
}

const FullScreenAlarm: React.FC<FullScreenAlarmProps> = ({ data, onStop, onViewOrder }) => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    // Prevent scrolling when alarm is shown
    document.body.style.overflow = 'hidden';

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 1000);

    return () => {
      document.body.style.overflow = 'unset';
      clearInterval(pulseInterval);
    };
  }, []);

  const isOrder = data.type === 'new_order' || data.order_id;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-red-600 via-orange-500 to-red-700 flex items-center justify-center p-4">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Pulsing icon */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              transition-all duration-1000 ease-in-out
              ${pulse ? 'scale-100 opacity-100' : 'scale-125 opacity-80'}
            `}
          >
            <div className="bg-white rounded-full p-8 shadow-2xl">
              <Bell className="w-24 h-24 text-red-600 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {data.title || '🍕 NUOVO ORDINE!'}
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            {data.body || 'Un nuovo ordine è arrivato'}
          </p>
        </div>

        {/* Order details card */}
        <Card className="mb-6 shadow-2xl border-4 border-white/30">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="text-center text-xl text-gray-800">
              {isOrder ? 'Dettagli Ordine' : 'Dettagli Notifica'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-white">
            <div className="space-y-3 text-center">
              {data.order_number && (
                <div>
                  <div className="text-sm text-gray-500 font-medium">Numero Ordine</div>
                  <div className="text-2xl font-bold text-gray-900">{data.order_number}</div>
                </div>
              )}

              {data.customer_name && (
                <div>
                  <div className="text-sm text-gray-500 font-medium">Cliente</div>
                  <div className="text-lg font-semibold text-gray-800">{data.customer_name}</div>
                </div>
              )}

              {data.total_amount && (
                <div>
                  <div className="text-sm text-gray-500 font-medium">Totale</div>
                  <div className="text-xl font-bold text-green-600">€{data.total_amount}</div>
                </div>
              )}

              {data.order_type && (
                <div>
                  <div className="text-sm text-gray-500 font-medium">Tipo</div>
                  <div className="text-lg font-semibold text-blue-600 capitalize">
                    {data.order_type === 'delivery' ? 'Consegna' : 'Asporto'}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={onViewOrder}
            className="w-full h-16 text-xl font-bold bg-white text-red-600 hover:bg-red-50 shadow-xl"
            size="lg"
          >
            <Eye className="w-6 h-6 mr-2" />
            VISUALIZZA ORDINE
          </Button>

          <Button
            onClick={onStop}
            variant="outline"
            className="w-full h-14 text-lg font-semibold bg-white/10 text-white border-2 border-white/50 hover:bg-white/20 shadow-xl"
            size="lg"
          >
            <X className="w-5 h-5 mr-2" />
            FERMA ALLARME
          </Button>
        </div>

        {/* Instruction text */}
        <p className="text-center text-white/80 text-sm mt-4 drop-shadow">
          L'allarme continuerà finché non lo fermi o scorri via la notifica
        </p>
      </div>

      {/* Corner pulse indicators */}
      <div className="absolute top-4 left-4 w-4 h-4 bg-white rounded-full animate-ping" />
      <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-4 right-4 w-4 h-4 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};

export default FullScreenAlarm;
