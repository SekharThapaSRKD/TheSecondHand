import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Upload, ImagePlus, X } from "lucide-react";

const clothTypes = [
  { value: "t-shirt", label: "T-Shirt" },
  { value: "shirt", label: "Shirt" },
  { value: "jacket", label: "Jacket" },
  { value: "blazer", label: "Blazer" },
  { value: "sweater", label: "Sweater" },
  { value: "hoodie", label: "Hoodie" },
  { value: "pants", label: "Pants" },
  { value: "jeans", label: "Jeans" },
  { value: "shorts", label: "Shorts" },
  { value: "skirt", label: "Skirt" },
  { value: "dress", label: "Dress" },
  { value: "saree", label: "Saree" },
  { value: "shoes", label: "Shoes" },
  { value: "boots", label: "Boots" },
  { value: "sandals", label: "Sandals" },
  { value: "bag", label: "Bag" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Other" },
];
const conditions = [
  { value: "new-with-tags", label: "New with tags" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "worn", label: "Worn" },
];
const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One Size",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const materials = [
  "Cotton",
  "Polyester",
  "Wool",
  "Silk",
  "Linen",
  "Denim",
  "Leather",
  "Suede",
  "Synthetic",
  "Blend",
  "Other",
];

const colors = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple",
  "Pink", "Brown", "Gray", "Grey", "Beige", "Navy", "Turquoise", "Cyan",
  "Magenta", "Lime", "Olive", "Maroon", "Teal", "Indigo", "Violet", "Gold",
  "Silver", "Coral", "Khaki", "Cream", "Charcoal", "Peach", "Tan", "Burgundy",
  "Salmon", "Rose", "Emerald", "Azure", "Lavender", "Mint", "Coral", "Transparent",
  "Clear", "Multi-color", "Striped", "Patterned", "Floral", "Printed"
];

const locations = [
  "Kathmandu", "Bhaktapur", "Lalitpur", "Pokhara", "Biratnagar",
  "Janakpur", "Nepalganj", "Dharan", "Birgunj", "Butwal",
  "Hetauda", "Simara", "Gorkha", "Dhulikhel", "Narayanghat",
  "Malangwa", "Raxaul", "Tuladhar", "Kalaiya", "Ilam",
  "Damak", "Itahari", "Sunsari", "Udayapur", "Okhaldi",
  "Morang", "Makwanpur", "Nuwakot", "Sindhupalchok", "Kavre"
];

const brands = [
  "Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse",
  "H&M", "Zara", "Forever 21", "Uniqlo", "Gap", "Old Navy",
  "Gucci", "Louis Vuitton", "Prada", "Chanel", "Dior", "Versace",
  "Calvin Klein", "Tommy Hilfiger", "Ralph Lauren", "Polo",
  "Levis", "Wrangler", "Diesel", "Guess", "Lee",
  "Lacoste", "Fred Perry", "Burberry", "Armani",
  "Zuri", "Daraz", "Sajilo", "Local", "Domestic", "Custom",
  "Sunglass Hut", "Ray-Ban", "Oakley", "Coach", "Michael Kors",
  "C&A", "Mango", "COS", "Topshop", "ASOS"
];

const Sell = () => {
  const { user, isAuthenticated } = useAuth();
  const { addProduct } = useProducts();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    gender: "",
    clothType: "",
    color: "",
    material: "",
    brand: "",
    condition: "",
    location: "",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    ],
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // If files selected, submit as FormData
      if (files && files.length) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("description", formData.description);
        fd.append("price", String(parseFloat(formData.price)));
        fd.append("size", formData.size);
        fd.append("gender", formData.gender as string);
        fd.append("clothType", formData.clothType);
        fd.append("color", formData.color);
        fd.append("material", formData.material);
        fd.append("brand", formData.brand);
        fd.append("condition", formData.condition);
        fd.append("location", formData.location);
        files.slice(0, 5).forEach((f) => fd.append("images", f));
        // @ts-ignore
        await addProduct(fd, user);
      } else {
        await addProduct(
          {
            ...formData,
            price: parseFloat(formData.price),
            gender: formData.gender as "men" | "women" | "unisex",
            condition: formData.condition as
              | "new-with-tags"
              | "like-new"
              | "good"
              | "fair"
              | "worn",
          },
          user
        );
      }
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <h2 className="mb-4 font-display text-2xl font-semibold">
                Sign in to sell
              </h2>
              <p className="mb-6 text-muted-foreground">
                You need an account to list items for sale
              </p>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              List an Item
            </CardTitle>
            <CardDescription>
              Fill in the details below. Your listing will be reviewed before
              going live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                <ImagePlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos (up to 5)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Demo uses placeholder images
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setFiles(selected.slice(0, 5));
                  }}
                  className="mt-3 mx-auto"
                />
                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {files.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Vintage Denim Jacket"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item, including any flaws or special features"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (NRs) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Size *</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(v) =>
                      setFormData({ ...formData, size: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) =>
                      setFormData({ ...formData, gender: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(v) =>
                      setFormData({ ...formData, brand: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(v) =>
                      setFormData({ ...formData, color: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Material</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(v) =>
                      setFormData({ ...formData, material: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((mat) => (
                        <SelectItem key={mat} value={mat}>
                          {mat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cloth Type *</Label>
                  <Select
                    value={formData.clothType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, clothType: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cloth type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clothTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) =>
                      setFormData({ ...formData, condition: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(v) =>
                      setFormData({ ...formData, location: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Submit for Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Sell;
