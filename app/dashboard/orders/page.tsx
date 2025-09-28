"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import OrderCard from "@/components/orders/OrderCard";
import OrderCreateModal from "@/components/orders/OrderCreateModal";

type NewOrder = {
  customerName: string;
  customerPhone: string;
  tableNumber: string;
};
import OrderEditModal from "@/components/orders/OrderEditModal";
import DeleteConfirmModal from "@/components/orders/DeleteConfirmModal";

type Item = {
  id: number;
  name: string;
  price: number;
  icon?: string;
};

type Order = {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  orderType: 'Dining' | 'Parcel';
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  status: "Paid" | "Pending" | "Waiting";
  orderTime: Date;
  notes?: string;
  items: Array<{ item: Item; quantity: number }>;
};

export default function OrdersPage() {
  type DateRange = "today" | "yesterday" | "week" | "month" | "custom";
  const ranges = ["today", "yesterday", "week", "month", "custom"] as const;
  const rangeLabels: Record<DateRange, string> = {
    today: "Today",
    yesterday: "Yesterday",
    week: "This Week",
    month: "This Month",
    custom: "Custom Range",
  };

  // 🔹 Filters
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // 🔹 Pagination state
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 5;
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Orders state (fetched from API)
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 🔹 Create/Edit/Delete modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editOrder, setEditOrder] = useState<Order|null>(null);
  const [deleteOrderNum, setDeleteOrderNum] = useState<string|null>(null);
  // 🔹 New order form state
  const [newOrder, setNewOrder] = useState<NewOrder>({ customerName: '', customerPhone: '', tableNumber: '' });

  // Remove max range note
  // 🔹 Fetch orders from API whenever filters or page change
  // Reset to first page when filter changes
  useEffect(() => {
    setPage(1);
    setOrders([]);
  }, [dateRange, customStart, customEnd]);
  
  // Fetch orders when page or filters change
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ dateRange });
        params.set("page", page.toString());
        params.set("limit", PAGE_LIMIT.toString());
        if (dateRange === "custom" && customStart && customEnd) {
          params.set("start", customStart);
          params.set("end", customEnd);
        }
        const res = await fetch(`/api/orders?${params.toString()}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders");
        const fetched: Order[] = (data.orders || []).map((o: any) => ({
          ...o,
          orderTime: new Date(o.orderTime),
          items: Array.isArray(o.items) ? o.items : [],
        }));
        // On first page, replace; otherwise append
        setOrders((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
        setHasMore(data.pagination?.hasMore ?? false);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    // For custom ranges, fetch if both dates provided
    if (dateRange === "custom" && (!customStart || !customEnd)) {
      if (page === 1) {
        setOrders([]);
      }
      return;
    }
    // Fetch orders
    fetchOrders();
  }, [dateRange, customStart, customEnd, page]);

  // Infinite scroll: load more when reaching bottom
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200;
      if (scrollPos >= threshold) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <DashboardHeader title="Order Management" showBackButton={true} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header + Create */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage all orders
            </p>
          </div>
          <button
            onClick={() => {
              // reset form fields for new order
              setNewOrder({ customerName: '', customerPhone: '', tableNumber: '' });
              setShowCreate(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
          >
            + Create Order
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              Filter by date:
            </span>
            <span className="text-xs text-gray-500">
              (max 1 year range)
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
                  dateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                }`}
                onClick={() => setDateRange(range)}
              >
                {rangeLabels[range]}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-2 items-center flex-wrap mt-2">
              <input
                type="date"
                className="border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={customStart}
                max={customEnd || ""}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-gray-900 dark:text-white">to</span>
              <input
                type="date"
                className="border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={customEnd}
                min={customStart || ""}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Orders Grid */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 text-gray-600 dark:text-gray-300">
            Loading orders…
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order, index) => (
            <OrderCard
              key={`${order.orderNumber}-${order._id || index}`}
              order={order}
              onEdit={() => {
                setEditOrder(order);
                setShowEdit(true);
              }}
              onDelete={() => setDeleteOrderNum(order.orderNumber)}
            />
          ))}
        </div>
        {/* Infinite Scroll Loading Indicator */}
        {loading && hasMore && (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="mt-6 text-gray-600 dark:text-gray-300">
            No orders found for the selected range.
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <OrderCreateModal
          onClose={() => setShowCreate(false)}
          onCreate={async (order: Partial<Order>) => {
            setLoading(true);
            setError(null);
            try {
              // Remove orderNumber if present
              const { orderNumber, ...payload } = order;
              const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to create order");
              // Add created order to state and open edit modal
              const newOrder = { ...data.order, orderTime: new Date(data.order.orderTime) };
              // Check if order already exists to prevent duplicates
              setOrders(prevOrders => {
                const exists = prevOrders.some(o => o.orderNumber === newOrder.orderNumber);
                return exists ? prevOrders : [newOrder, ...prevOrders];
              });
              setShowCreate(false);
              setEditOrder(newOrder);
              setShowEdit(true);
            } catch (e: any) {
              setError(e.message || "Failed to create order");
            } finally {
              setLoading(false);
            }
          }}
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          totalOrders={orders.length}
        />
      )}

      {showEdit && editOrder && (
        <OrderEditModal
          order={editOrder}
          onClose={() => setShowEdit(false)}
          onSave={async (updatedOrder) => {
            setLoading(true);
            setError(null);
            console.log('Saving order:', updatedOrder);
            try {
              const res = await fetch(`/api/orders`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedOrder),
              });
              const data = await res.json();
              console.log('API response:', data);
              if (!res.ok) throw new Error(data.error || "Failed to update order");
              const updated: Order = {
                ...data.order,
                orderTime: new Date(data.order.orderTime)
              };
              setOrders(
                orders.map((o) =>
                  o.orderNumber === updated.orderNumber ? updated : o
                )
              );
              setShowEdit(false);
            } catch (e: any) {
              console.error('Update error:', e);
              setError(e.message || "Failed to update order");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {deleteOrderNum && (
        <DeleteConfirmModal
          orderNumber={deleteOrderNum}
          onClose={() => setDeleteOrderNum(null)}
          onConfirm={(num: string) => {
            setOrders(orders.filter((o) => o.orderNumber !== num));
            setDeleteOrderNum(null);
          }}
        />
      )}
    </div>
  );
}
