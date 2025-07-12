import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { User, MapPin, Mail, Phone, Edit, Save, X, UploadCloud, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/userService";
import itemService from "../services/itemService";
import swapService from "../services/swapService";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    bio: "",
    profilePic: "",
  });
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [userItems, setUserItems] = useState([]);
  const [swapStats, setSwapStats] = useState({
    totalSwaps: 0,
    pointsEarned: 0,
    itemsSaved: 0,
    averageRating: 0
  });

  // Fetch user data and stats on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user._id) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch user data
        const userData = await userService.getUserById(user._id);
        
        if (userData?.data) {
          const profileInfo = userData.data;
          
          setProfileData({
            name: profileInfo.name,
            email: profileInfo.email,
            location: profileInfo.location || "",
            bio: profileInfo.bio || "",
            profilePic: profileInfo.profilePic?.url || "",
            mobile: profileInfo.mobile || ""
          });
        }

        // Fetch user's items
        const itemsData = await itemService.getUserItems();
        if (itemsData.success && itemsData.data) {
          setUserItems(itemsData.data.slice(0, 3)); // Get latest 3 items
        }

        // Fetch swap stats
        const swapData = await swapService.getUserSwapHistory();
        if (swapData.success && swapData.stats) {
          setSwapStats(swapData.stats);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearNewImage = () => {
    setNewProfilePic(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedData = { ...profileData };
      
      if (newProfilePic) {
        updatedData.profilePicture = newProfilePic;
      }
      
      const result = await updateUserProfile(user._id, updatedData);
      
      if (result.success) {
        setIsEditing(false);
        clearNewImage();
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      ));
  };

  return (
    <div className="container-padding py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 p-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4">
                {isEditing && (previewUrl || newProfilePic) ? (
                  <div className="relative w-full h-full">
                    <img src={previewUrl} alt={profileData.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={clearNewImage} 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : profileData.profilePic ? (
                  <img src={profileData.profilePic} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User size={64} className="text-white" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <label className="cursor-pointer mb-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                  <UploadCloud size={16} />
                  <span>Upload New Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData.name}
              </h2>
              
              <div className="flex items-center justify-center gap-1 mt-1 text-yellow-500">
                {renderStars(swapStats.averageRating)}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  ({swapStats.averageRating.toFixed(1)})
                </span>
              </div>
              
              <div className="space-y-2 mt-4 w-full">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>{profileData.location || "No location set"}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail size={16} />
                  <span>{profileData.email}</span>
                </div>
                
                {profileData.mobile && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone size={16} />
                    <span>{profileData.mobile}</span>
                  </div>
                )}
              </div>
              
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full"
                  variant="outline"
                >
                  <Edit size={16} className="mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 mt-6 w-full">
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isLoading ? "Saving..." : <><Save size={16} className="mr-2" /> Save</>}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Info and Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Info */}
            <Card className="p-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isEditing ? "Edit Profile" : "About Me"}
              </h3>
              
              {isEditing ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      className="bg-white/50 dark:bg-gray-900/50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile
                    </label>
                    <Input
                      type="tel"
                      name="mobile"
                      value={profileData.mobile}
                      onChange={handleChange}
                      placeholder="Your mobile number"
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself..."
                      className="bg-white/50 dark:bg-gray-900/50 resize-none h-24"
                    />
                  </div>
                </form>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {profileData.bio || "No bio provided yet."}
                </p>
              )}
            </Card>

            {/* Stats Card */}
            <Card className="p-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Impact
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {swapStats.totalSwaps}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Swaps</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {swapStats.pointsEarned}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {swapStats.itemsSaved}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Items Saved</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {swapStats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                </div>
              </div>
            </Card>

            {/* Recent Items */}
            {userItems.length > 0 && (
              <Card className="p-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Items
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {userItems.map((item) => (
                    <div key={item._id} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="h-32 w-full overflow-hidden">
                        <img 
                          src={item.images[0]?.url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        <p className="text-xs mt-1 inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                          {item.pointsValue} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;