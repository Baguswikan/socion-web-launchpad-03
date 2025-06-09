
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { Search, Home, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Profile from '@/components/Profile';
import CreateTokenModal from '@/components/CreateTokenModal';
import { useDatabase } from '@/hooks/useDatabase';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { getUserByWallet, getAllTokens } = useDatabase();
  const [allTokens, setAllTokens] = useState([]);

  const handleLogout = () => {
    disconnect();
    localStorage.removeItem('userConnected');
    localStorage.removeItem('username');
    localStorage.removeItem('walletAddress');
    navigate('/');
  };

  const handleCreateToken = (tokenData: any) => {
    console.log('Creating token:', tokenData);
    // Refresh token list
    loadTokens();
  };

  const loadTokens = async () => {
    const tokens = await getAllTokens();
    setAllTokens(tokens);
  };

  useEffect(() => {
    // Load user data and tokens when component mounts
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      getUserByWallet(walletAddress);
    }
    loadTokens();
  }, [getUserByWallet]);

  const username = localStorage.getItem('username') || 'User';

  // Convert database tokens to trending format
  const trendingTokens = allTokens.slice(0, 8).map((token: any, index) => ({
    name: token.symbol,
    price: `$${(Math.random() * 5 + 0.1).toFixed(2)}`,
    change: `+${(Math.random() * 10 + 1).toFixed(1)}%`
  }));

  // Trending YouTube videos with embedded URLs
  const trendingVideos = [
    { 
      title: 'The Future of Cryptocurrency in 2024', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '2.5M views',
      time: '1 day ago'
    },
    { 
      title: 'DeFi Explained: Complete Beginner Guide', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '1.8M views',
      time: '2 days ago'
    },
    { 
      title: 'Top 10 Altcoins to Watch This Week', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '1.2M views',
      time: '3 days ago'
    },
    { 
      title: 'NFT Market Analysis & Trends', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '950K views',
      time: '4 days ago'
    },
    { 
      title: 'Blockchain Technology Simplified', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '1.7K views',
      time: '5 days ago'
    },
    { 
      title: 'Smart Contracts Tutorial', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '875K views',
      time: '1 week ago'
    },
  ];

  const renderMainContent = () => {
    if (showProfile) {
      return <Profile username={username} onCreateToken={() => setShowCreateToken(true)} />;
    }

    // Only show trending videos on home
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {trendingVideos.map((video, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardContent className="p-4">
              <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={video.embedUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-400 text-xs">{video.views} • {video.time}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-2xl font-bold text-blue-400">socion</div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <ConnectButton />
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-20 bg-gray-900 border-r border-gray-800 p-4">
          <nav className="flex flex-col space-y-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${!showProfile ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-300`}
              onClick={() => setShowProfile(false)}
            >
              <Home className="w-6 h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${showProfile ? 'text-blue-400' : 'text-gray-400'} hover:text-white`}
              onClick={() => setShowProfile(true)}
            >
              <User className="w-6 h-6" />
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">          
          <div className="p-6">
            {renderMainContent()}
          </div>
        </main>

        {/* Trending Sidebar */}
        <aside className="w-80 bg-gray-900 border-l border-gray-800 p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-6">Trending Token</h2>
          <div className="space-y-4">
            {trendingTokens.length > 0 ? (
              trendingTokens.map((token, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{token.name}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{token.name}</div>
                        <div className="text-gray-400 text-xs">Token Name</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium text-sm">{token.price}</div>
                      <div className="text-green-400 text-xs">{token.change}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No tokens available yet</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <CreateTokenModal
        isOpen={showCreateToken}
        onClose={() => setShowCreateToken(false)}
        onSubmit={handleCreateToken}
      />
    </div>
  );
};

export default Dashboard;
