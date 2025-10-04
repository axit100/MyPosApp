import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('🔐 Login attempt for:', email)

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    console.log('🔍 Attempting to authenticate user...')
    const user = await authenticateUser(email, password)
    
    if (!user) {
      console.log('❌ Authentication failed for:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.name, user.role, 'Active:', user.isActive)

    // Generate JWT token
    console.log('🎫 Generating JWT token...')
    const token = generateToken(user)
    console.log('✅ Token generated successfully')

    // Create response with user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }

    // Set HTTP-only cookie
    console.log('🍪 Setting auth-token cookie...')
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('✅ Login successful for:', email)
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
