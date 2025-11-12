"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface PackReservation {
  id: string;
  packName: string;
  packPrice: string;
  packDescription: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface PackReservationsContextType {
  reservations: PackReservation[];
  addReservation: (reservation: Omit<PackReservation, 'id' | 'createdAt'>) => void;
  updateReservationStatus: (reservationId: string, status: PackReservation['status']) => void;
  getReservationById: (reservationId: string) => PackReservation | undefined;
  getReservationsByStatus: (status: PackReservation['status']) => PackReservation[];
  getTotalReservations: () => number;
  getPendingReservations: () => PackReservation[];
}

const PackReservationsContext = createContext<PackReservationsContextType | undefined>(undefined);

export const PackReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<PackReservation[]>([]);

  // Load reservations from localStorage on mount
  useEffect(() => {
    const storedReservations = localStorage.getItem('louaab_pack_reservations');
    if (storedReservations) {
      setReservations(JSON.parse(storedReservations));
    }
  }, []);

  // Save reservations to localStorage on changes
  useEffect(() => {
    localStorage.setItem('louaab_pack_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const generateReservationId = () => {
    return `pack-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const addReservation = (reservationData: Omit<PackReservation, 'id' | 'createdAt'>) => {
    const newReservation: PackReservation = {
      ...reservationData,
      id: generateReservationId(),
      createdAt: new Date().toISOString(),
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservationStatus = (reservationId: string, status: PackReservation['status']) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === reservationId ? { ...reservation, status } : reservation
    ));
  };

  const getReservationById = (reservationId: string) => {
    return reservations.find(reservation => reservation.id === reservationId);
  };

  const getReservationsByStatus = (status: PackReservation['status']) => {
    return reservations.filter(reservation => reservation.status === status);
  };

  const getTotalReservations = () => {
    return reservations.length;
  };

  const getPendingReservations = () => {
    return reservations.filter(reservation => reservation.status === 'pending');
  };

  return (
    <PackReservationsContext.Provider
      value={{
        reservations,
        addReservation,
        updateReservationStatus,
        getReservationById,
        getReservationsByStatus,
        getTotalReservations,
        getPendingReservations,
      }}
    >
      {children}
    </PackReservationsContext.Provider>
  );
};

export const usePackReservations = () => {
  const context = useContext(PackReservationsContext);
  if (context === undefined) {
    throw new Error('usePackReservations must be used within a PackReservationsProvider');
  }
  return context;
};
