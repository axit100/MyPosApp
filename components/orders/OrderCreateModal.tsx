"use client";
import { useState } from "react";
import { X, Plus, User, Phone, Hash, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

type NewOrder = {
  customerName: string;
  customerPhone: string;
  tableNumber: string;
};

type Props = {
  onClose: () => void;
  onCreate: (order: any) => void;
  newOrder: NewOrder;
  setNewOrder: (order: NewOrder) => void;
  totalOrders: number;
};

export default function OrderCreateModal({ 
  onClose, 
  onCreate, 
  newOrder, 
  setNewOrder, 
  totalOrders 
}: Props) {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newOrder.tableNumber.trim()) {
      errors.tableNumber = "Table number is required";
    }
    
    // Validate mobile number format if provided
    if (newOrder.customerPhone.trim()) {
      const phoneNumber = newOrder.customerPhone.replace(/[\s\-\(\)]/g, ''); // Remove formatting
      
      // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        errors.customerPhone = "Please enter a valid 10-digit mobile number";
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderNum = `${totalOrders + 1}-${format(new Date(), "ddMMyyyy")}`;
      await onCreate({ 
        ...newOrder, 
        orderNumber: orderNum, 
        orderTime: new Date(),
        status: "Pending",
        items: [],
        discount: 0
      });
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as XXX-XXX-XXXX for display
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    
    return limited;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setNewOrder({ ...newOrder, customerPhone: formattedPhone });
    clearError("customerPhone");
  };

  const clearError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const currentTime = format(new Date(), "PPp");
  const orderNumber = `${totalOrders + 1}-${format(new Date(), "ddMMyyyy")}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Order
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order #{orderNumber}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Order Info */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{format(new Date(), "HH:mm")}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4" />
              Customer Name
              <span className="text-xs text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={newOrder.customerName}
              maxLength={50}
              onChange={(e) => {
                setNewOrder({ ...newOrder, customerName: e.target.value });
                clearError("customerName");
              }}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.customerName 
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            />
            <div className="flex justify-between items-center">
              {validationErrors.customerName && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {validationErrors.customerName}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {newOrder.customerName.length}/50
              </p>
            </div>
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4" />
              Customer Phone
              <span className="text-xs text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={newOrder.customerPhone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.customerPhone 
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            />
            <div className="flex justify-between items-center">
              {validationErrors.customerPhone && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {validationErrors.customerPhone}
                </p>
              )}
              {!validationErrors.customerPhone && newOrder.customerPhone && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-4 h-4 text-green-500">✓</span>
                  Valid mobile number
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {newOrder.customerPhone.replace(/\D/g, '').length}/10
              </p>
            </div>
          </div>

          {/* Table Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Hash className="w-4 h-4" />
              Table Number *
            </label>
            <input
              type="text"
              placeholder="Enter table number"
              value={newOrder.tableNumber}
              maxLength={10}
              onChange={(e) => {
                setNewOrder({ ...newOrder, tableNumber: e.target.value });
                clearError("tableNumber");
              }}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.tableNumber 
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            />
            <div className="flex justify-between items-center">
              {validationErrors.tableNumber && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {validationErrors.tableNumber}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {newOrder.tableNumber.length}/10
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Order Summary
            </h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <p><span className="font-medium">Order Number:</span> #{orderNumber}</p>
              <p><span className="font-medium">Customer:</span> {newOrder.customerName || "Walk-in customer"}</p>
              <p><span className="font-medium">Table:</span> {newOrder.tableNumber || "Not specified"}</p>
              <p><span className="font-medium">Time:</span> {currentTime}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            You can add items to this order after creation
          </p>
        </div>
      </div>
    </div>
  );
}