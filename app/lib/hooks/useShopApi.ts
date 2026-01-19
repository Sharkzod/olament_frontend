// hooks/useShopApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getAllShops, 
  getShopById, 
  getMyShop, 
  createShop, 
  updateShop,
  uploadShopImages,
  updateShopStatus,
  deleteShop
} from '../api/shopApi';

export const useAllShops = (params?: any) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: () => getAllShops(params),
    select: (data) => data.data,
  });
};

export const useShopById = (identifier: string) => {
  return useQuery({
    queryKey: ['shop', identifier],
    queryFn: () => getShopById(identifier),
    select: (data) => data.data,
    enabled: !!identifier,
  });
};

export const useMyShop = () => {
  return useQuery({
    queryKey: ['myShop'],
    queryFn: getMyShop,
    select: (data) => data.data,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useUpdateShop = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => updateShop(shopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};

export const useDeleteShop = (shopId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => deleteShop(shopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};