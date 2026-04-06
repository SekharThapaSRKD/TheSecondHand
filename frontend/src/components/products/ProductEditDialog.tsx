import React, { useState } from "react";
import { Product } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductEditDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProduct: Product) => void;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Valid color list
const VALID_COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple",
  "Pink", "Brown", "Gray", "Grey", "Beige", "Navy", "Turquoise", "Cyan",
  "Magenta", "Lime", "Olive", "Maroon", "Teal", "Indigo", "Violet", "Gold",
  "Silver", "Coral", "Khaki", "Cream", "Charcoal", "Peach", "Tan", "Burgundy",
  "Salmon", "Rose", "Emerald", "Azure", "Lavender", "Mint", "Coral", "Transparent",
  "Clear", "Multi-color", "Striped", "Patterned", "Floral", "Printed"
];

// Valid locations in Nepal
const VALID_LOCATIONS = [
  "Kathmandu", "Bhaktapur", "Lalitpur", "Pokhara", "Biratnagar",
  "Janakpur", "Nepalganj", "Dharan", "Birgunj", "Butwal",
  "Hetauda", "Simara", "Gorkha", "Dhulikhel", "Narayanghat",
  "Malangwa", "Raxaul", "Tuladhar", "Kalaiya", "Ilam",
  "Damak", "Itahari", "Sunsari", "Udayapur", "Okhaldi",
  "Morang", "Makwanpur", "Nuwakot", "Sindhupalchok", "Kavre"
];

// Valid materials by cloth type
const MATERIAL_BY_CLOTHTYPE: { [key: string]: string[] } = {
  "t-shirt": ["Cotton", "Polyester", "Cotton Blend", "100% Cotton", "Organic Cotton", "Modal"],
  "shirt": ["Cotton", "Linen", "Silk", "Polyester", "Cotton Blend", "Bamboo"],
  "jacket": ["Denim", "Leather", "Wool", "Polyester", "Fleece", "Cotton", "Nylon", "Suede"],
  "blazer": ["Wool", "Cotton", "Silk", "Linen", "Wool Blend", "Polyester"],
  "sweater": ["Wool", "Cotton", "Acrylic", "Cashmere", "Merino", "Wool Blend", "Polyester"],
  "hoodie": ["Cotton", "Polyester", "Cotton Blend", "Fleece", "Thermal"],
  "pants": ["Cotton", "Denim", "Polyester", "Wool", "Linen", "Cotton Blend"],
  "jeans": ["Denim", "Denim Blend", "Cotton Denim", "Stretch Denim"],
  "shorts": ["Cotton", "Denim", "Polyester", "Linen", "Cotton Blend"],
  "skirt": ["Cotton", "Silk", "Polyester", "Wool", "Linen", "Satin"],
  "dress": ["Cotton", "Silk", "Polyester", "Wool", "Linen", "Chiffon", "Satin"],
  "saree": ["Silk", "Cotton", "Linen", "Chiffon", "Georgette", "Crepe"],
  "shoes": ["Leather", "Canvas", "Rubber", "Suede", "Synthetic", "Mesh", "Cloth"],
  "boots": ["Leather", "Suede", "Rubber", "Synthetic", "Canvas"],
  "sandals": ["Leather", "Rubber", "Synthetic", "Canvas", "Cork"],
  "bag": ["Leather", "Canvas", "Polyester", "Nylon", "Synthetic", "Suede"],
  "accessories": ["Leather", "Metal", "Cloth", "Plastic", "Wool", "Cotton"],
  "other": ["Varies", "Cotton", "Polyester", "Leather", "Wool", "Silk"]
};

// Valid brands
const VALID_BRANDS = [
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

// Clothing size suggestions by cloth type
const SIZE_BY_CLOTHTYPE: { [key: string]: string[] } = {
  "t-shirt": ["XS", "S", "M", "L", "XL", "XXL"],
  "shirt": ["XS", "S", "M", "L", "XL", "XXL"],
  "jacket": ["XS", "S", "M", "L", "XL", "XXL"],
  "blazer": ["XS", "S", "M", "L", "XL", "XXL"],
  "sweater": ["XS", "S", "M", "L", "XL", "XXL"],
  "hoodie": ["XS", "S", "M", "L", "XL", "XXL"],
  "pants": ["XS", "S", "M", "L", "XL", "XXL"],
  "jeans": ["XS", "S", "M", "L", "XL", "XXL"],
  "shorts": ["XS", "S", "M", "L", "XL", "XXL"],
  "skirt": ["XS", "S", "M", "L", "XL", "XXL"],
  "dress": ["XS", "S", "M", "L", "XL", "XXL"],
  "saree": ["One Size", "Free Size"],
  "shoes": ["6", "7", "8", "9", "10", "11", "12"],
  "boots": ["6", "7", "8", "9", "10", "11", "12"],
  "sandals": ["6", "7", "8", "9", "10", "11", "12"],
  "bag": ["One Size"],
  "accessories": ["One Size"],
  "other": ["One Size", "XS", "S", "M", "L", "XL", "XXL"]
};

// Validate color - accept valid color names (case insensitive) or valid hex colors
const isValidColor = (color: string): boolean => {
  if (!color.trim()) return true; // empty is allowed
  
  const trimmed = color.trim();
  
  // Check if it's a valid color name (case insensitive)
  if (VALID_COLORS.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
    return true;
  }
  
  // Check if it's a valid hex color (#RGB, #RRGGBB, #RRGGBBAA)
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(trimmed)) {
    return true;
  }
  
  return false;
};

