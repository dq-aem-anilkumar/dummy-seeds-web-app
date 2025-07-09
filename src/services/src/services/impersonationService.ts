import api from "@/services/api";

export interface OTPRequest {
  userId: string;
  contactMode: 'EMAIL' | 'MOBILE';
}

export interface OTPVerify {
  userId: string;
  otp: string;
}

export const impersonationService = {
  requestOTP: async (data: OTPRequest) => {
    const response = await api.post('/web/api/v1/impersonation/request', data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerify) => {
    const response = await api.post('/web/api/v1/impersonation/verify', data);
    return response.data;
  },

  exitImpersonation: async () => {
    const response = await api.post('/web/api/v1/impersonation/exit');
    return response.data;
  },

  extendSession: async () => {
    const response = await api.post('/web/api/v1/impersonation/extend');
    return response.data;
  }
};
