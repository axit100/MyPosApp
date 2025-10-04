import mongoose, { Document, Schema } from 'mongoose';

export interface ICashNote extends Document {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  createdBy?: mongoose.Types.ObjectId; // Optionally link to User
  createdAt: Date;
  updatedAt: Date;
}

const CashNoteSchema = new Schema<ICashNote>({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.CashNote || mongoose.model<ICashNote>('CashNote', CashNoteSchema);
