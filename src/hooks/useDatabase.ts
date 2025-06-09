import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  wallet_address: string;
  profile_photo?: string;
  description?: string;
  role?: 'user' | 'content_creator';
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

export interface YouTubeVerification {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
  verification_token: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export const useDatabase = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [userVerifications, setUserVerifications] = useState<YouTubeVerification[]>([]);
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
          .insert({ username, wallet_address: walletAddress, role: 'user' })
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

  // Function to update user profile
  const updateUserProfile = async (profileData: { profile_photo?: string; description?: string; role?: 'user' | 'content_creator' }) => {
    if (!currentUser) {
      throw new Error('User not found');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
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
      if (data) {
        await getUserTokens(data.id);
        await getUserVerifications(data.id);
      }
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  // Function to save YouTube verification
  const saveYouTubeVerification = async (verificationData: {
    channelId: string;
    channelName: string;
    verificationToken: string;
  }) => {
    if (!currentUser) {
      throw new Error('User not found');
    }

    setLoading(true);
    try {
      // Check if verification already exists for this user and channel
      const { data: existingVerification } = await supabase
        .from('youtube_verifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('channel_id', verificationData.channelId)
        .single();

      if (existingVerification) {
        // Update existing verification
        const { data, error } = await supabase
          .from('youtube_verifications')
          .update({
            channel_name: verificationData.channelName,
            verification_token: verificationData.verificationToken,
            is_verified: true,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVerification.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update user's verification list
        await getUserVerifications(currentUser.id);
        return data;
      } else {
        // Create new verification
        const { data, error } = await supabase
          .from('youtube_verifications')
          .insert({
            user_id: currentUser.id,
            channel_id: verificationData.channelId,
            channel_name: verificationData.channelName,
            verification_token: verificationData.verificationToken,
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update user's verification list
        await getUserVerifications(currentUser.id);
        return data;
      }
    } catch (error) {
      console.error('Error saving YouTube verification:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to get user's YouTube verifications
  const getUserVerifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('youtube_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUserVerifications(data || []);
      return data || [];
    } catch (error) {
      console.error('Error getting user verifications:', error);
      return [];
    }
  };

  // Updated saveToken function to include YouTube verification check
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

    // Validate that the wallet address matches the current user's registered wallet
    if (tokenData.walletAddress.toLowerCase() !== currentUser.wallet_address.toLowerCase()) {
      throw new Error('Wallet address must match your registered wallet address');
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

  // Function to verify YouTube channel description contains verification token
  const verifyYouTubeChannel = async (channelId: string, verificationToken: string): Promise<{ channelName: string; verified: boolean }> => {
    try {
      // This is a mock implementation. In a real scenario, you would:
      // 1. Use YouTube Data API v3 to fetch channel info
      // 2. Check if the verification token exists in the channel description
      
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification - in production, replace this with actual YouTube API call
      const mockChannelName = `Channel ${channelId}`;
      const mockDescription = `Welcome to my channel! ${verificationToken} Subscribe for more content!`;
      
      // Check if token exists in description
      const verified = mockDescription.includes(verificationToken);
      
      return {
        channelName: mockChannelName,
        verified
      };
    } catch (error) {
      console.error('Error verifying YouTube channel:', error);
      return {
        channelName: '',
        verified: false
      };
    }
  };

  return {
    currentUser,
    userTokens,
    userVerifications,
    loading,
    saveUser,
    updateUserProfile,
    getUserByWallet,
    saveToken,
    getUserTokens,
    getAllTokens,
    saveYouTubeVerification,
    getUserVerifications,
    verifyYouTubeChannel
  };
};
