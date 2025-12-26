import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm shadow-xl border-red-100 dark:border-red-900/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Payment Failed</CardTitle>
          <CardDescription className="text-base">
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
            Your card was not charged. If the problem persists, try a different payment method.
          </div>
          <div className="grid gap-2">
            <Button onClick={() => navigate("/cart")} className="w-full" variant="default">
              Return to Cart
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
