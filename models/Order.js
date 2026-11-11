import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: "" },
  providerId: { type: String, required: true },
  providerName: { type: String, required: true },
  providerPhone: { type: String, default: "" },
  providerEmail: { type: String, default: "" },
  serviceName: { type: String, required: true },
  workDescription: { type: String, required: true },
  address: { type: String, required: true },
  instructions: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'cash' },
  paymentStatus: { type: String, default: 'pending' },
  scheduledDate: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelledBy: { type: String },
  isActive: { type: Boolean, default: true }
});

// Indexes for faster queries
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ providerId: 1, status: 1 });
OrderSchema.index({ orderId: 1 }, { unique: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);