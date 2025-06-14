import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Youtube, CheckCircle } from 'lucide-react';
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
  const [inputWalletAddress, setInputWalletAddress] = useState('');
  const [youtubeVerified, setYoutubeVerified] = useState(false);
  const [verifiedChannelData, setVerifiedChannelData] = useState<{ 
    channelId: string; 
    channelName: string; 
    verificationToken: string 
  } | null>(null);
  const [showYouTubeVerification, setShowYouTubeVerification] = useState(false);
  const { saveToken, saveYouTubeVerification, loading, userTokens, currentUser, updateUserProfile } = useDatabase();
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

  const handleYouTubeVerified = (channelData: { channelId: string; channelName: string; verificationToken: string }) => {
    setYoutubeVerified(true);
    setVerifiedChannelData(channelData);
    setShowYouTubeVerification(false);
  };

  const validateWalletAddress = (): boolean => {
    // Check if user is logged in and has wallet connected
    if (!currentUser || !address) {
      toast({
        title: "Wallet Tidak Terhubung",
        description: "Silakan hubungkan wallet Anda",
        variant: "destructive",
      });
      return false;
    }

    // Check if input wallet address is provided
    if (!inputWalletAddress.trim()) {
      toast({
        title: "Wallet Address Diperlukan",
        description: "Silakan masukkan wallet address Anda",
        variant: "destructive",
      });
      return false;
    }

    // Validate that input wallet address matches connected wallet
    if (inputWalletAddress.toLowerCase() !== address.toLowerCase()) {
      toast({
        title: "Wallet Address Tidak Sesuai",
        description: "Wallet address yang dimasukkan harus sama dengan wallet yang terhubung",
        variant: "destructive",
      });
      return false;
    }

    // Validate that input wallet address matches registered wallet
    if (inputWalletAddress.toLowerCase() !== currentUser.wallet_address.toLowerCase()) {
      toast({
        title: "Wallet Address Tidak Sesuai",
        description: "Wallet address yang dimasukkan harus sama dengan yang terdaftar saat login",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      // Check if user already has a token
      if (userTokens.length > 0) {
        toast({
          title: "Batas Tercapai",
          description: "Anda hanya dapat membuat satu token per akun",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!tokenName || !tokenSymbol) {
        toast({
          title: "Informasi Tidak Lengkap", 
          description: "Silakan isi semua field yang diperlukan",
          variant: "destructive",
        });
        return;
      }

      // Validate wallet address
      if (!validateWalletAddress()) {
        return;
      }

      // Validate YouTube verification
      if (!youtubeVerified || !verifiedChannelData) {
        toast({
          title: "Verifikasi YouTube Diperlukan",
          description: "Silakan verifikasi channel YouTube Anda sebelum membuat token",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating token with verified data:', {
        tokenName,
        tokenSymbol,
        walletAddress: inputWalletAddress,
        verifiedChannelData
      });

      // Save YouTube verification to database first
      await saveYouTubeVerification({
        channelId: verifiedChannelData.channelId,
        channelName: verifiedChannelData.channelName,
        verificationToken: verifiedChannelData.verificationToken
      });

      const tokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        youtubeLink: `https://youtube.com/channel/${verifiedChannelData.channelId}`,
        walletAddress: inputWalletAddress,
        image: tokenImage
      };

      await saveToken(tokenData);
      
      // Update user role to content creator after successful token creation
      await updateUserProfile({ role: 'content_creator' });
      
      toast({
        title: "Berhasil",
        description: "Token berhasil dibuat! Anda sekarang menjadi Content Creator.",
      });

      onSubmit(tokenData);
      onClose();
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTokenImage(null);
      setImagePreview('');
      setInputWalletAddress('');
      setYoutubeVerified(false);
      setVerifiedChannelData(null);
    } catch (error: any) {
      console.error('Error creating token:', error);
      if (error.message.includes('one token per account')) {
        toast({
          title: "Batas Tercapai",
          description: "Anda hanya dapat membuat satu token per akun",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pembuatan Gagal",
          description: "Gagal membuat token. Silakan coba lagi.",
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
    setInputWalletAddress('');
    setYoutubeVerified(false);
    setVerifiedChannelData(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-lg mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center mb-4 sm:mb-6">
            <DialogTitle className="text-lg sm:text-xl font-medium text-white">Buat Token Anda</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Nama Token</label>
              <Input
                placeholder="Masukkan nama token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-10 sm:h-12 px-4 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Simbol Token (Gambar)</label>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:flex-1">
                  <label className="flex items-center justify-center w-full h-10 sm:h-12 border-2 border-gray-600 border-dashed rounded-full cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-400">
                        {tokenImage ? tokenImage.name.substring(0, 20) + '...' : 'Upload Gambar'}
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Simbol Teks</label>
              <Input
                placeholder="Contoh: BTC, ETH"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-10 sm:h-12 px-4 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Verifikasi Channel YouTube</label>
              <Button
                type="button"
                onClick={() => setShowYouTubeVerification(true)}
                disabled={youtubeVerified}
                className={`w-full h-10 sm:h-12 rounded-full flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  youtubeVerified 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {youtubeVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4" />
                    <span>Verifikasi YouTube</span>
                  </>
                )}
              </Button>
              {youtubeVerified && verifiedChannelData && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mt-2">
                  <p className="text-green-400 text-sm font-medium">{verifiedChannelData.channelName}</p>
                  <p className="text-gray-400 text-xs">Channel berhasil diverifikasi</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Wallet Address</label>
              <Input
                placeholder="Masukkan wallet address Anda"
                value={inputWalletAddress}
                onChange={(e) => setInputWalletAddress(e.target.value)}
                className="bg-transparent border-2 border-gray-600 text-white placeholder-gray-400 rounded-full h-10 sm:h-12 px-4 focus:border-blue-500 text-sm sm:text-base"
              />
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mt-2">
                <p className="text-gray-300 text-xs">
                  <strong>Wallet Terhubung:</strong> <span className="break-all">{address || 'Tidak terhubung'}</span>
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  <strong>Wallet Terdaftar:</strong> <span className="break-all">{currentUser?.wallet_address || 'Tidak ada'}</span>
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                Wallet address harus sama dengan yang terhubung dan terdaftar saat login
              </p>
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-full font-medium h-10 sm:h-12 mt-6 sm:mt-8 text-sm sm:text-base"
              disabled={!tokenName || !tokenSymbol || !youtubeVerified || !inputWalletAddress || loading}
            >
              {loading ? 'Membuat...' : 'Buat Token'}
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
