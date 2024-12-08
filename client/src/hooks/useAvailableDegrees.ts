// src/hooks/useAvailableDegrees.ts

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Degree } from '../types/Degree';

export const useAvailableDegrees = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableDegrees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees/available-to-claim`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDegrees(response.data.degrees);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch available degrees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDegrees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { degrees, loading, error, refetch: fetchAvailableDegrees };
};
