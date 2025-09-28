"use client";
import { useState, useEffect } from "react";
import { X, Plus, Minus, Save, Trash, Filter, Search } from "lucide-react";

type Item = {
  id: string;
  name: string;
  price: number;
  icon?: string;
  mainCategoryId?: string;
};

type Order = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  orderType: 'Dining' | 'Parcel';
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: "Paid" | "Pending" | "Waiting";
  paymentStatus: string;
  notes?: string;
  items: Array<{ item?: Item; name?: string; quantity: number; price?: number }>;
  orderTime?: Date;
};

type Props = Readonly<{  
  order: Order;  
  onClose: () => void;  
  onSave: (updated: Order) => void;  
}>;

// Remove static itemsList, use subcategories from DB
type SubCategoryItem = {
  id: string;
  name: string;
  price: number;
  icon?: string;
  mainCategoryId?: string;
};

export default function OrderEditModal({ order, onClose, onSave }: Props) {
  // Dynamic categories for filter
  const [subCategoryItems, setSubCategoryItems] = useState<SubCategoryItem[]>([]);
  useEffect(() => {
    async function fetchSubCategoryItems() {
      try {
        const res = await fetch('/api/subcategories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSubCategoryItems(
            data.data.map((item: any) => ({
              id: item._id,
              name: item.name,
              price: item.price,
              icon: item.icon || '🍽️',
              mainCategoryId: item.mainCategoryId?._id || item.mainCategoryId,
            }))
          );
        }
      } catch (e) {
        setSubCategoryItems([]);
      }
    }
    fetchSubCategoryItems();
  }, []);
  // ...existing code...
  // Dynamic categories for filter
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?status=active');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data.map((cat: any) => ({ _id: cat._id, name: cat.name })));
        }
      } catch (e) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);
  const [activeTab, setActiveTab] = useState<"items" | "customer">("items");
  // Track edited order and type
  const [editOrder, setEditOrder] = useState<Order>(order);
  const [orderType, setOrderType] = useState<'Dining'|'Parcel'>(order.orderType || 'Dining');
  const [editItems, setEditItems] = useState(order.items || []);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch quick order items from API
  const [quickOrderItems, setQuickOrderItems] = useState<Item[]>([]);
  useEffect(() => {
    async function fetchQuickOrderItems() {
      try {
        const res = await fetch('/api/subcategories?showInQuickOrder=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setQuickOrderItems(
            data.data.map((item: any) => ({
              id: item._id,
              name: item.name,
              price: item.price,
              icon: item.icon || '🍽️',
            }))
          );
        }
      } catch (e) {
        setQuickOrderItems([]);
      }
    }
    fetchQuickOrderItems();
  }, []);

  const totalAmount = editItems.reduce(
    (sum, ei) => {
      const price = ei.item?.price || (ei as any).price || 0;
      return sum + price * ei.quantity;
    },
    0
  );
  const finalAmount = totalAmount - (editOrder.discount || 0);

  // Filter subcategory items based on search query and selected category
  const filteredItems = subCategoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesCategory = true;
    if (selectedCategory) {
      matchesCategory = item.mainCategoryId === selectedCategory;
    }
    return matchesSearch && matchesCategory;
  });

  const addItem = (item: Item) => {
    const existingItemIndex = editItems.findIndex(ei => ei.item?.id === item.id);
    if (existingItemIndex >= 0) {
      // If item already exists, increase quantity
      updateQuantity(existingItemIndex, 1);
    } else {
      // If item doesn't exist, add new item
      setEditItems([...editItems, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (idx: number, change: number) => {
    setEditItems(
      editItems.map((ei, i) =>
        i === idx
          ? { ...ei, quantity: Math.max(1, ei.quantity + change) }
          : ei
      )
    );
  };

  const removeItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const validateCustomerInfo = () => {
    const errors: {[key: string]: string} = {};
    
    // Only validate phone format if it's provided
    if (editOrder.customerPhone.trim() && !/^[0-9+\-\s()]{10,15}$/.test(editOrder.customerPhone.trim())) {
      errors.customerPhone = "Please enter a valid phone number";
    }
    
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateCustomerInfo();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setActiveTab("customer"); // Switch to customer tab if there are validation errors
      return;
    }
    
    // Normalize items to database format
    const normalizedItems = editItems.map(orderItem => {
      if (orderItem.item) {
        // UI format: { item: Item, quantity: number }
        return {
          name: orderItem.item.name,
          quantity: orderItem.quantity,
          price: orderItem.item.price
        };
      } else {
        // Already in database format: { name: string, quantity: number, price: number }
        return {
          name: (orderItem as any).name,
          quantity: orderItem.quantity,
          price: (orderItem as any).price
        };
      }
    });
    
    onSave({
      ...editOrder,
      orderType,
      items: normalizedItems,
      totalAmount,
      finalAmount,
    });
  };

  const resetSearchAndFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full  min-h-[400px] max-h-[90vh] flex flex-col transition-all my-auto">
        {/* Header - Fixed */}
        <div className="flex justify-between items-start p-4 md:p-6 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 rounded-t-xl">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Edit Order #{order.orderNumber}
            </h2>
            <span className="text-xs md:text-sm text-gray-500 block mt-1">
              {order.orderTime?.toLocaleString()} | Table {order.tableNumber}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 flex-shrink-0 bg-white dark:bg-gray-800">
          <button
            className={`flex-1 py-2 md:py-3 text-center text-sm md:text-base ${
              activeTab === "items"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("items")}
          >
            Manage Items
          </button>
          <button
            className={`flex-1 py-2 md:py-3 text-center text-sm md:text-base ${
              activeTab === "customer"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("customer")}
          >
            Manage Customer
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "items" && (
            <div>
              {/* Items Title */}
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Order Items
              </h3>

                {/* Quick Add Items (showInQuickOrder) */}
                {quickOrderItems.length > 0 && (
                  <div className="mb-4">
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Add</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-auto max-h-40 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {quickOrderItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addItem(item)}
                          className="flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-2 shadow hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors min-w-[120px] min-h-[48px]"
                          style={{ cursor: 'pointer' }}
                        >
                          <span className=" mr-1 flex-shrink-0">{item.icon}</span>
                          <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex-1 text-left whitespace-normal break-words">{item.name}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">₹{item.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quick Add */}
              <div className="mb-4 flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                 
                </span>
                <button
                  onClick={() => setShowSearchPopup(true)}
                  className="flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4" /> Search & Filter
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-60 md:max-h-80 overflow-y-auto">
                {editItems.map((orderItem, idx) => {
                  const item = orderItem.item;
                  const name = item?.name || (orderItem as any).name || 'Unknown Item';
                  const price = item?.price || (orderItem as any).price || 0;
                  const icon = item?.icon || '🍽️';
                  const quantity = orderItem.quantity;
                  // Create a stable unique key based on item properties and position
                  const uniqueKey = `${name.replace(/\s+/g, '-')}-${price}-${idx}`;
                  
                  return (
                  <div
                    key={uniqueKey}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow gap-2"
                  >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <span className="text-xl md:text-2xl flex-shrink-0">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base">{name}</p>
                        <p className="text-xs md:text-sm text-gray-500">₹{price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="px-1.5 py-1 md:px-2 bg-gray-200 dark:bg-gray-600 rounded text-sm"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      <span className="text-sm md:text-base min-w-[2rem] text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="px-1.5 py-1 md:px-2 bg-gray-200 dark:bg-gray-600 rounded text-sm"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                    <span className="w-12 md:w-16 text-right font-semibold text-sm md:text-base flex-shrink-0">
                      ₹{price * quantity}
                    </span>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-500 flex-shrink-0"
                    >
                      <Trash className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                  );
                })}
                {editItems.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No items added</p>
                )}
              </div>

              {/* Totals (no inputs) */}

                {/* Totals and Discount Input */}
                <div className="flex flex-col gap-1 text-right text-gray-800 dark:text-gray-200">
                  <p>Total Amount: ₹{totalAmount}</p>
                  <div className="flex items-center justify-end gap-2">
                    <label htmlFor="discount" className="text-sm font-medium">Discount:</label>
                    <input
                      id="discount"
                      type="number"
                      min={0}
                      max={totalAmount}
                      value={editOrder.discount || 0}
                      onChange={e => {
                        const val = Math.max(0, Math.min(Number(e.target.value), totalAmount));
                        setEditOrder({ ...editOrder, discount: val });
                      }}
                      className="border rounded px-2 py-1 w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                  </div>
                  <p className="font-bold">Final Amount: ₹{finalAmount}</p>
                </div>

              {/* Notes moved here */}
              <div className="mt-4">
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </p>
                <textarea
                  value={editOrder.notes || ""}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, notes: e.target.value })
                  }
                  className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
          )}

          {activeTab === "customer" && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Order Type */}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Type</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${orderType === 'Dining' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => {
                    setOrderType('Dining');
                    setValidationErrors({});
                    setEditOrder({...editOrder, orderType: 'Dining', status: 'Pending'});
                  }}
                >Dining</button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${orderType === 'Parcel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => {
                    setOrderType('Parcel');
                    setValidationErrors({});
                    setEditOrder({...editOrder, orderType: 'Parcel', status: 'Paid'});
                  }}
                >Parcel</button>
              </div>
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={editOrder.customerName}
                  onChange={(e) => {
                    setEditOrder({ ...editOrder, customerName: e.target.value });
                    if (validationErrors.customerName) {
                      setValidationErrors({...validationErrors, customerName: ""});
                    }
                  }}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.customerName 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter customer name (optional)"
                />
                {validationErrors.customerName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.customerName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Phone
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={editOrder.customerPhone}
                  onChange={(e) => {
                    setEditOrder({ ...editOrder, customerPhone: e.target.value });
                    if (validationErrors.customerPhone) {
                      setValidationErrors({...validationErrors, customerPhone: ""});
                    }
                  }}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.customerPhone 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter phone number (optional)"
                />
                {validationErrors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.customerPhone}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Table Number
                </label>
                <input
                  id="tableNumber"
                  type="text"
                  value={editOrder.tableNumber}
                  onChange={(e) => {
                    setEditOrder({ ...editOrder, tableNumber: e.target.value });
                    if (validationErrors.tableNumber) {
                      setValidationErrors({...validationErrors, tableNumber: ""});
                    }
                  }}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.tableNumber 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter table number"
                />
                {validationErrors.tableNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.tableNumber}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </p>
                <div className="flex gap-2 mt-1">
                  {(['Pending','Paid','Waiting'] as Order['status'][]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`px-3 py-1 rounded-lg font-medium ${
                        editOrder.status === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setEditOrder({ ...editOrder, status: s })}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end gap-2 p-4 md:p-6 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-3 md:px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm md:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Search Popup */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search & Filter Items
              </h3>
              <button 
                onClick={() => {
                  setShowSearchPopup(false);
                  resetSearchAndFilters();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dynamic Category Filter Options */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                  selectedCategory === ""
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(selectedCategory === cat._id ? "" : cat._id)}
                  className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                    selectedCategory === cat._id
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </div>

            {/* Full Item List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      addItem(item);
                      setShowSearchPopup(false);
                      resetSearchAndFilters();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ₹{item.price}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items found</p>
                  <p className="text-sm">Try adjusting your search or filter</p>
                </div>
              )}
            </div>

            {/* Clear filters button */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-4 text-center">
                <button
                  onClick={resetSearchAndFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}