"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { io, Socket } from "socket.io-client";

export interface StockUpdateEvent {
    toyId: string;
    slug?: string;
    name?: string;
    stockQuantity: number;
    availableQuantity: number;
    status: string;
    timestamp: number;
}

interface StockContextType {
    lastUpdate: StockUpdateEvent | null;
    stockMap: Map<string, StockUpdateEvent>;
    isConnected: boolean;
    updateCount: number;
    getStock: (toyId: string) => StockUpdateEvent | undefined;
    getStockBySlug: (slug: string) => StockUpdateEvent | undefined;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://louaab.ma';

export function StockProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<StockUpdateEvent | null>(null);
    const [stockMap, setStockMap] = useState<Map<string, StockUpdateEvent>>(new Map());
    const [updateCount, setUpdateCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);
    const slugMapRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const socket = io(`${SOCKET_URL}/stock`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[StockSync] Connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', (reason: string) => {
            console.log('[StockSync] Disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error: Error) => {
            console.warn('[StockSync] Connection error:', error.message);
            setIsConnected(false);
        });

        socket.on('stock:updated', (update: StockUpdateEvent) => {
            console.log('[StockSync] Stock update received:', update);
            setLastUpdate(update);
            setUpdateCount(prev => prev + 1);

            setStockMap(prev => {
                const next = new Map(prev);
                next.set(update.toyId, update);
                return next;
            });

            if (update.slug) {
                slugMapRef.current.set(update.slug, update.toyId);
            }
        });

        socket.on('stock:bulk-updated', (data: { toys: StockUpdateEvent[]; timestamp: number }) => {
            console.log('[StockSync] Bulk update received:', data.toys.length, 'toys');
            setUpdateCount(prev => prev + data.toys.length);

            setStockMap(prev => {
                const next = new Map(prev);
                data.toys.forEach(update => {
                    next.set(update.toyId, update);
                    if (update.slug) {
                        slugMapRef.current.set(update.slug, update.toyId);
                    }
                });
                return next;
            });

            if (data.toys.length > 0) {
                setLastUpdate(data.toys[data.toys.length - 1]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getStock = useCallback((toyId: string) => {
        return stockMap.get(toyId);
    }, [stockMap]);

    const getStockBySlug = useCallback((slug: string) => {
        const toyId = slugMapRef.current.get(slug);
        if (toyId) {
            return stockMap.get(toyId);
        }
        for (const update of stockMap.values()) {
            if (update.slug === slug) {
                return update;
            }
        }
        return undefined;
    }, [stockMap]);

    return (
        <StockContext.Provider
            value={{
                lastUpdate,
                stockMap,
                isConnected,
                updateCount,
                getStock,
                getStockBySlug,
            }}
        >
            {children}
        </StockContext.Provider>
    );
}

export function useStock() {
    const context = useContext(StockContext);
    if (context === undefined) {
        throw new Error('useStock must be used within a StockProvider');
    }
    return context;
}

export function useToyStock(toyIdOrSlug: string) {
    const { getStock, getStockBySlug, lastUpdate, isConnected } = useStock();

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(toyIdOrSlug);

    const stockInfo = isUUID
        ? getStock(toyIdOrSlug)
        : getStockBySlug(toyIdOrSlug);

    const wasJustUpdated = lastUpdate && (
        lastUpdate.toyId === toyIdOrSlug ||
        lastUpdate.slug === toyIdOrSlug
    );

    return {
        stockInfo,
        wasJustUpdated,
        isConnected,
        isAvailable: stockInfo ? stockInfo.availableQuantity > 0 : undefined,
        stockQuantity: stockInfo?.stockQuantity,
        availableQuantity: stockInfo?.availableQuantity,
    };
}
