
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

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
  const [youtubeLink, setYoutubeLink] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const { saveToken, loading, userTokens } = useDatabase();
  const { toast } = useToast();

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

  const handleSubmit = async () => {
    try {
      // Check if user already has a token
      if (userTokens.length > 0) {
        toast({
          title: "Error",
          description: "You can only create one token per account",
          variant: "destructive",
        });
        return;
      }

      if (!tokenName || !tokenSymbol || !walletAddress) {
        toast({
          title: "Error", 
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const tokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        youtubeLink,
        walletAddress,
        image: tokenImage
      };

      await saveToken(tokenData);
      
      toast({
        title: "Success",
        description: "Token created successfully!",
        variant: "default",
      });

      onSubmit(tokenData);
      onClose();
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTokenImage(null);
      setImagePreview('');
      setYoutubeLink('');
      setWalletAddress('');
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Error",
        description: "Failed to create token. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          
          <Input
            placeholder="Link Youtube"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4 focus:border-blue-500"
          />
          
          <Input
            placeholder="Wallet Address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-12 px-4 focus:border-blue-500"
          />
          
          <Button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium h-12 mt-8"
            disabled={!tokenName || !tokenSymbol || !walletAddress || loading}
          >
            {loading ? 'Creating...' : 'Create Token'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenModal;
