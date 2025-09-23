"use client";
import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  orderNumber: string;
  onClose: () => void;
  onConfirm: (orderNumber: string) => void;
}

export default function DeleteConfirmModal({ orderNumber, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete order <span className="font-bold">#{orderNumber}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(orderNumber)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
