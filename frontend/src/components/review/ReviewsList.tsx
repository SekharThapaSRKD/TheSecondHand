import React, { useEffect, useState } from "react";
import { Review } from "@/types";
import { Star, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ReviewsList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/api/products/${productId}/reviews`);
      const d = await res.json();
      if (res.ok && d?.reviews) setReviews(d.reviews);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (!reviews.length) 
    return (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <p>No reviews yet. Be the first to share your experience!</p>
        </div>
    );

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r._id} className="flex gap-4 p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow">
          <Avatar className="w-10 h-10 border">
            <AvatarFallback className="bg-primary/10 text-primary">
                {r.reviewer?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold text-sm">{r.reviewer?.name || "Anonymous User"}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} 
                            />
                        ))}
                    </div>
                </div>
                <span className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            </div>
            
            <p className="text-sm text-foreground/90 leading-relaxed">
                {r.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
