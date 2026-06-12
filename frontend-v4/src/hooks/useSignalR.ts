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

// Cache key for play-limit lookups. Bet number normalised to trim cheap whitespace.
const limitCacheKey = (drawId: number, gameTypeId: number, betNumber: string) =>
  `${drawId}_${gameTypeId}_${betNumber.trim()}`;

// Same shape used by the inflight-dedup set — must include the drawDate so that
// same-day and future-sale checks for the same (number, draw) don't collapse
// into one entry, and so the "in-flight" entry actually gets cleared when the
// matching response lands.
const inflightKey = (drawId: number, gameTypeId: number, betNumber: string, drawDate?: string | null) =>
  `${limitCacheKey(drawId, gameTypeId, betNumber)}|${drawDate ?? ''}`;

export interface LimitAvailability {
  betNumber: string;
  gameTypeId: number;
  drawId: number;
  drawName: string;
  /** Draw date this check evaluated against. Echoed by the hub. Null = same-day. */
  drawDate?: string | null;
  availableAmount: number;
  limitAmount: number;
  currentAmount: number;
  percentageUsed: number;
  isBlocked: boolean;
  blockedBy?: string | null; // "global", "zona", "banca", "local_banca", "no_limit", "future_sales_disabled"
}

export interface PlayStats {
  betNumber: string;
  gameTypeId: number;
  drawId: number;
  bettingPoolId: number;
  playCount: number;
  soldInGroup: number;
  soldInPool: number;
}

export interface UseSignalRReturn {
  connected: boolean;
  checkPlayLimit: (betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number, drawDate?: string) => void;
  /**
   * Read the most recent <see cref="LimitAvailability"/> for a key without
   * dispatching a new request. Useful for showing a cached value instantly
   * while a fresh check is in flight (avoids the empty/loading flicker).
   */
  getCachedLimit: (betNumber: string, gameTypeId: number, drawId: number) => LimitAvailability | undefined;
  getPlayStats: (betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number) => void;
  reservePlay: (drawId: number, gameTypeId: number, bettingPoolId: number, amount: number, betNumber?: string) => void;
  releaseReservation: (reservationId: string) => void;
  onLimitAvailability: (callback: (data: LimitAvailability) => void) => void;
  onPlayReserved: (callback: (data: { reservationId: string; drawId: number; gameTypeId: number; amount: number }) => void) => void;
  onPlayStats: (callback: (data: PlayStats) => void) => void;
}

export const useSignalR = (): UseSignalRReturn => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const limitCallbackRef = useRef<((data: LimitAvailability) => void) | null>(null);
  const reserveCallbackRef = useRef<((data: { reservationId: string; drawId: number; gameTypeId: number; amount: number }) => void) | null>(null);
  const playStatsCallbackRef = useRef<((data: PlayStats) => void) | null>(null);
  // Last-seen availability per (drawId, gameTypeId, betNumber). Lets the UI
  // render an instant value while a fresh check is en-route.
  const limitCacheRef = useRef<Map<string, LimitAvailability>>(new Map());
  // De-duplicate in-flight checks: when the user re-types the same number, we
  // skip the redundant invoke until the previous one resolves.
  const inFlightChecksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const hubUrl = getHubUrl();
    // skipNegotiation + WebSockets-only transport saves one round-trip on
    // connection setup. Stayed on the default JSON protocol — MessagePack
    // would need a custom camelCase resolver on the server to match the TS
    // contract, and the savings are dwarfed by the DB-query parallelization
    // in the Hub anyway.
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 500, 1500, 3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for limit availability responses
    connection.on('PlayLimitAvailability', (data: LimitAvailability) => {
      limitCacheRef.current.set(limitCacheKey(data.drawId, data.gameTypeId, data.betNumber), data);
      // Use the same key shape the invoke used (with drawDate echo) so the
      // in-flight entry actually gets cleared and the next invoke for that
      // (number, draw, drawDate) is allowed through.
      inFlightChecksRef.current.delete(inflightKey(data.drawId, data.gameTypeId, data.betNumber, data.drawDate));
      limitCallbackRef.current?.(data);
    });

    // Listen for play stats responses
    connection.on('PlayStats', (data: PlayStats) => {
      playStatsCallbackRef.current?.(data);
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

  const getPlayStats = useCallback((betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    conn.invoke('GetPlayStats', { betNumber, gameTypeId, drawId, bettingPoolId })
      .catch(err => console.warn('[SignalR] GetPlayStats error:', err));
  }, []);

  const checkPlayLimit = useCallback((betNumber: string, gameTypeId: number, drawId: number, bettingPoolId: number, drawDate?: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    // Skip duplicate inflight requests so rapid typing doesn't fan out to the
    // hub. The key includes drawDate so future-sale and same-day checks for
    // the same number stay independent — and the matching response handler
    // clears the entry using the exact same key shape.
    const key = inflightKey(drawId, gameTypeId, betNumber, drawDate);
    if (inFlightChecksRef.current.has(key)) return;
    inFlightChecksRef.current.add(key);

    conn.invoke('CheckPlayLimit', { betNumber, gameTypeId, drawId, bettingPoolId, drawDate })
      .catch(err => {
        inFlightChecksRef.current.delete(key);
        console.warn('[SignalR] CheckPlayLimit error:', err);
      });
  }, []);

  const getCachedLimit = useCallback((betNumber: string, gameTypeId: number, drawId: number) => {
    return limitCacheRef.current.get(limitCacheKey(drawId, gameTypeId, betNumber));
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

  const onPlayStats = useCallback((callback: (data: PlayStats) => void) => {
    playStatsCallbackRef.current = callback;
  }, []);

  return {
    connected,
    checkPlayLimit,
    getCachedLimit,
    getPlayStats,
    reservePlay,
    releaseReservation,
    onLimitAvailability,
    onPlayReserved,
    onPlayStats,
  };
};
