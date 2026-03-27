import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  Package,
  ShoppingCart,
  Clock,
  IndianRupee,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const PIE_COLORS = ["#c97a4a", "#3d2b1f", "#e8b99b", "#9a7060", "#d2aa91"];
const BAR_COLOR = "#c97a4a";
const LINE_COLOR = "#c97a4a";

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, to, sub }) => (
  <Link
    to={to}
    className="group bg-surface-card rounded-2xl border border-warm/15 p-5 hover:shadow-[0_4px_24px_rgba(140,90,60,0.1)] transition-all duration-300 hover:-translate-y-0.5 block"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
        <Icon size={18} className="text-brand" />
      </div>
      <ArrowRight
        size={14}
        className="text-ink-faint group-hover:text-brand transition-colors mt-1"
      />
    </div>
    <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-ink-muted mb-1">
      {title}
    </p>
    <p className="text-2xl font-semibold text-ink">{value}</p>
    {sub && <p className="text-[11px] text-ink-faint mt-1">{sub}</p>}
  </Link>
);

// ── Chart card wrapper ────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div className="bg-surface-card rounded-2xl border border-warm/15 p-5">
    <p className="text-[13px] font-medium text-ink mb-4">{title}</p>
    {children}
  </div>
);

// ── Status badge ──────────────────────────────────────────────
const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Processing: "bg-blue-50 text-blue-600 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Delivered: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-500 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[status] || "bg-surface-raised text-ink-muted border-warm/20"}`}
  >
    {status}
  </span>
);

// ─────────────────────────────────────────────────────────────
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
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, statsRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/orders"),
          axiosInstance.get("/admin/stats"),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "Pending").length,
          revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        });

        setRecentOrders(
          [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5),
        );

        setChartData(statsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Skeleton ──────────────────────────────────────────────
  if (loading)
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl border border-warm/15 p-5 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-raised mb-3" />
              <div className="h-2.5 bg-surface-raised rounded-full w-20 mb-2" />
              <div className="h-6 bg-surface-raised rounded-full w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl border border-warm/15 p-5 h-64 animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  if (!chartData)
    return (
      <div className="p-8 text-center text-red-500">Failed to load stats</div>
    );

  const salesData = chartData.salesByMonth.map((i) => ({
    month: i._id,
    total: i.totalSales,
  }));
  const statusData = chartData.ordersByStatus.map((i) => ({
    name: i._id,
    value: i.count,
  }));
  const categoryData = chartData.topCategories.map((i) => ({
    name: i?.categoryName || "Unknown",
    count: i.count,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Page title ──────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
          Overview
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">Dashboard</h1>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          to="/admin/products"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          to="/admin/orders"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          to="/admin/orders"
          sub="Needs attention"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          to="/admin/orders"
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly sales */}
        <ChartCard title="Monthly Sales">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d2aa91"
                strokeOpacity={0.3}
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9a7060" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9a7060" }} />
              <Tooltip
                formatter={(v) => [`₹${v}`, "Sales"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #d2aa91",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: LINE_COLOR }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orders by status */}
        <ChartCard title="Orders by Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                cx="50%"
                cy="45%"
                outerRadius={75}
                innerRadius={40}
                labelLine={false}
                label={({ value }) => value}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #d2aa91",
                  fontSize: 12,
                }}
              />
              <Legend
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top categories */}
        <ChartCard title="Top Categories">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d2aa91"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9a7060" }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9a7060" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #d2aa91",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Recent orders table ──────────────────────────────── */}
      <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm/10">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-brand" />
            <p className="text-[13px] font-medium text-ink">Recent Orders</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-[11px] text-brand hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-ink-muted py-8 text-sm">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-left">
              <thead>
                <tr className="border-b border-warm/10">
                  {["Customer", "Total", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-5 text-[11px] font-medium tracking-[1px] uppercase text-ink-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-warm/8 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 px-5 text-[13px] font-medium text-ink">
                      {order.name}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-brand font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-5 text-[12px] text-ink-muted">
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
  );
};

export default AdminDashboard;
