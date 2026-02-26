'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Offer,
  makeOffer as makeOfferApi,
  respondToOffer as respondApi,
  counterOffer as counterApi,
  withdrawOffer as withdrawApi,
  getChatOffers,
} from '../api/offersApi';

interface UseOffersOptions {
  autoFetch?: boolean;
}

export const useOffers = (chatId: string, options: UseOffersOptions = {}) => {
  const { autoFetch = true } = options;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getChatOffers(chatId);
      if (response.success) {
        setOffers(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (autoFetch && chatId) {
      fetchOffers();
    }
  }, [autoFetch, chatId, fetchOffers]);

  const activeOffer = useMemo(() => {
    return offers.find((o) => o.status === 'pending') || null;
  }, [offers]);

  const makeOffer = useCallback(
    async (price: number, quantity?: number, message?: string) => {
      if (!chatId) throw new Error('No chat ID');
      const response = await makeOfferApi({ chatId, price, quantity, message });
      if (response.success) {
        await fetchOffers();
      }
      return response;
    },
    [chatId, fetchOffers]
  );

  const respond = useCallback(
    async (offerId: string, action: 'accept' | 'decline') => {
      const response = await respondApi(offerId, { action });
      if (response.success) {
        await fetchOffers();
      }
      return response;
    },
    [fetchOffers]
  );

  const counter = useCallback(
    async (offerId: string, price: number, quantity?: number, message?: string) => {
      const response = await counterApi(offerId, { price, quantity, message });
      if (response.success) {
        await fetchOffers();
      }
      return response;
    },
    [fetchOffers]
  );

  const withdraw = useCallback(
    async (offerId: string) => {
      const response = await withdrawApi(offerId);
      if (response.success) {
        await fetchOffers();
      }
      return response;
    },
    [fetchOffers]
  );

  // Update a single offer's status in local state (for real-time socket updates)
  const updateOfferStatus = useCallback(
    (offerId: string, status: Offer['status']) => {
      setOffers((prev) =>
        prev.map((o) => (o._id === offerId ? { ...o, status } : o))
      );
    },
    []
  );

  return {
    offers,
    activeOffer,
    loading,
    error,
    makeOffer,
    respond,
    counter,
    withdraw,
    fetchOffers,
    updateOfferStatus,
  };
};
