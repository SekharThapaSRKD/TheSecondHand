import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from 'react';

interface Filters {
  search: string;
  gender: string;
  category: string;
  condition: string;
  location: string;
  minPrice: number | "";
  maxPrice: number | "";
}

interface SearchFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClear: () => void;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const categories = ['All', 'Jackets', 'Tops', 'Bottoms', 'Shoes', 'Bags', 'Accessories', 'Sweaters'];
const conditions = ['All', 'new', 'like-new', 'good', 'fair'];
const genders = ['All', 'Men', 'Women', 'Unisex'];

export const SearchFilters = ({ filters, setFilters, onClear }: SearchFiltersProps) => {
  const [locations, setLocations] = useState<string[]>(['All']);

  // Fetch unique locations from backend
  useEffect(() => {
    fetch(`${API}/api/products/stats/locations`)
      .then(r => r.json())
      .then(data => {
        if (data?.locations) {
          setLocations(['All', ...data.locations]);
        }
      })
      .catch(err => console.error('Failed to fetch locations:', err));
  }, []);
  
  const handleCheckboxChange = (key: keyof Filters, value: string) => {
     setFilters(prev => ({
        ...prev,
        [key]: prev[key] === value ? 'all' : value
     }));
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-8 sticky top-24">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
        </h3>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear} 
            className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Search</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Keywords..."
                    value={filters.search}
                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                />
            </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">Price Range (NRs)</Label>
            <Slider
                value={[
                    filters.minPrice === "" ? 0 : filters.minPrice, 
                    filters.maxPrice === "" ? 100000 : filters.maxPrice
                ]}
                min={0}
                max={100000}
                step={100}
                onValueChange={([min, max]) =>
                setFilters((f) => ({ ...f, minPrice: min, maxPrice: max }))
                }
                className="py-2"
            />
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Min</span>
                    <Input
                        type="number"
                        min={0}
                        value={filters.minPrice}
                        onChange={(e) =>
                            setFilters((f) => ({ 
                                ...f, 
                                minPrice: e.target.value === "" ? "" : Number(e.target.value) 
                            }))
                        }
                        className="h-9 pl-9 text-right"
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Max</span>
                    <Input
                        type="number"
                        min={0}
                        value={filters.maxPrice}
                        onChange={(e) =>
                            setFilters((f) => ({ 
                                ...f, 
                                maxPrice: e.target.value === "" ? "" : Number(e.target.value) 
                            }))
                        }
                        className="h-9 pl-9 text-right"
                    />
                </div>
            </div>
        </div>

        <Accordion type="multiple" defaultValue={["category", "gender", "condition"]} className="w-full">
            
            {/* Gender */}
            <AccordionItem value="gender" className="border-b-0 mb-2">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                    Gender
                </AccordionTrigger>
                <AccordionContent className="px-2 pt-2">
                    <div className="space-y-2">
                        {genders.map((gender) => {
                            const val = gender.toLowerCase();
                            const isChecked = filters.gender === val;
                            return (
                                <div key={gender} className="flex items-center space-x-2 group">
                                    <Checkbox 
                                        id={`gender-${gender}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => handleCheckboxChange('gender', val)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor={`gender-${gender}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1 group-hover:text-primary transition-colors">
                                        {gender}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* Category */}
            <AccordionItem value="category" className="border-b-0 mb-2">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                    Category
                </AccordionTrigger>
                <AccordionContent className="px-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => {
                            const val = cat.toLowerCase();
                            const isChecked = filters.category === val;
                            return (
                                <div key={cat} className="flex items-center space-x-2 group col-span-1">
                                    <Checkbox 
                                        id={`cat-${cat}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => handleCheckboxChange('category', val)}
                                    />
                                    <label htmlFor={`cat-${cat}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1 group-hover:text-primary transition-colors truncate">
                                        {cat}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>

             {/* Condition */}
             <AccordionItem value="condition" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                    Condition
                </AccordionTrigger>
                <AccordionContent className="px-2 pt-2">
                    <div className="space-y-2">
                        {conditions.map((cond) => {
                            const val = cond.toLowerCase();
                            const display = cond === 'All' ? 'All' : cond.charAt(0).toUpperCase() + cond.slice(1);
                            const isChecked = filters.condition === val;
                            return (
                                <div key={cond} className="flex items-center space-x-2 group">
                                    <Checkbox 
                                        id={`cond-${cond}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => handleCheckboxChange('condition', val)}
                                    />
                                    <label htmlFor={`cond-${cond}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1 group-hover:text-primary transition-colors">
                                        {display}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
            
             {/* Location */}
             <AccordionItem value="location" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                    Location
                </AccordionTrigger>
                <AccordionContent className="px-2 pt-2">
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Enter location..."
                                value={filters.location === 'all' ? '' : filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || 'all' }))}
                                className="pl-3 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>
                        {locations.length > 1 && (
                            <div className="text-xs text-muted-foreground pt-1">
                                Suggestions: {locations.filter(l => l !== 'All').slice(0, 3).join(', ')}
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
};
