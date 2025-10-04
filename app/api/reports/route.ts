import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Order from '@/models/Order';
import CashNote from '@/models/CashNote';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7days';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range with max 1 year limit
    let fromDate: Date;
    let toDate: Date;
    
    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
      
      // Enforce maximum 1 year range
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (fromDate < oneYearAgo) {
        fromDate = oneYearAgo;
      }
    } else {
      toDate = new Date();
      
      switch (dateRange) {
        case 'today':
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0); // Start of today
          toDate = new Date();
          toDate.setHours(23, 59, 59, 999); // End of today
          break;
        case '7days':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case '30days':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 30);
          break;
        case '90days':
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 90);
          break;
        case '6months':
          fromDate = new Date();
          fromDate.setMonth(fromDate.getMonth() - 6);
          break;
        case '1year':
          fromDate = new Date();
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        default:
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 7);
      }
    }

    // Fetch Orders Data
    const orders = await Order.find({
      orderTime: {
        $gte: fromDate,
        $lte: toDate
      }
    }).sort({ orderTime: -1 });

    // Fetch Cash Notes Data
    const cashNotes = await CashNote.find({
      date: {
        $gte: fromDate,
        $lte: toDate
      }
    }).sort({ date: -1 });

    // Calculate daily sales with profit/loss
    const dailySalesMap = new Map<string, {
      date: string;
      revenue: number;
      orders: number;
      credits: number;
      debits: number;
      netProfit: number;
    }>();

    // Process orders
    orders.forEach(order => {
      const dateKey = order.orderTime.toISOString().split('T')[0];
      
      if (!dailySalesMap.has(dateKey)) {
        dailySalesMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          orders: 0,
          credits: 0,
          debits: 0,
          netProfit: 0
        });
      }
      
      const dayData = dailySalesMap.get(dateKey)!;
      dayData.revenue += order.finalAmount;
      dayData.orders += 1;
    });

    // Process cash notes
    cashNotes.forEach(note => {
      const dateKey = note.date.toISOString().split('T')[0];
      
      if (!dailySalesMap.has(dateKey)) {
        dailySalesMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          orders: 0,
          credits: 0,
          debits: 0,
          netProfit: 0
        });
      }
      
      const dayData = dailySalesMap.get(dateKey)!;
      
      if (note.type === 'credit') {
        dayData.credits += note.amount;
      } else {
        dayData.debits += note.amount;
      }
    });

    // Calculate net profit for each day
    const dailySales = Array.from(dailySalesMap.values()).map(day => ({
      ...day,
      netProfit: day.revenue + day.credits - day.debits
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate top selling items
    const itemSalesMap = new Map<string, { quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach((item: { name: string; quantity: number; price: number }) => {
        if (!itemSalesMap.has(item.name)) {
          itemSalesMap.set(item.name, { quantity: 0, revenue: 0 });
        }
        const itemData = itemSalesMap.get(item.name)!;
        itemData.quantity += item.quantity;
        itemData.revenue += item.price * item.quantity;
      });
    });

    const topItems = Array.from(itemSalesMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate summary
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalOrders = orders.length;
    const totalCredits = cashNotes
      .filter(note => note.type === 'credit')
      .reduce((sum, note) => sum + note.amount, 0);
    const totalDebits = cashNotes
      .filter(note => note.type === 'debit')
      .reduce((sum, note) => sum + note.amount, 0);
    
    const netProfit = totalRevenue + totalCredits - totalDebits;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const topSellingItem = topItems.length > 0 ? topItems[0].name : 'No data';

    // Calculate growth percentages (compare with previous period)
    const previousFromDate = new Date(fromDate);
    const rangeDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    previousFromDate.setDate(previousFromDate.getDate() - rangeDays);

    const previousOrders = await Order.find({
      orderTime: {
        $gte: previousFromDate,
        $lt: fromDate
      }
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.finalAmount, 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : '0';

    const ordersGrowth = previousOrders.length > 0 
      ? (((totalOrders - previousOrders.length) / previousOrders.length) * 100).toFixed(1)
      : '0';

    // Cash flow breakdown
    const cashFlow = {
      totalCredits,
      totalDebits,
      netCashFlow: totalCredits - totalDebits,
      creditTransactions: cashNotes.filter(note => note.type === 'credit').length,
      debitTransactions: cashNotes.filter(note => note.type === 'debit').length
    };

    // Recent cash notes for detailed view
    const recentCashNotes = cashNotes.slice(0, 10);

    const reportData = {
      dailySales,
      topItems,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topSellingItem,
        netProfit,
        revenueGrowth: parseFloat(revenueGrowth),
        ordersGrowth: parseFloat(ordersGrowth),
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'
      },
      cashFlow,
      recentCashNotes,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        days: rangeDays
      }
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}