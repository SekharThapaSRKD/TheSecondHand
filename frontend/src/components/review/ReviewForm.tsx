import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isAuthenticated) return alert("Please login to submit a review");
    if (!comment.trim()) return alert("Please write a comment");
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const d = await res.json();
      if (!res.ok) alert(d?.message || "Failed to submit review");
      else {
        setComment("");
        setRating(5);
        onSubmitted && onSubmitted();
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Rating
        </label>
        <div 
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground stroke-1"
                } transition-colors duration-200`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {hoverRating || rating} out of 5
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Your Experience
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Posting..." : "Submit Review"}
      </Button>
    </div>
  );
}
