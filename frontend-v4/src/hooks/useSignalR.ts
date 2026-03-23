import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';

// Derive hub URL from the API base
const getHubUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  if (apiBase && apiBase.startsWith('http')) {
    // Absolute URL: replace /api with /hubs/lottery
    return apiBase.replace(/\/api\/?$/, '/hubs/lottery');
  }
  // Relative or empty: use current origin
  return `${window.location.origin}/hubs/lottery`;
};

export interface LimitAvailability {
  betNumber: string;
  gameTypeId: number;
  drawId: number;
  drawName: string;
  availableAmount: number;
  limitAmount: number;
  currentAmount: number;
  percentageUsed: number;
  isBlocked: boolean;
  blockedBy?: string | null; // "global", "zona", "banca", "local_banca", "no_limit"
}

export interface UseSignalRReturn {
  connected: boolean;
  checkPlayLimit: (betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number) => void;
  reservePlay: (drawId: number, gameTypeId: number, bettingPoolId: number, amount: number) => void;
  releaseReservation: (reservationId: string) => void;
  onLimitAvailability: (callback: (data: LimitAvailability) => void) => void;
  onPlayReserved: (callback: (data: { reservationId: string; drawId: number; gameTypeId: number; amount: number }) => void) => void;
}

export const useSignalR = (): UseSignalRReturn => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const limitCallbackRef = useRef<((data: LimitAvailability) => void) | null>(null);
  const reserveCallbackRef = useRef<((data: { reservationId: string; drawId: number; gameTypeId: number; amount: number }) => void) | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const hubUrl = getHubUrl();
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?access_token=${token}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for limit availability responses
    connection.on('PlayLimitAvailability', (data: LimitAvailability) => {
      limitCallbackRef.current?.(data);
    });

    // Listen for generic notifications (reserve/release)
    connection.on('Notify', (data: { eventName: string; data: Record<string, unknown> }) => {
      if (data.eventName === 'PlayReserved' && reserveCallbackRef.current) {
        reserveCallbackRef.current(data.data as { reservationId: string; drawId: number; gameTypeId: number; amount: number });
      }
    });

    connection.onclose(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));

    connection.start()
      .then(() => {
        setConnected(true);
        console.log('[SignalR] Connected to', hubUrl);
      })
      .catch(err => {
        console.warn('[SignalR] Connection failed:', err);
        setConnected(false);
      });

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  const checkPlayLimit = useCallback((betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    conn.invoke('CheckPlayLimit', { betNumber, gameTypeId, drawId, bettingPoolId })
      .catch(err => console.warn('[SignalR] CheckPlayLimit error:', err));
  }, []);

  const reservePlay = useCallback((drawId: number, gameTypeId: number, bettingPoolId: number, amount: number, betNumber?: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    conn.invoke('ReservePlay', { drawId, gameTypeId, bettingPoolId, amount, betNumber: betNumber || '' })
      .catch(err => console.warn('[SignalR] ReservePlay error:', err));
  }, []);

  const releaseReservation = useCallback((reservationId: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    conn.invoke('ReleaseReservation', reservationId)
      .catch(err => console.warn('[SignalR] ReleaseReservation error:', err));
  }, []);

  const onLimitAvailability = useCallback((callback: (data: LimitAvailability) => void) => {
    limitCallbackRef.current = callback;
  }, []);

  const onPlayReserved = useCallback((callback: (data: { reservationId: string; drawId: number; gameTypeId: number; amount: number }) => void) => {
    reserveCallbackRef.current = callback;
  }, []);

  return {
    connected,
    checkPlayLimit,
    reservePlay,
    releaseReservation,
    onLimitAvailability,
    onPlayReserved,
  };
};
