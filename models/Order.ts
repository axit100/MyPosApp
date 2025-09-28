import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  status: 'Paid' | 'Pending' | 'Waiting';
  tableNumber?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
    orderTime: Date;
    orderType: 'Dining' | 'Parcel';
  orderNumber: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>({
  items: { type: [OrderItemSchema], required: true },
  status: {
    type: String,
    required: true,
    enum: process.env.ORDER_STATUS_LIST
      ? process.env.ORDER_STATUS_LIST.split(',')
      : ['Paid', 'Pending', 'Waiting'],
  },
  tableNumber: { type: String },
  totalAmount: { type: Number, required: true },
  discount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderTime: { type: Date, required: true },
    orderType: { type: String, enum: ['Dining', 'Parcel'], default: 'Dining' },
  orderNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models?.Order || mongoose.model<IOrder>('Order', OrderSchema);
