import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/products/ProductCard";
import { useNavigate, useParams } from "react-router-dom";
import { Package, ShoppingBag, Calendar, MapPin, Globe, Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Profile = () => {
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Determine if we are viewing our own profile
  const isOwnProfile = !id || (currentUser && currentUser._id === id);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (isOwnProfile) {
        if (currentUser) {
          setProfileUser(currentUser);
          setName(currentUser.name);
          setAbout(currentUser.about || "");
          setLocation(currentUser.location || "");
          setPhone(currentUser.phone || "");
          setWebsite(currentUser.website || "");
          setPreview(currentUser.avatar || null);
        }
      } else {
        try {
          const res = await fetch(`${API_URL}/api/auth/user/${id}`);
          if (res.ok) {
            const data = await res.json();
            setProfileUser(data.user);
          } else {
            setProfileUser(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  if (!isAuthenticated && isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <h2 className="mb-4 font-display text-2xl font-semibold">
                Sign in required
              </h2>
              <p className="mb-6 text-muted-foreground">
                Please sign in to view your profile
              </p>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const userProducts = products.filter((p) => p.seller._id === profileUser._id);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        window.location.reload(); 
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting product");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 animate-fade-in border-none shadow-md bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-xl">
                  {isOwnProfile && editing && preview ? (
                     // @ts-ignore
                    <img
                      src={preview.startsWith("http") || preview.startsWith("blob:") ? preview : `${API_URL}${preview}`}
                      alt={profileUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : profileUser.avatar ? (
                    <img
                      src={profileUser.avatar.startsWith("http") ? profileUser.avatar : `${API_URL}${profileUser.avatar}`}
                      alt={profileUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary to-primary/60 text-4xl text-primary-foreground flex items-center justify-center h-full font-bold">
                      {profileUser.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                {!editing ? (
                  <>
                    <div>
                      <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                        {profileUser.name}
                      </h1>
                      {!isOwnProfile && (
                        <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                           User Profile
                        </p>
                      )}
                      {isOwnProfile && <p className="text-muted-foreground">{currentUser.email}</p>}
                    </div>
                    
                    {profileUser.about && (
                      <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">{profileUser.about}</p>
                    )}

                    <div className="flex flex-wrap justify-center gap-6 md:justify-start text-sm">
                       {profileUser.location && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <MapPin className="h-4 w-4" />
                           {profileUser.location}
                         </div>
                       )}
                       {profileUser.website && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Globe className="h-4 w-4" />
                           <a href={profileUser.website} target="_blank" rel="noreferrer" className="hover:underline">
                             {profileUser.website}
                           </a>
                         </div>
                       )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 md:justify-start pt-2">
                      <div className="flex flex-col items-center md:items-start">
                        <span className="font-bold text-2xl">{profileUser.totalSales || 0}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" /> Sold
                        </span>
                      </div>
                      <div className="flex flex-col items-center md:items-start">
                        <span className="font-bold text-2xl">{profileUser.totalPurchases || 0}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                           <ShoppingBag className="h-3 w-3" /> Bought
                        </span>
                      </div>
                      <div className="flex flex-col items-center md:items-start">
                        <span className="font-bold text-xl px-2 py-1 bg-muted rounded-md text-muted-foreground text-sm">
                           Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  // Edit Form (Only for own profile)
                  <div className="space-y-4 text-left w-full max-w-xl animate-in fade-in slide-in-from-top-4">
                    <div className="grid gap-2">
                       <Label>Name</Label>
                       <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                       <Label>About</Label>
                       <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell us about yourself..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Website</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>Avatar</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setAvatarFile(f);
                          if (f) {
                            setPreview(URL.createObjectURL(f));
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                {isOwnProfile && !editing && (
                  <>
                  <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                   <Button onClick={() => navigate("/sell")} className="w-full">
                    List Item
                  </Button>
                  </>
                )}
                {editing && (
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      onClick={async () => {
                        try {
                          const fd = new FormData();
                          fd.append("name", name);
                          fd.append("about", about || "");
                          fd.append("location", location || "");
                          fd.append("phone", phone || "");
                          fd.append("website", website || "");
                          if (avatarFile) fd.append("avatar", avatarFile);
                          await updateProfile(fd);
                          setEditing(false);
                        } catch (e) {
                          console.error(e);
                          alert("Failed to update profile");
                        }
                      }}
                      className="w-full">
                      Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(false);
                        setPreview(currentUser?.avatar || null);
                      }}
                       className="w-full">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {userProducts.length > 0 ? (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {isOwnProfile ? "Your Listings" : `${profileUser.name}'s Listings`}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {userProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => navigate(`/product/${product._id}`)}
                  // Only allow delete if own profile
                  onDelete={isOwnProfile ? () => handleDelete(product._id) : undefined}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No listings found</h3>
            <p className="mb-4 text-muted-foreground">
              {isOwnProfile ? "You haven't listed any items yet." : "This user hasn't listed any items yet."}
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate("/sell")} variant="outline">
                List Your First Item
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
