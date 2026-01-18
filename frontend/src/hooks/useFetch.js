import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';

/**
 * Custom hook for fetching data with loading and error states
 * @param {string} endpoint - API endpoint (e.g., '/quiz/questions')
 * @param {object} options - Options object
 * @param {boolean} options.auth - Whether to include auth token (default: true)
 * @param {boolean} options.immediate - Whether to fetch immediately (default: true)
 * @param {any} options.initialData - Initial data value (default: null)
 */
export function useFetch(endpoint, { auth = true, immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiClient.get(endpoint, { auth });
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, auth]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData, setData, setError };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE) with loading and error states
 * @param {string} method - HTTP method ('post', 'put', 'delete')
 */
export function useMutation(method = 'post') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mutate = useCallback(async (endpoint, data = null, { auth = true } = {}) => {
    setLoading(true);
    setError('');
    try {
      let result;
      if (method === 'delete') {
        result = await apiClient.delete(endpoint, { auth });
      } else {
        result = await apiClient[method](endpoint, data, { auth });
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method]);

  return { mutate, loading, error, setError };
}

export default useFetch;
