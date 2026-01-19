// hooks/useShopApi.ts - FIXED VERSION
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../api/shopApi'; // Import the class instance

export const useAllShops = (params?: any) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: () => shopApi.getAllShops(params),
    select: (data) => data.data,
  });
};

export const useShopById = (identifier: string) => {
  return useQuery({
    queryKey: ['shop', identifier],
    queryFn: () => shopApi.getShopById(identifier),
    select: (data) => data.data,
    enabled: !!identifier,
  });
};

export const useMyShop = () => {
  return useQuery({
    queryKey: ['myShop'],
    queryFn: () => shopApi.getMyShop(),
    select: (data) => data.data,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => shopApi.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useUpdateShop = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => shopApi.updateShop(shopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useDeleteShop = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => shopApi.deleteShop(shopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

// Additional hooks you might need:

export const useUploadShopImages = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (images: any) => shopApi.uploadShopImages(shopId, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useUpdateShopStatus = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (status: 'open' | 'closed' | 'busy') => shopApi.updateShopStatus(shopId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useShopStats = (shopId: string) => {
  return useQuery({
    queryKey: ['shopStats', shopId],
    queryFn: () => shopApi.getShopStats(shopId),
    select: (data) => data.data,
    enabled: !!shopId,
  });
};