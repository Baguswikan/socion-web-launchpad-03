
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  username: string;
}

const ProfilePhotoUpload = ({ currentPhotoUrl, username }: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(currentPhotoUrl || '');
  const { updateUserProfile } = useDatabase();
  const { toast } = useToast();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);

      // For now, we'll just use the data URL as the photo
      // In a real app, you'd upload to storage and get a URL
      const reader2 = new FileReader();
      reader2.onload = async (e) => {
        const result = e.target?.result as string;
        await updateUserProfile({ profile_photo: result });
        
        toast({
          title: "Success",
          description: "Profile photo updated successfully!",
        });
      };
      reader2.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="w-16 h-16">
        <AvatarImage src={photoPreview} />
        <AvatarFallback className="bg-pink-400 text-white">
          <User className="w-8 h-8" />
        </AvatarFallback>
      </Avatar>
      <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
        <Camera className="w-3 h-3 text-white" />
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default ProfilePhotoUpload;
