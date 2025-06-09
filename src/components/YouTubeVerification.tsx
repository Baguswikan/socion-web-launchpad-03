
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface YouTubeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (channelData: { channelId: string; channelName: string }) => void;
}

const YouTubeVerification = ({ isOpen, onClose, onVerified }: YouTubeVerificationProps) => {
  const [step, setStep] = useState<'input' | 'verifying' | 'completed'>('input');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [channelData, setChannelData] = useState<{ channelId: string; channelName: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Extract channel ID from YouTube URL
  const extractChannelId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const generateVerificationCode = () => {
    return `SOCION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const handleStartVerification = async () => {
    if (!youtubeLink) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube channel URL",
        variant: "destructive",
      });
      return;
    }

    const channelId = extractChannelId(youtubeLink);
    if (!channelId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube channel URL",
        variant: "destructive",
      });
      return;
    }

    // Generate verification code
    const code = generateVerificationCode();
    setVerificationCode(code);
    
    // For demo purposes, we'll simulate channel data
    // In a real implementation, you'd use YouTube API to get channel info
    const mockChannelData = {
      channelId: channelId,
      channelName: `Channel ${channelId}`
    };
    
    setChannelData(mockChannelData);
    setStep('verifying');
    
    toast({
      title: "Verification Started",
      description: "Please add the verification code to your channel description",
    });
  };

  const handleCompleteVerification = async () => {
    if (!channelData) return;
    
    // In a real implementation, you would:
    // 1. Check if the verification code exists in the channel description
    // 2. Save verification data to database
    // For demo purposes, we'll simulate success
    
    setStep('completed');
    toast({
      title: "Verification Successful",
      description: "Your YouTube channel has been verified!",
    });
    
    // Call parent callback with verified channel data
    onVerified(channelData);
  };

  const handleClose = () => {
    setStep('input');
    setYoutubeLink('');
    setChannelData(null);
    setVerificationCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md p-8">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-xl font-medium text-white flex items-center justify-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            YouTube Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <p className="text-gray-300 text-sm mb-4">
                Enter your YouTube channel URL to verify ownership
              </p>
              <Input
                placeholder="https://youtube.com/@yourchannel"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4 focus:border-red-500"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-full h-12"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStartVerification}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-12"
              >
                Start Verification
              </Button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Verification in Progress</h3>
              <p className="text-gray-300 text-sm mb-4">
                Add this verification code to your channel description:
              </p>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                <code className="text-blue-400 font-mono text-lg">{verificationCode}</code>
              </div>
              <p className="text-gray-400 text-xs">
                After adding the code to your channel description, click "Complete Verification"
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-full h-12"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteVerification}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-12"
              >
                Complete Verification
              </Button>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Verification Complete!</h3>
              <p className="text-gray-300 text-sm">
                Your YouTube channel has been successfully verified.
              </p>
              {channelData && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4">
                  <p className="text-blue-400 font-medium">{channelData.channelName}</p>
                  <p className="text-gray-400 text-sm">Channel ID: {channelData.channelId}</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeVerification;
