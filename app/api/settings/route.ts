import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import RestaurantSettings from '@/models/Settings'

export async function GET() {
  try {
    await connectDB()
    
    // Get settings or create default if none exist
    let settings = await RestaurantSettings.findOne()
    
    if (!settings) {
      // Create default settings
      settings = await RestaurantSettings.create({
        restaurantName: 'Dhabha Restaurant',
        address: '123 Main Street, City, State 12345',
        phone: '9876543210',
        email: 'info@dhabha.com',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        taxRate: 18,
        serviceCharge: 10,
        operatingHours: {
          open: '09:00',
          close: '23:00',
          isOpen24Hours: false
        },
        printerSettings: {
          kitchenPrinter: true,
          billPrinter: true
        },
        orderSettings: {
          autoAcceptOrders: true,
          defaultPreparationTime: 15,
          maxOrdersPerTable: 5
        },
        paymentMethods: {
          cash: true,
          card: true,
          upi: true,
          online: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const updates = await request.json()

    // Get existing settings or create new
    let settings = await RestaurantSettings.findOne()

    if (!settings) {
      settings = new RestaurantSettings(updates)
      await settings.save()
    } else {
      // Update existing settings
      Object.assign(settings, updates)
      await settings.save()
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    })
  } catch (error: any) {
    console.error('Settings update error:', error)

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update settings. Please check your input and try again.' },
      { status: 500 }
    )
  }
}
