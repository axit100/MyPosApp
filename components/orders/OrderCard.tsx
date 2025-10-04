"use client";
import { Edit, Trash2, Printer } from "lucide-react";
import { format } from "date-fns";

type Item = {
  id: number;
  name: string;
  price: number;
  icon?: string;
};

type Order = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  finalAmount: number;
  status: "Paid" | "Pending" | "Waiting";
  orderTime: Date;
  items?: Array<{ item: Item; quantity: number }>;
};

type Props = {
  order: Order;
  onEdit: () => void;
  onDelete: () => void;
};

export default function OrderCard({ order, onEdit, onDelete }: Props) {
  let statusClass = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  if (order.status === "Paid") {
    statusClass = "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  } else if (order.status === "Pending") {
    statusClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  }
  const sendTestPrint = async () => {
    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerIp: process.env.NEXT_PUBLIC_PRINTER_IP || '192.168.0.100',
          printerPort: Number(process.env.NEXT_PUBLIC_PRINTER_PORT || 9100)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Print failed');
      alert('Test receipt sent to printer.');
    } catch (e: any) {
      alert('Print error: ' + (e.message || 'Unknown error'));
    }
  };
  // statusClass defined above via if/else

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          #{order.orderNumber}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
          {order.status}
        </span>
      </div>

      <div className="text-gray-700 dark:text-gray-300">
        {order.customerName}
        {order.customerPhone && (
          <span className="ml-2 text-xs text-gray-500">
            ({order.customerPhone})
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Table: <span className="font-medium">{order.tableNumber}</span>
      </div>
      <div className="font-semibold text-gray-900 dark:text-white">
        ₹{order.finalAmount}
      </div>
      <div className="text-xs text-gray-400">
        {format(order.orderTime, "dd MMM yyyy, hh:mm a")}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-blue-600"
        >
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={sendTestPrint}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-green-700"
          title="Print test receipt"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}
