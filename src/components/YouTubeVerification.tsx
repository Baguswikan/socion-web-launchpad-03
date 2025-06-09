
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface YouTubeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (channelData: { channelId: string; channelName: string; verificationToken: string }) => void;
}

const YouTubeVerification = ({ isOpen, onClose, onVerified }: YouTubeVerificationProps) => {
  const [step, setStep] = useState<'input' | 'verifying' | 'completed'>('input');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [channelData, setChannelData] = useState<{ channelId: string; channelName: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Mock function to fetch channel description - in production, you'd use YouTube API
  const fetchChannelDescription = async (channelId: string): Promise<{ description: string; channelName: string }> => {
    // This is a mock implementation. In production, you would:
    // 1. Use YouTube Data API v3 to fetch channel info
    // 2. Check the channel description for the verification token
    
    // For demo purposes, simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response - in real implementation, this would come from YouTube API
    return {
      description: `Welcome to my channel! ${verificationCode} Subscribe for more content!`,
      channelName: `Channel ${channelId}`
    };
  };

  const handleStartVerification = async () => {
    if (!youtubeLink) {
      toast({
        title: "Error",
        description: "Silakan masukkan URL channel YouTube yang valid",
        variant: "destructive",
      });
      return;
    }

    const channelId = extractChannelId(youtubeLink);
    if (!channelId) {
      toast({
        title: "URL Tidak Valid",
        description: "Silakan masukkan URL channel YouTube yang valid",
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
      title: "Verifikasi Dimulai",
      description: "Silakan tambahkan kode verifikasi ke deskripsi channel Anda",
    });
  };

  const handleCompleteVerification = async () => {
    if (!channelData || !verificationCode) return;
    
    setIsVerifying(true);
    
    try {
      // Check if the verification code exists in the channel description
      const { description, channelName } = await fetchChannelDescription(channelData.channelId);
      
      // Verify that the token exists in the description
      if (!description.includes(verificationCode)) {
        toast({
          title: "Verifikasi Gagal",
          description: "Kode verifikasi tidak ditemukan di deskripsi channel. Pastikan Anda telah menambahkan kode ke deskripsi channel Anda.",
          variant: "destructive",
        });
        setIsVerifying(false);
        return;
      }
      
      setStep('completed');
      toast({
        title: "Verifikasi Berhasil",
        description: "Channel YouTube Anda telah terverifikasi!",
      });
      
      // Call parent callback with verified channel data
      onVerified({
        channelId: channelData.channelId,
        channelName: channelName,
        verificationToken: verificationCode
      });
      
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error Verifikasi",
        description: "Terjadi kesalahan saat memverifikasi channel. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setYoutubeLink('');
    setChannelData(null);
    setVerificationCode('');
    setIsVerifying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md p-8">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-xl font-medium text-white flex items-center justify-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            Verifikasi YouTube
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <p className="text-gray-300 text-sm mb-4">
                Masukkan URL channel YouTube Anda untuk memverifikasi kepemilikan
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
                Batal
              </Button>
              <Button 
                onClick={handleStartVerification}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-12"
              >
                Mulai Verifikasi
              </Button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Verifikasi Sedang Berlangsung</h3>
              <p className="text-gray-300 text-sm mb-4">
                Tambahkan kode verifikasi ini ke deskripsi channel Anda:
              </p>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
                <code className="text-blue-400 font-mono text-lg">{verificationCode}</code>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Setelah menambahkan kode ke deskripsi channel, klik "Selesaikan Verifikasi"
              </p>
              <p className="text-red-400 text-xs">
                PENTING: Kode harus persis sama dan berada di deskripsi channel untuk verifikasi berhasil
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-full h-12"
                disabled={isVerifying}
              >
                Batal
              </Button>
              <Button 
                onClick={handleCompleteVerification}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-12"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Selesaikan Verifikasi'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Verifikasi Selesai!</h3>
              <p className="text-gray-300 text-sm">
                Channel YouTube Anda telah berhasil diverifikasi.
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
              Lanjutkan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeVerification;
