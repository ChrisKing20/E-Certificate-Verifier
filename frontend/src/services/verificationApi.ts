import { apiFetch } from './api';
import { VerificationResultData } from '../types/verification';

export const verifyCertificateByNumberApi = async (certificateId: string): Promise<VerificationResultData> => {
  const trimmed = certificateId.trim().toUpperCase();
  if (!trimmed) {
    return {
      status: 'INVALID',
      reason: 'Please enter a certificate number.',
      verifiedAt: new Date().toLocaleString(),
      method: 'number',
    };
  }

  try {
    const data = await apiFetch<VerificationResultData>(`/verify/number/${encodeURIComponent(trimmed)}`);
    return {
      ...data,
      method: 'number',
      searchedTerm: certificateId,
    };
  } catch (error: any) {
    return {
      status: 'INVALID',
      reason: error.message || 'Unable to connect to verification server.',
      verifiedAt: new Date().toLocaleString(),
      method: 'number',
      searchedTerm: certificateId,
    };
  }
};

export const verifyCertificateByPdfApi = async (file: File): Promise<VerificationResultData> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const data = await apiFetch<VerificationResultData>('/verify/pdf', {
      method: 'POST',
      body: formData,
    });
    return {
      ...data,
      method: 'pdf',
      searchedTerm: file.name,
    };
  } catch (error: any) {
    return {
      status: 'INVALID',
      reason: error.message || 'Verification server error while processing PDF.',
      verifiedAt: new Date().toLocaleString(),
      method: 'pdf',
      searchedTerm: file.name,
    };
  }
};