// Validate material based on cloth type
const isValidMaterial = (material: string, clothType: string): boolean => {
  if (!material.trim()) return true; // empty is allowed
  
  const validMaterials = MATERIAL_BY_CLOTHTYPE[clothType] || [];
  return validMaterials.some(m => m.toLowerCase() === material.trim().toLowerCase());
};

// Validate brand
const isValidBrand = (brand: string): boolean => {
  if (!brand.trim()) return true; // empty is allowed
  
  return VALID_BRANDS.some(b => b.toLowerCase() === brand.trim().toLowerCase());
};

// Get suitable sizes for cloth type
const getSuitableSizes = (clothType: string): string[] => {
  return SIZE_BY_CLOTHTYPE[clothType] || ["One Size"];
};

export const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    size: product.size,
    gender: product.gender,
    clothType: product.clothType,
    color: product.color || "",
    material: product.material || "",
    brand: product.brand || "",
    condition: product.condition,
    location: product.location,
  });
  const [loading, setLoading] = useState(false);
  const [colorError, setColorError] = useState("");
  const [materialError, setMaterialError] = useState("");
  const [brandError, setBrandError] = useState("");

  const handleColorChange = (value: string) => {
    setFormData({ ...formData, color: value });
    if (value.trim() && !isValidColor(value)) {
      setColorError(`"${value}" is not a valid color. Please use a color name (e.g., Blue, Red) or hex code (e.g., #FF5733)`);
    } else {
      setColorError("");
    }
  };

  const handleMaterialChange = (value: string) => {
    setFormData({ ...formData, material: value });
    if (value.trim() && !isValidMaterial(value, formData.clothType)) {
      const suggested = MATERIAL_BY_CLOTHTYPE[formData.clothType] || [];
      setMaterialError(`"${value}" is invalid for ${formData.clothType}. Suggested: ${suggested.join(", ")}`);
    } else {
      setMaterialError("");
    }
  };

  const handleBrandChange = (value: string) => {
    setFormData({ ...formData, brand: value });
    if (value.trim() && !isValidBrand(value)) {
      setBrandError(`"${value}" is not a recognized brand. Examples: Nike, Adidas, H&M, Zara`);
    } else {
      setBrandError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Error",
        description: "Price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "Location is required",
        variant: "destructive"
      });
      return;
    }

    // Validate color
    if (formData.color.trim() && !isValidColor(formData.color)) {
      toast({
        title: "Error",
        description: `"${formData.color}" is not a valid color. Please use a color name or hex code.`,
        variant: "destructive"
      });
      return;
    }

    // Validate material
    if (formData.material.trim() && !isValidMaterial(formData.material, formData.clothType)) {
      const suggested = MATERIAL_BY_CLOTHTYPE[formData.clothType] || [];
      toast({
        title: "Error",
        description: `"${formData.material}" is invalid for ${formData.clothType}. Suggested: ${suggested.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    // Validate brand
    if (formData.brand.trim() && !isValidBrand(formData.brand)) {
      toast({
        title: "Error",
        description: `"${formData.brand}" is not a recognized brand. Examples: Nike, Adidas, H&M, Zara`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/products/${product._id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update product");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onSave(data.product);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (NRs) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  required
                  min="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) =>
                    setFormData({ ...formData, size: value })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSuitableSizes(formData.clothType).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "men" | "women" | "unisex") =>
                    setFormData({ ...formData, gender: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(
                    value: "new-with-tags" | "like-new" | "good" | "fair" | "worn"
                  ) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-with-tags">New with Tags</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clothType">Cloth Type</Label>
                <Select
                  value={formData.clothType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clothType: value as any })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t-shirt">T-Shirt</SelectItem>
                    <SelectItem value="shirt">Shirt</SelectItem>
                    <SelectItem value="jacket">Jacket</SelectItem>
                    <SelectItem value="blazer">Blazer</SelectItem>
                    <SelectItem value="sweater">Sweater</SelectItem>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="pants">Pants</SelectItem>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="shorts">Shorts</SelectItem>
                    <SelectItem value="skirt">Skirt</SelectItem>
                    <SelectItem value="dress">Dress</SelectItem>
                    <SelectItem value="saree">Saree</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="boots">Boots</SelectItem>
                    <SelectItem value="sandals">Sandals</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  placeholder="e.g., Nike, H&M"
                  className={brandError ? "border-red-500" : ""}
                />
                {brandError && (
                  <p className="text-sm text-red-500">{brandError}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleColorChange(value)}>
                  <SelectTrigger className={colorError ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {colorError && (
                  <p className="text-sm text-red-500">{colorError}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  placeholder={`e.g., ${(MATERIAL_BY_CLOTHTYPE[formData.clothType] || ["Cotton"])[0]}`}
                  className={materialError ? "border-red-500" : ""}
                />
                {materialError && (
                  <p className="text-sm text-red-500">{materialError}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
