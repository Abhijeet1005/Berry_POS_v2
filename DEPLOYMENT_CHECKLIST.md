# Deployment Checklist - Redis Fix

## ✅ Pre-Deployment

- [x] Fixed `src/services/cacheService.js` - Updated Redis method calls
- [x] Fixed `src/server.js` - Updated Redis connection initialization
- [x] Verified no syntax errors
- [x] Created documentation (REDIS_FIX_SUMMARY.md)

## 📋 Deployment Steps

### 1. Commit Changes

```bash
git add src/services/cacheService.js
git add src/server.js
git add REDIS_FIX_SUMMARY.md
git add DEPLOYMENT_CHECKLIST.md
git commit -m "fix: Redis client method calls and connection initialization"
```

### 2. Push to Repository

```bash
git push origin main
```

### 3. Verify Environment Variables (Render/Production)

Make sure these are set in your hosting platform:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `PORT` - Usually 3000 or auto-assigned

**Optional (for Redis):**
- `REDIS_HOST` - Redis host URL
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (if required)

**Note:** If Redis variables are not set, the app will work without caching.

### 4. Deploy

Your hosting platform (Render, Heroku, etc.) should automatically deploy after push.

### 5. Monitor Logs

After deployment, check logs for:

**Success indicators:**
```
✅ MongoDB connected successfully
✅ Redis connected successfully
✅ Server started in production mode
```

**Or (if Redis not available):**
```
⚠️  Redis connection error
⚠️  Continuing without Redis - some features may be limited
✅ Server started in production mode
```

Both scenarios are OK - the app will work either way.

### 6. Test Endpoints

```bash
# Health check
curl https://your-domain.com/health

# Test API endpoint
curl https://your-domain.com/api/v1/categories

# Check response time (should be fast with Redis, slower without)
```

## 🔍 Troubleshooting

### If you see "redis.get is not a function"

This means the old code is still deployed. Steps:
1. Verify changes are committed and pushed
2. Trigger manual deploy if auto-deploy didn't work
3. Check build logs for errors

### If Redis connection fails

This is OK! The app will continue without caching. To enable Redis:
1. Add Redis service to your hosting platform
2. Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` environment variables
3. Restart the app

### If MongoDB connection fails

This is critical. Check:
1. `MONGODB_URI` environment variable is set correctly
2. MongoDB service is running
3. IP whitelist includes your server's IP (for MongoDB Atlas)
4. Database user has correct permissions

## 📊 Performance Impact

**With Redis (Recommended):**
- ✅ Fast response times (cached data)
- ✅ Reduced database load
- ✅ Better scalability

**Without Redis:**
- ⚠️  Slower response times (no caching)
- ⚠️  Higher database load
- ✅ Still fully functional

## 🎯 Post-Deployment Verification

### 1. Check Server Status
```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T...",
  "uptime": 123.45
}
```

### 2. Test Authentication
```bash
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"Admin123!"}'
```

### 3. Test Caching (if Redis enabled)

First request (cache miss):
```bash
curl https://your-domain.com/api/v1/categories
# Check logs: should see "Cache miss"
```

Second request (cache hit):
```bash
curl https://your-domain.com/api/v1/categories
# Check logs: should see "Cache hit"
# Response should be faster
```

### 4. Monitor Error Logs

Check for any errors in the first 5-10 minutes after deployment.

## ✅ Success Criteria

- [ ] Server starts without errors
- [ ] MongoDB connected
- [ ] Redis connected (or gracefully degraded)
- [ ] Health endpoint responds
- [ ] API endpoints work
- [ ] No "redis.get is not a function" errors
- [ ] Authentication works
- [ ] Orders can be created
- [ ] Payments can be processed

## 🚨 Rollback Plan

If critical issues occur:

### Option 1: Quick Fix
```bash
# Revert the commit
git revert HEAD
git push origin main
```

### Option 2: Previous Version
```bash
# Deploy previous working version
git checkout <previous-commit-hash>
git push origin main --force
```

### Option 3: Disable Redis
Set environment variable:
```
REDIS_HOST=  # Leave empty
```
This will disable Redis and app will work without caching.

## 📞 Support

If issues persist:
1. Check logs in your hosting platform
2. Review REDIS_FIX_SUMMARY.md
3. Verify all environment variables are set
4. Test locally first: `npm start`

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Status:** _____________
**Notes:** _____________
