
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

  // Fungsi untuk menyimpan atau mengupdate user
  const saveUser = async (username: string, walletAddress: string) => {
    setLoading(true);
    try {
      // Cek apakah user sudah ada berdasarkan wallet address
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        // Update user yang sudah ada
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
        // Buat user baru
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

  // Fungsi untuk mengambil data user berdasarkan wallet address
  const getUserByWallet = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  // Fungsi untuk menyimpan token
  const saveToken = async (tokenData: {
    name: string;
    symbol: string;
    youtubeLink?: string;
    walletAddress: string;
  }) => {
    if (!currentUser) {
      throw new Error('User not found');
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
      
      // Update daftar token user
      await getUserTokens(currentUser.id);
      return data;
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil token milik user
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

  // Fungsi untuk mengambil semua token (untuk trending)
  const getAllTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
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
