
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image, Youtube, CheckCircle } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useAccount } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import YouTubeVerification from './YouTubeVerification';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tokenData: any) => void;
}

const CreateTokenModal = ({ isOpen, onClose, onSubmit }: CreateTokenModalProps) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenImage, setTokenImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [youtubeVerified, setYoutubeVerified] = useState(false);
  const [verifiedChannelData, setVerifiedChannelData] = useState<{ channelId: string; channelName: string } | null>(null);
  const [showYouTubeVerification, setShowYouTubeVerification] = useState(false);
  const { saveToken, loading, userTokens, currentUser } = useDatabase();
  const { address } = useAccount();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTokenImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYouTubeVerified = (channelData: { channelId: string; channelName: string }) => {
    setYoutubeVerified(true);
    setVerifiedChannelData(channelData);
    setShowYouTubeVerification(false);
  };

  const handleSubmit = async () => {
    try {
      // Check if user already has a token
      if (userTokens.length > 0) {
        toast({
          title: "Limit Reached",
          description: "You can only create one token per account",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!tokenName || !tokenSymbol) {
        toast({
          title: "Missing Information", 
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate YouTube verification
      if (!youtubeVerified || !verifiedChannelData) {
        toast({
          title: "YouTube Verification Required",
          description: "Please verify your YouTube channel before creating a token",
          variant: "destructive",
        });
        return;
      }

      // Validate wallet address matches current user
      if (!currentUser || !address) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet",
          variant: "destructive",
        });
        return;
      }

      if (currentUser.wallet_address.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: "Wallet Mismatch",
          description: "Connected wallet must match your registered wallet address",
          variant: "destructive",
        });
        return;
      }

      const tokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        youtubeLink: `https://youtube.com/channel/${verifiedChannelData.channelId}`,
        walletAddress: currentUser.wallet_address,
        image: tokenImage
      };

      await saveToken(tokenData);
      
      toast({
        title: "Success",
        description: "Token created successfully!",
      });

      onSubmit(tokenData);
      onClose();
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTokenImage(null);
      setImagePreview('');
      setYoutubeVerified(false);
      setVerifiedChannelData(null);
    } catch (error: any) {
      console.error('Error creating token:', error);
      if (error.message.includes('one token per account')) {
        toast({
          title: "Limit Reached",
          description: "You can only create one token per account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Creation Failed",
          description: "Failed to create token. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setTokenName('');
    setTokenSymbol('');
    setTokenImage(null);
    setImagePreview('');
    setYoutubeVerified(false);
    setVerifiedChannelData(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md p-8">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-xl font-medium text-white">Make your Token FR</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Input
              placeholder="Token Name"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4 focus:border-blue-500"
            />
            
            {/* Token Symbol Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Token Symbol (Image)</label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full h-12 border-2 border-gray-600 border-dashed rounded-full cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {tokenImage ? tokenImage.name : 'Upload Symbol Image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <Input
              placeholder="Symbol Text (e.g., BTC, ETH)"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4 focus:border-blue-500"
            />
            
            {/* YouTube Verification Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">YouTube Channel Verification</label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  onClick={() => setShowYouTubeVerification(true)}
                  disabled={youtubeVerified}
                  className={`flex-1 h-12 rounded-full flex items-center justify-center space-x-2 ${
                    youtubeVerified 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {youtubeVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <Youtube className="w-4 h-4" />
                      <span>Verify YouTube</span>
                    </>
                  )}
                </Button>
              </div>
              {youtubeVerified && verifiedChannelData && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mt-2">
                  <p className="text-green-400 text-sm font-medium">{verifiedChannelData.channelName}</p>
                  <p className="text-gray-400 text-xs">Channel verified successfully</p>
                </div>
              )}
            </div>
            
            {/* Wallet Address Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Wallet Address</label>
              <div className="bg-gray-800 border border-gray-600 rounded-full h-12 px-4 flex items-center">
                <span className="text-gray-300 text-sm">
                  {currentUser?.wallet_address || 'Not connected'}
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                This must match your connected wallet address
              </p>
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium h-12 mt-8"
              disabled={!tokenName || !tokenSymbol || !youtubeVerified || loading}
            >
              {loading ? 'Creating...' : 'Create Token'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <YouTubeVerification
        isOpen={showYouTubeVerification}
        onClose={() => setShowYouTubeVerification(false)}
        onVerified={handleYouTubeVerified}
      />
    </>
  );
};

export default CreateTokenModal;
