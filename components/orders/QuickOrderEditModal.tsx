"use client";
import { useState } from "react";
import { X, Plus, Minus, Save, Printer } from "lucide-react";

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

type Props = {
  order: Order;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
  availableItems: QuickItem[];
};

export default function QuickOrderEditModal({ order, onClose, onSave, availableItems }: Props) {
  const [customerName, setCustomerName] = useState(order.customerName || "");
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Convert order items to cart format with proper ID handling
    return order.items.map((item, index) => {
      // Try to find matching item from available items, or create a unique ID
      const matchingItem = availableItems.find(ai => ai.name === item.name);
      return {
        item: {
          id: matchingItem?.id || `existing-${index}-${Date.now()}`, // Unique ID for existing items
          name: item.name,
          price: item.price,
          category: matchingItem?.category || "Food"
        },
        quantity: item.quantity
      };
    });
  });
  const [submitting, setSubmitting] = useState(false);

  // Cart management functions
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
  const discount = order.discount || 0;
  const finalAmount = totalAmount - discount;

  const handleSave = async () => {
    if (cart.length === 0) {
      alert("Please add items to the order");
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrder: Order = {
        ...order,
        customerName: customerName.trim() || "Walk-in Customer",
        totalAmount,
        finalAmount,
        items: cart.map(cartItem => ({
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price
        }))
      };

      onSave(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndPrint = async () => {
    if (cart.length === 0) {
      alert("Please add items to the order");
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrder: Order = {
        ...order,
        customerName: customerName.trim() || "Walk-in Customer",
        totalAmount,
        finalAmount,
        items: cart.map(cartItem => ({
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price
        }))
      };

      // Save first, then print
      onSave(updatedOrder);
      
      // Small delay to ensure save is processed
      setTimeout(() => {
        handlePrint();
      }, 100);
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">Restaurant Name</h2>
          <p style="margin: 5px 0;">Food & Beverages</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Order #: ${order.orderNumber}</strong><br>
          <strong>Customer: ${customerName || 'Walk-in Customer'}</strong><br>
          <strong>Date: ${new Date().toLocaleDateString()}</strong><br>
          <strong>Time: ${new Date().toLocaleTimeString()}</strong>
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
              ${cart.map(item => `
                <tr>
                  <td style="padding: 3px 5px;">${item.item.name}</td>
                  <td style="text-align: center; padding: 3px 5px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 3px 5px;">₹${item.item.price}</td>
                  <td style="text-align: right; padding: 3px 5px;">₹${item.item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="text-align: right; margin-top: 10px;">
          <div><strong>Subtotal: ₹${totalAmount}</strong></div>
          <div>Discount: ₹${discount}</div>
          <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
            <strong>Total: ₹${finalAmount}</strong>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Order #{order.orderNumber}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customer: {order.customerName || 'Walk-in Customer'} | Original Total: ₹{order.finalAmount} | Items: {order.items.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add More Items
              </h3>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {availableItems.map((item) => (
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
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart and Order Details */}
            <div>
              <div className="mb-4">
                <label htmlFor="editCustomerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name
                </label>
                <input
                  id="editCustomerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Order Items ({cart.length} items)
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  - Edit quantities or remove items
                </span>
              </h3>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((cartItem, index) => {
                  const isExistingItem = String(cartItem.item.id).startsWith('existing-');
                  return (
                    <div
                      key={`${cartItem.item.id}-${index}`}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        isExistingItem 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {cartItem.item.name}
                          </h4>
                          {isExistingItem && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                              Original
                            </span>
                          )}
                        </div>
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
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {cart.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No items in order. Add items from the left panel.
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
                      onClick={handleSave}
                      disabled={submitting || cart.length === 0}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSaveAndPrint}
                      disabled={submitting || cart.length === 0}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <Printer className="w-4 h-4" />
                          Save & Print
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}