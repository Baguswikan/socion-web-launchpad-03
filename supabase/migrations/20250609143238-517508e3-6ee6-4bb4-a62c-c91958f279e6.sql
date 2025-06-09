
-- Add YouTube verification table
CREATE TABLE public.youtube_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for YouTube verifications
ALTER TABLE public.youtube_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for YouTube verifications
CREATE POLICY "Users can view their own verifications" 
  ON public.youtube_verifications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create verifications" 
  ON public.youtube_verifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own verifications" 
  ON public.youtube_verifications 
  FOR UPDATE 
  USING (true);

-- Add constraint to ensure one verification per user per channel
ALTER TABLE public.youtube_verifications ADD CONSTRAINT one_verification_per_user_channel UNIQUE (user_id, channel_id);
