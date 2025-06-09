
import { useState, useEffect } from 'react';
import { User, Settings, Plus, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import { useDatabase, Token } from '@/hooks/useDatabase';
import { toast } from '@/components/ui/use-toast';

interface ProfileProps {
  username: string;
  onCreateToken: () => void;
}

const Profile = ({ username, onCreateToken }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState('token');
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const { currentUser, userTokens, getUserTokens, getAllTokens, updateUserProfile } = useDatabase();
  const [allTokens, setAllTokens] = useState<Token[]>([]);

  useEffect(() => {
    // Load user tokens
    if (currentUser) {
      getUserTokens(currentUser.id);
      setDescription(currentUser.description || '');
    }
    
    // Load all tokens for holding tab
    const fetchAllTokens = async () => {
      const tokens = await getAllTokens();
      setAllTokens(tokens);
    };
    fetchAllTokens();
  }, [currentUser, getUserTokens, getAllTokens]);

  const handleCreateToken = () => {
    if (userTokens.length > 0) {
      toast({
        title: "Limit Reached",
        description: "You can only create one token per account",
        variant: "destructive",
      });
      return;
    }
    onCreateToken();
  };

  const handleSaveDescription = async () => {
    try {
      await updateUserProfile({ description });
      setEditingDescription(false);
      toast({
        title: "Success",
        description: "Description updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  // Determine user role based on token ownership
  const getUserRole = () => {
    return userTokens.length > 0 ? 'Content Creator' : 'User';
  };

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
                {userTokens.map((token) => (
                  <Card key={token.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{token.symbol}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{token.name}</h3>
                            <p className="text-gray-400 text-sm">{token.symbol}</p>
                            <p className="text-gray-500 text-xs">Wallet: {token.wallet_address}</p>
                            {token.youtube_link && (
                              <a 
                                href={token.youtube_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 text-xs hover:underline"
                              >
                                YouTube Link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">Your Token</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(token.created_at).toLocaleDateString()}
                          </p>
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
                  onClick={handleCreateToken}
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
            {allTokens.length > 0 ? (
              allTokens.map((token) => (
                <Card key={token.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{token.symbol}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{token.name}</h3>
                          <p className="text-gray-400 text-sm">{token.symbol}</p>
                          <p className="text-gray-500 text-xs">Address: {token.wallet_address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium text-sm">Available</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(token.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20">
                <h3 className="text-lg font-bold text-white mb-4">No tokens available</h3>
                <p className="text-gray-400">Create your first token to get started!</p>
              </div>
            )}
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
            <ProfilePhotoUpload 
              currentPhotoUrl={currentUser?.profile_photo} 
              username={username} 
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{username}</h2>
              <div className="text-gray-400 space-y-1">
                <div className="text-blue-400 font-medium">{getUserRole()}</div>
                <div>Community Member</div>
                <div>Verified User</div>
                <div className="text-xs">
                  Tokens Created: {userTokens.length}/1
                  {userTokens.length >= 1 && <span className="text-yellow-400 ml-2">(Max Reached)</span>}
                </div>
              </div>
              
              {/* Description Section */}
              <div className="mt-3">
                {editingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a description about yourself..."
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveDescription}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingDescription(false);
                          setDescription(currentUser?.description || '');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <p className="text-gray-300 text-sm flex-1">
                      {description || 'No description added yet.'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingDescription(true)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
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
