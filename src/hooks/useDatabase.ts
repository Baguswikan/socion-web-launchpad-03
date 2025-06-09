
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface Token {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  youtube_link?: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export const useDatabase = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to save or update user
  const saveUser = async (username: string, walletAddress: string) => {
    setLoading(true);
    try {
      // Check if user already exists based on wallet address
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({ username, updated_at: new Date().toISOString() })
          .eq('wallet_address', walletAddress)
          .select()
          .single();

        if (error) throw error;
        setCurrentUser(data);
        return data;
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({ username, wallet_address: walletAddress })
          .select()
          .single();

        if (error) throw error;
        setCurrentUser(data);
        return data;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to get user by wallet address
  const getUserByWallet = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setCurrentUser(data);
      // Load user tokens when user is found
      if (data) {
        await getUserTokens(data.id);
      }
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  // Function to save token
  const saveToken = async (tokenData: {
    name: string;
    symbol: string;
    youtubeLink?: string;
    walletAddress: string;
    image?: File;
  }) => {
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Check if user already has a token
    if (userTokens.length > 0) {
      throw new Error('You can only create one token per account');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          user_id: currentUser.id,
          name: tokenData.name,
          symbol: tokenData.symbol,
          youtube_link: tokenData.youtubeLink,
          wallet_address: tokenData.walletAddress
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update user's token list
      await getUserTokens(currentUser.id);
      return data;
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to get user's tokens
  const getUserTokens = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUserTokens(data || []);
      return data || [];
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  };

  // Function to get all tokens (for trending)
  const getAllTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all tokens:', error);
      return [];
    }
  };

  return {
    currentUser,
    userTokens,
    loading,
    saveUser,
    getUserByWallet,
    saveToken,
    getUserTokens,
    getAllTokens
  };
};
