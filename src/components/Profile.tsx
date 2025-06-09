
import { useState } from 'react';
import { User, Settings, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileProps {
  username: string;
  onCreateToken: () => void;
}

const Profile = ({ username, onCreateToken }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState('token');

  // Mock user data - set userTokens to empty array to show "no tokens" state
  const userTokens: any[] = [];

  const userHoldings = [
    { name: 'Bitcoin', symbol: 'BTC', balance: '0.025', value: '$1,150.00', change: '+2.1%' },
    { name: 'Ethereum', symbol: 'ETH', balance: '1.5', value: '$2,850.00', change: '+4.8%' },
    { name: 'USDC', symbol: 'USDC', balance: '500', value: '$500.00', change: '0.0%' },
  ];

  const userPosts = [
    { 
      title: 'My First Token Launch Experience', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '1.2K views',
      time: '2 hours ago'
    },
    { 
      title: 'Building Community with Blockchain', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '856 views',
      time: '1 day ago'
    },
    { 
      title: 'Token Economics Explained', 
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: '2.1K views',
      time: '3 days ago'
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'token':
        return (
          <div className="space-y-6">
            {userTokens.length > 0 ? (
              <div className="grid gap-4">
                {userTokens.map((token, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{token.symbol}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{token.name}</h3>
                            <p className="text-gray-400 text-sm">{token.balance} {token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{token.value}</p>
                          <p className="text-green-400 text-sm">{token.change}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-xl font-bold text-white mb-4">YOU DON'T HAVE ANY TOKEN</h3>
                <Button 
                  onClick={onCreateToken}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Create Token
                </Button>
              </div>
            )}
          </div>
        );

      case 'holding':
        return (
          <div className="space-y-4">
            {userHoldings.map((holding, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{holding.symbol}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{holding.name}</h3>
                        <p className="text-gray-400 text-sm">{holding.balance} {holding.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{holding.value}</p>
                      <p className={`text-sm ${holding.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                        {holding.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Your Videos</h3>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.map((post, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={post.embedUrl}
                        title={post.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-xs">{post.views} • {post.time}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-pink-400 text-white">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{username}</h2>
              <div className="text-gray-400 space-y-1">
                <div>Content Creator</div>
                <div>Token Holder</div>
                <div>Community Member</div>
                <div>Verified User</div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <Button
          variant="ghost"
          className={`flex-1 py-3 rounded-md ${activeTab === 'token' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('token')}
        >
          TOKEN
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 py-3 rounded-md ${activeTab === 'holding' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('holding')}
        >
          HOLDING
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 py-3 rounded-md ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('posts')}
        >
          POST
        </Button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Profile;
