import AdminCard from "../../components/AdminCard";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#F44336", "#9C27B0"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all parallelly
        const [productsRes, ordersRes, statsRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/orders"),
          axiosInstance.get("/admin/stats"),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const statsApi = statsRes.data;
        console.log("statsApi", statsApi);

        // 💰 Compute top cards
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(
          (o) => o.status === "Pending"
        ).length;
        const revenue = orders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0
        );

        // 🕒 Recent 5 orders
        const recent = orders
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({ totalProducts, totalOrders, pendingOrders, revenue });
        setRecentOrders(recent);
        setChartData(statsApi);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        Loading dashboard data...
      </div>
    );

  if (!chartData)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load stats from server
      </div>
    );

  // Extract data for charts
  const salesData = chartData.salesByMonth.map((item) => ({
    month: item._id,
    total: item.totalSales,
  }));

  const statusData = chartData.ordersByStatus.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const categoryData = chartData.topCategories.map((item) => ({
    name: item?.categoryName || "Unknown",
    count: item.count,
  }));

  return (
    <div className="bg-light text-dark font-sans">
      <div className="p-2 sm:p-8">
        <h1 className="text-3xl font-serif font-semibold mb-8 text-primary">
          Dashboard
        </h1>

        {/* 📊 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard
            title="Total Products"
            value={stats.totalProducts}
            color="bg-primary text-light"
            to="/admin/products"
          />
          <AdminCard
            title="Total Orders"
            value={stats.totalOrders}
            color="bg-accent text-dark"
            to="/admin/orders"
          />
          <AdminCard
            title="Pending Orders"
            value={stats.pendingOrders}
            color="bg-secondary text-dark"
            to="/admin/orders"
          />
          <AdminCard
            title="Revenue"
            value={`₹${stats.revenue}`}
            color="bg-dark text-light"
            to="/admin/orders"
          />
        </div>

        {/* 📈 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* 1️⃣ Monthly Sales */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="text-lg font-semibold mb-3 text-dark">
              Monthly Sales
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2️⃣ Orders by Status */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="text-lg font-semibold mb-3 text-dark">
              Orders by Status
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ value }) => value}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3️⃣ Top Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="text-lg font-semibold mb-3 text-dark">
              Top Categories
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={({ x, y, payload }) => {
                    const words = payload.value.split("–");
                    return (
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor="middle"
                        fill="#555"
                        fontSize={12}
                      >
                        {words.map((w, i) => (
                          <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
                            {w.trim()}
                          </tspan>
                        ))}
                      </text>
                    );
                  }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🧾 Recent Orders */}
        <div className="mt-12 bg-white p-2 sm:p-6 rounded-2xl shadow-card">
          <h2 className="text-xl font-semibold mb-4 text-primary font-serif">
            Recent Orders
          </h2>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No recent orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-secondary/40 text-dark">
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Total</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-accent/20 transition-colors"
                    >
                      <td className="py-2 px-3">{order.name}</td>
                      <td className="py-2 px-3">₹{order.totalAmount}</td>
                      <td
                        className={`py-2 px-3 font-medium ${
                          order.status === "Pending"
                            ? "text-primary"
                            : order.status === "Delivered"
                            ? "text-green-700"
                            : order.status === "Cancelled"
                            ? "text-red-500"
                            : "text-dark"
                        }`}
                      >
                        {order.status}
                      </td>
                      <td className="py-2 px-3">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
