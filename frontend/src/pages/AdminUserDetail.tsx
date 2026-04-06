import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/context/ProductContext";
import { ShieldCheck, Trash2, ArrowLeft, Package, Tag } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserData {
  _id: string;
  name: string;
  email: string;
  totalSales: number;
  totalPurchases: number;
  totalRevenue: number;
  totalSpent: number;
  averageRating: number;
  reviewCount: number;
  location: string;
  about: string;
  createdAt: string;
  stats?: {
    totalRevenue: number;
    totalSpent: number;
    revenueFromTransactions: number;
    spentFromTransactions: number;
    totalSales: number;
    totalPurchases: number;
    productsListed: number;
    productsSold: number;
    productsPending: number;
    productsApproved: number;
  };
  recentProducts?: any[];
  sellerTransactions?: any[];
  buyerTransactions?: any[];
  orders?: any[];
}

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  amount: number;
  paymentStatus: "paid" | "unpaid";
  product: {
    name: string;
    price: number;
  };
  seller?: {
    name: string;
  };
  buyer?: {
    name: string;
  };
  createdAt: string;
}

const AdminUserDetail = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [userProducts, setUserProducts] = useState([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { products } = useProducts();

  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Verify admin
  useEffect(() => {
    if (currentUser?.isAdmin) {
      setAdminVerified(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminVerified(false);
      return;
    }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAdminVerified(!!data?.user?.isAdmin);
      })
      .catch(() => setAdminVerified(false));
  }, [currentUser, API]);

  // Fetch user data and transactions
  useEffect(() => {
    if (!adminVerified || !userId) return;

    const token = localStorage.getItem("token");
    setLoading(true);

    fetch(`${API}/api/auth/admin/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
        
        // Extract transactions if available
        const sellerTxs = data.user.sellerTransactions || [];
        const buyerTxs = data.user.buyerTransactions || [];
        
        // Convert to old transaction format for compatibility
        const allTransactions = [
          ...sellerTxs.map(t => ({ ...t, type: "sale" })),
          ...buyerTxs.map(t => ({ ...t, type: "purchase" })),
        ];
        setTransactions(allTransactions);
        
        // Get products from the data
        if (data.user.recentProducts) {
          setUserProducts(data.user.recentProducts);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [adminVerified, userId, API]);

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/auth/admin/user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUserProducts(userProducts.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showAdmin = (isAuthenticated && currentUser?.isAdmin) || adminVerified === true;

  if (!showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-4 text-2xl font-semibold">Admin Access Required</h2>
              <p className="mb-6 text-muted-foreground">
                You need admin privileges to access this page.
              </p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading user details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const soldItems = transactions.filter((t) => t.type === "sale");
  const purchasedItems = transactions.filter((t) => t.type === "purchase");
  const totalRevenue = userData.stats?.totalRevenue ?? userData.totalRevenue ?? soldItems.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = userData.stats?.totalSpent ?? userData.totalSpent ?? purchasedItems.reduce((sum, t) => sum + t.amount, 0);

  // Prepare monthly data for chart
  const monthlyData: { [key: string]: { month: string; sales: number; purchases: number } } = {};
  
  transactions.forEach((t) => {
    const date = new Date(t.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthDisplay = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthDisplay, sales: 0, purchases: 0 };
    }
    
    if (t.type === "sale") {
      monthlyData[monthKey].sales += t.amount;
    } else {
      monthlyData[monthKey].purchases += t.amount;
    }
  });

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>

        {/* User Overview Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold">{userData.stats?.totalSales ?? userData.totalSales}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Bought</p>
                  <p className="text-2xl font-bold">{userData.stats?.totalPurchases ?? userData.totalPurchases}</p>
                </div>
                <Tag className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">NRs {totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">NRs {totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products Listed</p>
                  <p className="text-2xl font-bold">{userData.stats?.productsListed ?? 0}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{userData.averageRating.toFixed(1)}⭐</p>
                </div>
                <div className="h-8 w-8 text-yellow-500">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{userData.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{userData.email}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this user? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-3">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{userData.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {userData.about && (
              <div>
                <p className="text-sm text-muted-foreground">About</p>
                <p className="font-medium">{userData.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User's Listed Items */}
        {userProducts.filter((p: any) => p.status !== "sold").length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Listed Items ({userProducts.filter((p: any) => p.status !== "sold").length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProducts.filter((p: any) => p.status !== "sold").map((product: any) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs {product.price} • {product.clothType}
                        </p>
                        <Badge variant="outline">{product.status}</Badge>
                      </div>
                    </div>
                    {product.status !== "sold" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this product?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Charts Section */}
        {transactions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Pie Chart - Transaction Types */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-80">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Sales",
                          value: soldItems.length,
                          fill: "#10b981",
                        },
                        {
                          name: "Purchases",
                          value: purchasedItems.length,
                          fill: "#3b82f6",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value} transactions`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Revenue vs Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Spending</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-80">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Amount",
                        Revenue: totalRevenue,
                        Spending: totalSpent,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `NRs ${value?.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#10b981" name="Revenue (Sold)" />
                    <Bar dataKey="Spending" fill="#3b82f6" name="Spending (Purchased)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Trends Chart */}
        {monthlyChartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Transaction Trends</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-96">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `NRs ${value?.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="Sales Revenue" />
                  <Bar dataKey="purchases" fill="#3b82f6" name="Purchase Spending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === "sale" ? "Sold to:" : "Bought from:"}{" "}
                        {transaction.type === "sale"
                          ? transaction.buyer?.name
                          : transaction.seller?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">NRs {transaction.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUserDetail;
