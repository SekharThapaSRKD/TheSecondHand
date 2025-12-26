import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchFilters } from '@/components/search/SearchFilters';
import { useProducts } from '@/context/ProductContext';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const defaultFilters = {
  search: '',
  gender: 'all',
  category: 'all',
  condition: 'all',
  location: 'all',
  minPrice: "" as (number | ""),
  maxPrice: "" as (number | ""),
};

const Search = () => {
  const { products } = useProducts();
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.gender !== 'all' && product.gender !== filters.gender) {
        return false;
      }
      if (filters.category !== 'all' && product.category.toLowerCase() !== filters.category) {
        return false;
      }
      if (filters.condition !== 'all' && product.condition !== filters.condition) {
        return false;
      }
      if (filters.location !== 'all' && product.location.toLowerCase() !== filters.location) {
        return false;
      }
      
      const min = filters.minPrice === "" ? 0 : filters.minPrice;
      const max = filters.maxPrice === "" ? Infinity : filters.maxPrice;
      
      if (product.price < min || product.price > max) {
        return false;
      }
      return true;
    });

    return result.sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        // newest: assume a.createdAt exists or fallback. 
        // If sorting by newest, we usually want descending date.
        // If string date:
        if (sortBy === 'newest') {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
    });

  }, [products, filters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Browse Items</h1>
            <p className="text-muted-foreground mt-1">{filteredProducts.length} items found</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2">
                   <SlidersHorizontal className="h-4 w-4" /> Filters
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto p-0">
                 <div className="p-6">
                    <SearchFilters 
                        filters={filters} 
                        setFilters={setFilters} 
                        onClear={() => setFilters(defaultFilters)} 
                    />
                 </div>
               </SheetContent>
             </Sheet>

             <div className="relative flex-1 md:w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                placeholder="Search by name..."
                className="pl-9"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                />
             </div>

             <Select value={sortBy} onValueChange={setSortBy}>
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Sort by" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="newest">Newest Arrivals</SelectItem>
                 <SelectItem value="price-asc">Price: Low to High</SelectItem>
                 <SelectItem value="price-desc">Price: High to Low</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block sticky top-24 h-fit">
            <SearchFilters
              filters={filters}
              setFilters={setFilters}
              onClear={() => setFilters(defaultFilters)}
            />
          </aside>
          <div>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="rounded-xl border border-dashed p-12 text-center bg-muted/30">
                <h3 className="text-lg font-semibold">No items found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                <Button 
                    variant="link" 
                    className="mt-4 text-primary"
                    onClick={() => setFilters(defaultFilters)}
                >
                    Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
