import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.ts';

dotenv.config({ path: '.env.local' });

async function seedOrder() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  
  await mongoose.connect(process.env.MONGODB_URI);

  const orderData = {
    items: [
      {
        name: 'Dahi Tikhari',
        quantity: 2,
        price: 40
      },
      {
        name: 'Chhas',
        quantity: 7,
        price: 10,
        _id: new mongoose.Types.ObjectId('68cea78ce93719e51f0af922')
      }
    ],
    status: 'Pending', // must be 'Paid', 'Pending', or 'Waiting'
    totalAmount: 150,
    discount: 6,
    finalAmount: 144,
    paymentStatus: 'pending',
    customerName: 'gghfgh',
    customerPhone: '4564645645',
    notes: 'ggjghjgh',
    createdBy: new mongoose.Types.ObjectId('68ce3f69b5a9b289c50133af'),
    orderTime: new Date(1758372961282),
    orderNumber: '2-20092025',
  };

  const order = new Order(orderData);
  await order.save();
  console.log('Order seeded:', order);
  await mongoose.disconnect();
}

seedOrder().catch(err => {
  console.error('Error seeding order:', err);
  process.exit(1);
});
