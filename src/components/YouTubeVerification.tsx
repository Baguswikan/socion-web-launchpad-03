
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Youtube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

interface YouTubeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (channelData: { channelId: string; channelName: string; verificationToken: string }) => void;
}

const YouTubeVerification = ({ isOpen, onClose, onVerified }: YouTubeVerificationProps) => {
  const [step, setStep] = useState<'connect' | 'verifying' | 'completed'>('connect');
  const [channelData, setChannelData] = useState<{ channelId: string; channelName: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyYouTubeChannel } = useDatabase();

  const handleGoogleAuth = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate Google OAuth flow
      // In a real implementation, you would use Google OAuth 2.0
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock channel data after successful OAuth
      const mockChannelData = {
        channelId: `UC${Math.random().toString(36).substr(2, 22)}`,
        channelName: `Channel ${Math.random().toString(36).substr(2, 8)}`
      };
      
      setChannelData(mockChannelData);
      setStep('verifying');
      
      // Auto-verify since we got the data through OAuth
      const verificationToken = `SOCION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('completed');
      
      toast({
        title: "Verifikasi Berhasil",
        description: "Channel YouTube Anda telah terverifikasi melalui Google!",
      });
      
      onVerified({
        channelId: mockChannelData.channelId,
        channelName: mockChannelData.channelName,
        verificationToken
      });
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast({
        title: "Error Verifikasi",
        description: "Terjadi kesalahan saat menghubungkan dengan Google. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('connect');
    setChannelData(null);
    setIsVerifying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm sm:max-w-md mx-4 p-6 sm:p-8">
        <DialogHeader className="text-center mb-4 sm:mb-6">
          <DialogTitle className="text-lg sm:text-xl font-medium text-white flex items-center justify-center gap-2">
            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            Verifikasi YouTube
          </DialogTitle>
        </DialogHeader>

        {step === 'connect' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Hubungkan dengan Google</h3>
              <p className="text-gray-300 text-sm mb-4">
                Hubungkan akun Google Anda untuk memverifikasi kepemilikan channel YouTube secara otomatis
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-full h-10 sm:h-12 text-sm sm:text-base"
              >
                Batal
              </Button>
              <Button 
                onClick={handleGoogleAuth}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-10 sm:h-12 text-sm sm:text-base"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  'Hubungkan Google'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Memverifikasi Channel</h3>
              <p className="text-gray-300 text-sm">
                Sedang memverifikasi channel YouTube Anda...
              </p>
              {channelData && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mt-4">
                  <p className="text-blue-400 font-medium text-sm">{channelData.channelName}</p>
                  <p className="text-gray-400 text-xs">Channel ID: {channelData.channelId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Verifikasi Selesai!</h3>
              <p className="text-gray-300 text-sm">
                Channel YouTube Anda telah berhasil diverifikasi melalui Google.
              </p>
              {channelData && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mt-4">
                  <p className="text-blue-400 font-medium text-sm">{channelData.channelName}</p>
                  <p className="text-gray-400 text-xs">Channel ID: {channelData.channelId}</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-10 sm:h-12 text-sm sm:text-base"
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
