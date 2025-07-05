"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { Camera, Save, User as UserIcon } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
    email: ""
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setProfile(prev => ({
            ...prev,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "",
            avatar_url: user.user_metadata?.avatar_url || ""
          }))
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase.auth, toast])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log("Attempting to upload to path:", filePath)
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        console.error("Upload error details:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error
        })
        throw uploadError
      }

      console.log("Upload successful, data:", uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log("Avatar upload successful, public URL:", publicUrl)
      return publicUrl
    } catch (error) {
      console.error("Error in uploadAvatar:", error)
      throw error
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        console.log("Uploading avatar file:", avatarFile.name)
        try {
          avatarUrl = await uploadAvatar(avatarFile)
          console.log("Avatar uploaded, URL:", avatarUrl)
        } catch (uploadError) {
          console.error("Avatar upload failed, keeping existing avatar:", uploadError)
          // Keep the existing avatar URL if upload fails
          toast({
            title: "Warning",
            description: "Avatar upload failed, but other changes will be saved",
            variant: "destructive"
          })
        }
      }

      console.log("Updating user metadata with:", {
        full_name: profile.full_name,
        avatar_url: avatarUrl
      })

      // Update user metadata
      const { error, data } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          avatar_url: avatarUrl
        }
      })

      console.log("Update result:", { error, data })

      if (error) throw error

      // Verify the update worked by fetching the user again
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      console.log("Updated user metadata:", updatedUser?.user_metadata)

      // Refresh the session to update the user data
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log("Refreshing session...")
        // Trigger a session refresh
        await supabase.auth.refreshSession()
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      })

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }))
      setAvatarFile(null)
      setAvatarPreview("")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-m8bs-blue"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="bg-m8bs-card border-m8bs-border">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarPreview || profile.avatar_url} 
                    alt={profile.full_name || "User"} 
                  />
                  <AvatarFallback className="text-lg bg-m8bs-blue text-white">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-m8bs-blue text-white rounded-full p-2 cursor-pointer hover:bg-m8bs-blue-dark transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to upload a new image
                </p>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className="bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted border-m8bs-border text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 