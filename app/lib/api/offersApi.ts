import apiClient from './apiClient';

export interface Offer {
  _id: string;
  chat: string;
  product: any;
  initiator: { _id: string; name: string; avatar?: string };
  recipient: { _id: string; name: string; avatar?: string };
  price: number;
  quantity: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired' | 'withdrawn';
  parentOffer?: string;
  order?: { _id: string; orderNumber: string; status: string };
  respondedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MakeOfferParams {
  chatId: string;
  price: number;
  quantity?: number;
  message?: string;
}

export interface RespondParams {
  action: 'accept' | 'decline';
}

export interface CounterOfferParams {
  price: number;
  quantity?: number;
  message?: string;
}

export interface OfferResponse {
  success: boolean;
  message: string;
  data: {
    offer: Offer;
    message?: any;
    order?: any;
    systemMessage?: any;
  };
}

export const makeOffer = async (params: MakeOfferParams): Promise<OfferResponse> => {
  const response = await apiClient.post('/offers', params);
  return response.data;
};

export const respondToOffer = async (
  offerId: string,
  params: RespondParams
): Promise<OfferResponse> => {
  const response = await apiClient.put(`/offers/${offerId}/respond`, params);
  return response.data;
};

export const counterOffer = async (
  offerId: string,
  params: CounterOfferParams
): Promise<OfferResponse> => {
  const response = await apiClient.post(`/offers/${offerId}/counter`, params);
  return response.data;
};

export const withdrawOffer = async (offerId: string): Promise<OfferResponse> => {
  const response = await apiClient.put(`/offers/${offerId}/withdraw`);
  return response.data;
};

export const getChatOffers = async (chatId: string): Promise<{ success: boolean; data: Offer[] }> => {
  const response = await apiClient.get(`/offers/chat/${chatId}`);
  return response.data;
};
