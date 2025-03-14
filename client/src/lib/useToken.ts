import { useEffect, useState } from 'react';
import { apiRequest } from './api';
import { useToast } from '@/hooks/use-toast';

interface TokenData {
  token: string;
  timestamp: number;
}

export function useToken() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);

  const saveToken = (tokenString: string) => {
    const tokenData: TokenData = {
      token: tokenString,
      timestamp: Date.now()
    };
    localStorage.setItem('authToken', JSON.stringify(tokenData));
    setToken(tokenString);
  };

  const loadSavedToken = () => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      const tokenData: TokenData = JSON.parse(savedToken);
      // Check if token is less than 24 hours old
      if (Date.now() - tokenData.timestamp < 24 * 60 * 60 * 1000) {
        return tokenData.token;
      }
    }
    return null;
  };

  const fetchNewToken = async () => {
    try {
      const savedSettings = localStorage.getItem('authSettings');
      if (!savedSettings) return null;

      const settings = JSON.parse(savedSettings);
      if (!settings.rememberCredentials || !settings.username || !settings.password) return null;

      const response = await apiRequest.post("/auth", {
        username: settings.username,
        password: settings.password
      });

      if (response.data.token) {
        saveToken(response.data.token);
        toast({
          title: "Authentication Success",
          description: "Successfully retrieved new token",
        });
        return response.data.token;
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to retrieve token. Please check your settings.",
        variant: "destructive",
      });
    }
    return null;
  };

  useEffect(() => {
    const initialize = async () => {
      const savedToken = loadSavedToken();
      if (savedToken) {
        setToken(savedToken);
      } else {
        await fetchNewToken();
      }
    };

    initialize();

    // Refresh token every 23 hours
    const interval = setInterval(fetchNewToken, 23 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { token, refreshToken: fetchNewToken };
}
