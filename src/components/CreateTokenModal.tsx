
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/hooks/useDatabase';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tokenData: any) => void;
}

const CreateTokenModal = ({ isOpen, onClose, onSubmit }: CreateTokenModalProps) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const { saveToken, loading } = useDatabase();

  const handleSubmit = async () => {
    try {
      const tokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        youtubeLink,
        walletAddress
      };

      // Simpan ke database
      await saveToken(tokenData);
      
      // Panggil callback
      onSubmit(tokenData);
      onClose();
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setYoutubeLink('');
      setWalletAddress('');
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Terjadi kesalahan saat membuat token');
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
          
          <Input
            placeholder="Token Symbol"
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
            {loading ? 'Creating...' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenModal;
