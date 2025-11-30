import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppSelector } from '@redux/store';
import walletService, { IPayoutRequirementField } from '@services/walletService';

export const usePayoutRequirements = () => {
  const [requiredFields, setRequiredFields] = useState<IPayoutRequirementField[]>([]);
  const [optionalFields, setOptionalFields] = useState<IPayoutRequirementField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>('');

  const { token } = useAppSelector((state) => state.userProfileSlice);

  const allFields = useMemo(() => {
    const combined = [...requiredFields, ...optionalFields];
    return combined.sort((a, b) => a.order - b.order);
  }, [requiredFields, optionalFields]);

  const fetchRequirements = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await walletService.getPayoutRequirements(token);

      if (response?.status === 200 && response?.data) {
        const fields = response.data.fields || [];
        const required = fields.filter((field) => field.isRequired);
        const optional = fields.filter((field) => !field.isRequired);
        
        setRequiredFields(required);
        setOptionalFields(optional);
        setCountryCode(response.data.countryCountry || '');
      } else if (response?.responseCode === 401) {
        setError('Authentication failed');
        setRequiredFields([]);
        setOptionalFields([]);
      } else {
        setError(response?.message || 'Failed to fetch requirements');
        setRequiredFields([]);
        setOptionalFields([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payout requirements';
      setError(errorMessage);
      setRequiredFields([]);
      setOptionalFields([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return {
    requiredFields,
    optionalFields,
    allFields,
    loading,
    error,
    countryCode,
    refetch: fetchRequirements,
  };
};

