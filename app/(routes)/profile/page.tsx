"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import { useToast } from "@components/ui/use-toast"
import {
  Building,
  Calendar,
  Camera,
  Check,
  Loader2,
  MapPin,
  X,
  XCircle // Added XCircle for error display
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { userAPI } from "../../../lib/api"; // Changed import path

interface ProfileData {
  _id: string
  name: string
  email: string
  company?: string
  location?: string
  bio?: string
  joinedAt: string
  profilePictureUrl?: string // Changed from profilePicture to profilePictureUrl
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    location: "",
    bio: ""
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userAPI.getProfile();
        setProfileData(data);
        if (data) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            company: data.company || "",
            location: data.location || "",
            bio: data.bio || ""
          });
        } else {
          // If data is null/undefined from API for some reason (should ideally be caught by API error)
          setProfileData(null);
        }
      } catch (err: any) {
        console.error('Error fetching profile on page:', err);
        let description = "Failed to load profile data. Please try again later.";

        // Attempt to get a more specific message from the error object
        if (err && err.message) {
          description = err.message;
        } else if (err && err.response && err.response.data && err.response.data.message) {
          description = err.response.data.message;
        } else if (typeof err === 'string') {
          description = err;
        }

        toast({
          title: "Error Loading Profile",
          description: description,
          variant: "destructive"
        });
        setProfileData(null); // Explicitly set to null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]); // Removed profileData from dependency array

  // Format join date
  const formatJoinDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedProfile = await userAPI.updateProfile(formData)
      setProfileData(prev => prev ? { ...prev, ...updatedProfile } : null)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default"
      })
      console.log("Profile updated successfully:", updatedProfile)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Drag and drop functionality
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      })
      return
    }

    const uploadFormData = new FormData() // Renamed to avoid conflict with component's formData state
    uploadFormData.append('profilePicture', file)

    setIsUploading(true)
    try {
      const response = await userAPI.uploadProfilePicture(uploadFormData)

      setProfileData(prev =>
        prev ? { ...prev, profilePictureUrl: response.profilePictureUrl } : null
      )

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error("Failed to upload profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  useEffect(() => {
    setIsDragging(isDragActive)
  }, [isDragActive])

  return (
    <main className="container mx-auto pb-10 pt-5 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">Your Profile</h1>
        <p className="text-gray-500 max-w-3xl">
          Manage your account settings and update your personal information.
        </p>
      </div>

      <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-8 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-gray-100/50 w-full md:w-auto">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Profile</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Security</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Billing</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Notifications</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      )}

      {!isLoading && activeTab === "profile" && (
        profileData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 rounded-2xl border-gray-100 md:sticky md:top-36 h-fit">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div
                    {...getRootProps()}
                    className={`group relative cursor-pointer rounded-full overflow-hidden w-32 h-32 border-4 ${isDragging ? 'border-brand-teal animate-pulse' : 'border-white'}`}
                    style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)' }}
                  >
                    <input {...getInputProps()} />
                    <Avatar className="h-full w-full">
                      {/* Ensure profilePictureUrl is used here */}
                      <AvatarImage src={profileData.profilePictureUrl} alt={profileData.name} />
                      <AvatarFallback className="bg-gradient-to-br from-brand-blue-light to-brand-teal-light text-white text-2xl">
                        {profileData.name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-white mb-2" />
                          <span className="text-white text-xs font-medium">Change Photo</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isDragging && (
                    <div className="absolute inset-0 z-40 rounded-full animate-ping bg-brand-teal/20"></div>
                  )}
                </div>

                <h2 className="text-xl font-semibold mt-2">{profileData.name}</h2>
                <p className="text-gray-500 text-sm">{profileData.email}</p>

                <div className="w-full mt-6">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <Calendar className="h-4 w-4 text-brand-blue" />
                    <span>Joined {formatJoinDate(profileData.joinedAt)}</span>
                  </div>
                  {profileData.company && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <Building className="h-4 w-4 text-brand-blue" />
                      <span>{profileData.company}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 text-brand-blue" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="md:col-span-2">
              <Card className="rounded-2xl border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to profileData if canceling edit
                          if (profileData) {
                            setFormData({
                              name: profileData.name || "",
                              email: profileData.email || "",
                              company: profileData.company || "",
                              location: profileData.location || "",
                              bio: profileData.bio || ""
                            });
                          }
                        }}
                        variant="ghost"
                        className="rounded-xl"
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        form="profile-form"
                        className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {isEditing ? (
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company || ""}
                          onChange={handleInputChange}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location (optional)</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location || ""}
                          onChange={handleInputChange}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio (optional)</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio || ""}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full rounded-xl border border-gray-200 focus:border-brand-blue focus-visible:ring-brand-blue/30 focus-visible:ring-offset-0 p-3"
                        />
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                        <p className="text-gray-900">{profileData.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                        <p className="text-gray-900">{profileData.email}</p>
                      </div>
                      {profileData.company && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Company</h4>
                          <p className="text-gray-900">{profileData.company}</p>
                        </div>
                      )}
                      {profileData.location && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                          <p className="text-gray-900">{profileData.location}</p>
                        </div>
                      )}
                      {profileData.bio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                          <p className="text-gray-900">{profileData.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Case: Not loading, profile tab active, but profileData is null
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-red-600">Profile Data Unavailable</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              We couldn't load your profile information. This might be a temporary issue.
              Please try refreshing the page. If the problem continues, please contact support.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
              Refresh Page
            </Button>
          </div>
        )
      )}

      {!isLoading && (activeTab !== "profile") && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mb-4">
            {/* Placeholder Icon for other tabs */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-blue">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">Coming Soon</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            This section is under construction. Check back later for updates!
          </p>
        </div>
      )}
    </main>
  )
}