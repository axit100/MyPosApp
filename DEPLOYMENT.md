# Environment Variables for Vercel Deployment

## Required Environment Variables

Add these environment variables in your Vercel dashboard:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://akshitsompura1011_db_user:qCghtXcOta6katBN@cluster0.yy8fbuv.mongodb.net/dhabha-pos?retryWrites=true&w=majority&appName=Cluster0
```

### 2. JWT Configuration
```
JWT_SECRET=dhabha-pos-super-secret-jwt-key-2024-change-in-production
NEXTAUTH_SECRET=Axit2020
```

### 3. Application Configuration
```
NODE_ENV=production
ORDER_STATUS_LIST=Paid,Pending,Waiting
NEXT_PUBLIC_RESTAURANT_NAME=BAPA SitaRam Paratha House
NEXT_PUBLIC_SYSTEM_NAME=Restaurant Order Management
```

### 4. Vercel Specific (Will be auto-set)
```
NEXTAUTH_URL=https://your-vercel-app-name.vercel.app
```

## Security Notes:
- Change JWT_SECRET to a more secure random string for production
- Consider using a different MongoDB database for production
- Never commit .env.local to version control

## Steps to Add in Vercel:
1. Go to your project dashboard on Vercel
2. Click on "Settings" tab
3. Click on "Environment Variables" 
4. Add each variable with its value
5. Select appropriate environments (Production, Preview, Development)