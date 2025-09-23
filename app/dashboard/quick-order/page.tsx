"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, User, Clock, Edit, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import DashboardHeader from "@/components/DashboardHeader";
import QuickOrderEditModal from "@/components/orders/QuickOrderEditModal";

type QuickItem = {
  id: number | string;
  name: string;
  price: number;
  category: string;
};

type CartItem = {
  item: QuickItem;
  quantity: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  status: "Paid" | "Pending" | "Waiting";
  orderTime: Date;
  notes?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
};

type DateRange = "today" | "week" | "month" | "custom";

export default function QuickOrderPage() {
  // State management
  const [quickItems, setQuickItems] = useState<QuickItem[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Date filter states
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const ranges = ["today", "week", "month", "custom"] as const;
  const rangeLabels: Record<DateRange, string> = {
    today: "Today",
    week: "This Week", 
    month: "This Month",
    custom: "Custom Range",
  };

  // Fetch subcategory items from API
  useEffect(() => {
    fetchSubcategoryItems();
  }, []);

  // Fetch orders when date range changes
  useEffect(() => {
    fetchOrders();
  }, [dateRange, customStart, customEnd]);

  const fetchSubcategoryItems = async () => {
    try {
      setItemsLoading(true);
      const res = await fetch("/api/subcategories?status=active", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load items");
      }
      const data = await res.json();
      
      // Convert subcategories to quick items format
      const items: QuickItem[] = (data.data || []).slice(0, 10).map((subcat: any) => ({
        id: subcat._id,
        name: subcat.name,
        price: subcat.price,
        category: subcat.mainCategoryId?.name || "Food"
      }));
      
      setQuickItems(items);
    } catch (e: any) {
      setError(e.message || "Failed to load items");
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ dateRange });
      if (dateRange === "custom" && customStart && customEnd) {
        params.set("start", customStart);
        params.set("end", customEnd);
      }
      const res = await fetch(`/api/orders?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load orders");
      }
      const data = await res.json();
      const fetched: Order[] = (data.orders || []).map((o: any) => ({
        ...o,
        orderTime: new Date(o.orderTime),
        items: Array.isArray(o.items) ? o.items : [],
      }));
      setTodayOrders(fetched);
    } catch (e: any) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Cart management
  const addToCart = (item: QuickItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: number | string, change: number) => {
    setCart(prev => {
      return prev.map(cartItem => {
        if (cartItem.item.id === itemId) {
          const newQuantity = cartItem.quantity + change;
          return newQuantity > 0 ? { ...cartItem, quantity: newQuantity } : cartItem;
        }
        return cartItem;
      }).filter(cartItem => cartItem.quantity > 0);
    });
  };

  const removeFromCart = (itemId: number | string) => {
    setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
  };

  // Calculate totals
  const totalAmount = cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
  const discount = 0; // Can be added later
  const finalAmount = totalAmount - discount;

  // Submit order
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert("Please add items to cart before submitting order");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: "",
        tableNumber: "Counter",
        totalAmount,
        discount,
        finalAmount,
        paymentStatus: "Paid", // Default to Paid
        status: "Paid" as const, // Default status to Paid
        orderTime: new Date(),
        notes: "Quick Order",
        items: cart.map(cartItem => ({
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price
        }))
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      // Reset form and refresh orders
      setCart([]);
      setCustomerName("");
      setShowCreateOrder(false);
      await fetchOrders();
      
      alert(`Order created successfully! Order Number: ${data.order.orderNumber}`);
    } catch (e: any) {
      setError(e.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowEditOrder(true);
  };

  const handleSaveEditedOrder = async (updatedOrder: Order) => {
    try {
      setLoading(true);
      
      // Make API call to update the order
      const res = await fetch(`/api/orders/${updatedOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          tableNumber: updatedOrder.tableNumber,
          totalAmount: updatedOrder.totalAmount,
          discount: updatedOrder.discount,
          finalAmount: updatedOrder.finalAmount,
          paymentStatus: updatedOrder.paymentStatus,
          status: updatedOrder.status,
          notes: updatedOrder.notes,
          items: updatedOrder.items,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order');
      }

      const data = await res.json();
      
      // Update local state with the response from server
      setTodayOrders(prev => 
        prev.map(order => 
          order._id === updatedOrder._id ? { ...data.order, orderTime: new Date(data.order.orderTime) } : order
        )
      );
      
      setShowEditOrder(false);
      setEditingOrder(null);
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      setError(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  // Print order receipt
  const handlePrintOrder = (order: Order) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">Restaurant Name</h2>
          <p style="margin: 5px 0;">Food & Beverages</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Order #: ${order.orderNumber}</strong><br>
          <strong>Customer: ${order.customerName || 'Walk-in Customer'}</strong><br>
          <strong>Date: ${format(order.orderTime, 'dd/MM/yyyy')}</strong><br>
          <strong>Time: ${format(order.orderTime, 'HH:mm')}</strong>
        </div>
        
        <div style="border-bottom: 1px solid #ccc; margin-bottom: 10px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #ccc;">
                <th style="text-align: left; padding: 5px;">Item</th>
                <th style="text-align: center; padding: 5px;">Qty</th>
                <th style="text-align: right; padding: 5px;">Price</th>
                <th style="text-align: right; padding: 5px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 3px 5px;">${item.name}</td>
                  <td style="text-align: center; padding: 3px 5px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 3px 5px;">₹${item.price}</td>
                  <td style="text-align: right; padding: 3px 5px;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="text-align: right; margin-top: 10px;">
          <div><strong>Subtotal: ₹${order.totalAmount}</strong></div>
          <div>Discount: ₹${order.discount}</div>
          <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
            <strong>Total: ₹${order.finalAmount}</strong>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Status: ${order.status}</p>
          <p>Thank you for your order!</p>
          <p>Visit again!</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Receipt - ${order.orderNumber}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 0.5in; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Delete order function
  const handleDeleteOrder = async (order: Order) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete order #${order.orderNumber}?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete order');
      }

      // Remove order from local state
      setTodayOrders(prev => prev.filter(o => o._id !== order._id));
      alert('Order deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      setError(error.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <DashboardHeader title="Quick Order" showBackButton={true} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quick Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Fast ordering for your menu items
            </p>
          </div>
          <button
            onClick={() => setShowCreateOrder(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Order
          </button>
        </div>

        {/* Date Filters */}
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

        {/* Orders Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {todayOrders.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ₹{todayOrders.reduce((sum, order) => sum + order.finalAmount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Paid Orders</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {todayOrders.filter(order => order.status === "Paid").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Orders ({dateRange === "today" ? "Today" : rangeLabels[dateRange]})
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 text-gray-600 dark:text-gray-300">Loading orders...</div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {todayOrders.map((order) => {
              const getStatusColor = (status: string) => {
                if (status === "Paid") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                if (status === "Pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
              };
              
              return (
                <div
                  key={order.orderNumber}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      #{order.orderNumber}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        title="Print Order"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {order.customerName || "Walk-in Customer"}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    ₹{order.finalAmount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {format(order.orderTime, "MMM dd, yyyy HH:mm")}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.items.length} item(s): {order.items.slice(0, 2).map(item => item.name).join(", ")}
                      {order.items.length > 2 && "..."}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {!loading && !error && todayOrders.length === 0 && (
            <div className="text-center text-gray-600 dark:text-gray-300 py-8">
              No orders found for the selected date range. Create your first quick order!
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create Quick Order
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select items and quantities for fast ordering
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateOrder(false);
                    setCart([]);
                    setCustomerName("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Items Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Items
                  </h3>
                  {itemsLoading ? (
                    <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                      Loading items...
                    </div>
                  ) : quickItems.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                      No items available. Please add subcategory items first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {quickItems.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.category}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              ₹{item.price}
                            </span>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart and Order Details */}
                <div>
                  <div className="mb-4">
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Name (Optional)
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Order Cart ({cart.length} items)
                  </h3>
                  
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {cartItem.item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ₹{cartItem.item.price} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, -1)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, 1)}
                            className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(cartItem.item.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {cart.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No items in cart. Add items from the left panel.
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  {cart.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal:</span>
                          <span>₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Discount:</span>
                          <span>₹{discount}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                          <span>Total:</span>
                          <span>₹{finalAmount}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={handleSubmitOrder}
                          disabled={submitting || cart.length === 0}
                          className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Create Order
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (cart.length === 0) {
                              alert("Please add items to cart before printing");
                              return;
                            }
                            const tempOrder: Order = {
                              _id: "temp-preview-id",
                              orderNumber: "PREVIEW",
                              customerName: customerName.trim() || "Walk-in Customer",
                              customerPhone: "",
                              tableNumber: "Counter",
                              totalAmount,
                              discount,
                              finalAmount,
                              paymentStatus: "Paid",
                              status: "Paid",
                              orderTime: new Date(),
                              notes: "Quick Order",
                              items: cart.map(cartItem => ({
                                name: cartItem.item.name,
                                quantity: cartItem.quantity,
                                price: cartItem.item.price
                              }))
                            };
                            handlePrintOrder(tempOrder);
                          }}
                          disabled={cart.length === 0}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Preview Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrder && editingOrder && (
        <QuickOrderEditModal
          order={editingOrder}
          onClose={() => {
            setShowEditOrder(false);
            setEditingOrder(null);
          }}
          onSave={handleSaveEditedOrder}
          availableItems={quickItems}
        />
      )}
    </div>
  );
}