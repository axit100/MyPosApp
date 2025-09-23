// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
	try {
		// Get user from requireAuth (assume it returns user object)
		const user = await requireAuth(request);
		await connectDB();

		const body = await request.json();
		// Basic validation (expand as needed)
		if (!Array.isArray(body.items)) {
			return NextResponse.json({ error: "Missing required field: items (must be an array)" }, { status: 400 });
		}

		// Auto-generate orderNumber if not provided
		let orderNumber = body.orderNumber;
		if (!orderNumber) {
			orderNumber = await generateUniqueOrderNumber();
		}

		// Create order document
		const orderDoc = new Order({
			orderNumber,
			customerName: body.customerName ?? "",
			customerPhone: body.customerPhone ?? "",
			tableNumber: body.tableNumber ?? "",
			totalAmount: body.totalAmount ?? 0,
			discount: body.discount ?? 0,
			finalAmount: body.finalAmount ?? 0,
			paymentStatus: body.paymentStatus ?? "Pending",
			status: body.status ?? "Pending",
			orderTime: body.orderTime ? new Date(body.orderTime) : new Date(),
			notes: body.notes ?? "",
			items: body.items,
			createdBy: user?._id || user?.id,
		});
		
		try {
			await orderDoc.save();
		} catch (saveError: any) {
			// Handle duplicate orderNumber error with retry
			if (saveError.code === 11000 && saveError.keyPattern?.orderNumber) {
				console.log('Duplicate order number detected, generating new one...');
				orderDoc.orderNumber = await generateUniqueOrderNumber();
				await orderDoc.save();
			} else {
				throw saveError;
			}
		}

		// Return created order (lean shape)
		const created = await Order.findById(orderDoc._id).lean();
		return NextResponse.json({ order: created }, { status: 201 });
	} catch (error: any) {
		console.error("Create order error:", error);
		if (error?.message === "Authentication required" || error?.message === "Insufficient permissions") {
			return NextResponse.json({ error: error.message }, { status: 401 });
		}
		return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
	}
}
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'

// Helper function to generate unique order number
async function generateUniqueOrderNumber(): Promise<string> {
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
	
	// Find all existing order numbers for today
	const existingOrders = await Order.find({ 
		orderNumber: { $regex: `^\\d+-${dateStr}$` } 
	}).select('orderNumber').lean();
	
	// Extract numbers and find the highest
	const existingNumbers = existingOrders
		.map(order => {
			const match = order.orderNumber.match(/^(\d+)-/);
			return match ? parseInt(match[1], 10) : 0;
		})
		.filter(num => !isNaN(num));
	
	let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
	let orderNumber = `${nextNumber}-${dateStr}`;
	
	// Extra safety check: ensure the generated number doesn't already exist
	let attempts = 0;
	while (await Order.findOne({ orderNumber }) && attempts < 50) {
		nextNumber++;
		orderNumber = `${nextNumber}-${dateStr}`;
		attempts++;
	}
	
	return orderNumber;
}

// GET /api/orders - List orders with optional date filters
export async function GET(request: NextRequest) {
	try {
		// Require authentication (no specific permission to keep it simple for listing)
		await requireAuth(request)
		await connectDB()

		const { searchParams } = new URL(request.url)
		const dateRange = searchParams.get('dateRange') || 'today'
		const startParam = searchParams.get('start')
		const endParam = searchParams.get('end')

		const now = new Date()
		let start: Date | undefined
		let end: Date | undefined

		if (dateRange === 'today') {
			start = new Date(now)
			start.setHours(0, 0, 0, 0)
			end = new Date(now)
			end.setHours(23, 59, 59, 999)
		} else if (dateRange === 'week') {
			// Week starts on Monday
			const d = new Date(now)
			const day = (d.getDay() + 6) % 7 // Monday = 0
			start = new Date(d)
			start.setDate(d.getDate() - day)
			start.setHours(0, 0, 0, 0)
			end = new Date(start)
			end.setDate(start.getDate() + 6)
			end.setHours(23, 59, 59, 999)
		} else if (dateRange === 'month') {
			start = new Date(now.getFullYear(), now.getMonth(), 1)
			end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			end.setHours(23, 59, 59, 999)
		} else if (dateRange === 'custom') {
			if (!startParam || !endParam) {
				return NextResponse.json({ error: 'start and end are required for custom range' }, { status: 400 })
			}
			start = new Date(startParam)
			end = new Date(endParam)
			// cap to 1 year max range
			const maxRangeMs = 365 * 24 * 60 * 60 * 1000
			if (end.getTime() - start.getTime() > maxRangeMs) {
				end = new Date(start.getTime() + maxRangeMs)
			}
			end.setHours(23, 59, 59, 999)
		}

		const filter: any = {}
		if (start && end) {
			filter.orderTime = { $gte: start, $lte: end }
		}

		const docs = await Order.find(filter).sort({ orderTime: -1 }).lean()

		// Map to client shape: keep only fields used by UI
		const orders = docs.map((o: any) => ({
			_id: o._id,
			orderNumber: o.orderNumber,
			customerName: o.customerName,
			customerPhone: o.customerPhone,
			tableNumber: o.tableNumber ?? '',
			totalAmount: o.totalAmount,
			discount: o.discount,
			finalAmount: o.finalAmount,
			paymentStatus: o.paymentStatus,
			status: o.status,
			orderTime: o.orderTime,
			notes: o.notes ?? '',
			items: o.items || []
		}))

		return NextResponse.json({ orders })
	} catch (error: any) {
		console.error('List orders error:', error)
		if (error?.message === 'Authentication required' || error?.message === 'Insufficient permissions') {
			return NextResponse.json({ error: error.message }, { status: 401 })
		}
		return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
	}
}
