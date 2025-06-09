import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDatabase } from '@/hooks/useDatabase';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { saveUser, getUserByWallet, loading } = useDatabase();

  // Auto-check untuk login otomatis ketika wallet terhubung
  useEffect(() => {
    if (isConnected && address && showLogin) {
      handleAutoLogin();
    }
  }, [isConnected, address, showLogin]);

  const handleGetStarted = () => {
    setShowWelcome(true);
  };

  const handleLogin = () => {
    setShowWelcome(false);
    setShowLogin(true);
  };

  const handleCreateAccount = () => {
    setShowWelcome(false);
    setShowCreate(true);
  };

  const handleAutoLogin = async () => {
    if (isConnected && address) {
      try {
        // Cari user berdasarkan wallet address
        const existingUser = await getUserByWallet(address);
        
        if (existingUser) {
          // Login berhasil, redirect ke dashboard
          localStorage.setItem('userConnected', 'true');
          localStorage.setItem('username', existingUser.username);
          localStorage.setItem('walletAddress', address);
          navigate('/dashboard');
        } else {
          alert('Wallet ini belum terdaftar. Silakan buat akun baru terlebih dahulu.');
          setShowLogin(false);
          setShowCreate(true);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Terjadi kesalahan saat login');
      }
    }
  };

  const handleCreateSubmit = async () => {
    if (!username.trim()) {
      alert('Username harus diisi');
      return;
    }

    if (!isConnected || !address) {
      alert('Silakan hubungkan wallet terlebih dahulu');
      return;
    }

    try {
      // Cek apakah wallet sudah terdaftar
      const existingUser = await getUserByWallet(address);
      if (existingUser) {
        alert('Wallet ini sudah terdaftar dengan username: ' + existingUser.username);
        return;
      }

      // Buat user baru
      await saveUser(username, address);
      localStorage.setItem('userConnected', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('walletAddress', address);
      navigate('/dashboard');
    } catch (error) {
      console.error('Create account error:', error);
      alert('Terjadi kesalahan saat membuat akun');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold text-blue-400">Socion</div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a>
          <ConnectButton />
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-blue-400">Socion:</span> where{' '}
            <span className="text-white">Content</span>
            <br />
            meets <span className="text-blue-400">Tegel</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            The all-in-one place for <span className="text-blue-400">maximizing revenue</span>, <span className="text-blue-400">attention</span> & <span className="text-blue-400">discovery</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              Let's get started →
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">$2M+</div>
              <div className="text-gray-400">Revenue Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Welcome Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Welcome To <span className="text-blue-400">Socion</span></DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Button 
              onClick={handleCreateAccount}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Create new account
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 py-3 rounded-lg font-semibold"
            >
              Log in to SOCION
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Modal - Hanya perlu connect wallet */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Login dengan Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-center text-gray-300">
              Hubungkan wallet Anda untuk login otomatis
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            {isConnected && (
              <p className="text-center text-green-400">
                Wallet terhubung! Mencari akun...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Account Modal - Wajib isi username */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Buat Akun Baru</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Input
              placeholder="Username (wajib diisi)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              required
            />
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <Button 
              onClick={handleCreateSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              disabled={!isConnected || !username.trim() || loading}
            >
              {loading ? 'Creating...' : 'Buat Akun'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
