# Premium Features Integration Example

## Quick Integration Guide

This guide shows you how to add the Premium Dashboard to your existing DEVA app.

## Step 1: Add Premium Route to App.js

Add these state variables to your App.js:

```javascript
// Add to your existing state declarations in App.js
const [showPremiumDashboard, setShowPremiumDashboard] = useState(false);
```

## Step 2: Import Premium Components

Add these imports at the top of App.js:

```javascript
import PremiumDashboard from './components/premium/PremiumDashboard';
```

## Step 3: Add Hash Change Handler

Update your existing `handleHashChange` function to include premium route:

```javascript
useEffect(() => {
  const handleHashChange = () => {
    const hash = window.location.hash;
    console.log('[App] Hash changed:', hash);
    
    if (hash === '#advanced-concepts') {
      setShowAdvancedConcepts(true);
      setShowRoadmapCanvas(false);
      setShowPremiumDashboard(false);
    } else if (hash === '#roadmap') {
      setShowRoadmapCanvas(true);
      setShowAdvancedConcepts(false);
      setShowPremiumDashboard(false);
    } else if (hash === '#premium') {
      setShowPremiumDashboard(true);
      setShowAdvancedConcepts(false);
      setShowRoadmapCanvas(false);
    } else if (hash === '#dashboard' || hash === '') {
      setShowAdvancedConcepts(false);
      setShowRoadmapCanvas(false);
      setShowPremiumDashboard(false);
    }
  };

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // Check on mount

  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);
```

## Step 4: Add Premium Dashboard Render Logic

Add this before your final `return null;` in App.js:

```javascript
// Show Premium Dashboard
if (showPremiumDashboard) {
  return (
    <>
      <Navigation 
        currentUser={currentUser} 
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage="premium"
      />
      <PremiumDashboard
        isPremium={isPro}
        onUpgradeClick={() => setShowPricingModal(true)}
      />
      <AIChatWidget />
    </>
  );
}
```

## Step 5: Update Navigation Component

Add a Premium link to your Navigation component. Open `src/components/Navigation.jsx` and add:

```javascript
// Add this to your navigation links
<button
  className={`nav-link ${currentPage === 'premium' ? 'active' : ''}`}
  onClick={() => window.location.hash = 'premium'}
>
  ⭐ Premium
</button>
```

## Step 6: Update Dashboard Component

Add a Premium card to your Dashboard. Open `src/components/Dashboard.jsx` and add:

```javascript
// Add this card to your dashboard grid
<div 
  className="dashboard-card premium-card"
  onClick={() => window.location.hash = 'premium'}
  style={{ cursor: 'pointer' }}
>
  <div className="card-header">
    <h3>⭐ Premium Features</h3>
    {!isPro && <span className="pro-badge">Upgrade</span>}
  </div>
  <p>Access exclusive tools and resources</p>
  <ul>
    <li>📚 Executive Library</li>
    <li>🎤 Interview Lab</li>
    <li>💰 Salary Insights</li>
    <li>🤖 AI Mentor</li>
  </ul>
  <button className="btn-primary">
    {isPro ? 'Explore Premium →' : 'Upgrade Now →'}
  </button>
</div>
```

## Step 7: Test the Integration

1. Start your app:
```bash
npm start
```

2. Navigate to: `http://localhost:3000/#premium`

3. You should see the Premium Dashboard with:
   - Sidebar navigation
   - Overview page with stats
   - Book Library (functional)
   - Coming Soon features (locked)

## Step 8: Backend Integration (Optional)

To check real premium status from your backend, add this endpoint:

```python
# In your backend/app/routes/user.py

@router.get("/premium-status")
async def get_premium_status(current_user: dict = Depends(get_current_user)):
    """Check if user has active premium subscription"""
    # Query your premium_subscriptions table
    subscription = db.query(PremiumSubscription).filter(
        PremiumSubscription.user_id == current_user['id'],
        PremiumSubscription.status == 'active',
        PremiumSubscription.end_date > datetime.now()
    ).first()
    
    return {
        "isPremium": subscription is not None,
        "plan": subscription.plan_type if subscription else None,
        "expiresAt": subscription.end_date if subscription else None
    }
```

Then update your App.js to fetch premium status:

```javascript
// Add this function
const checkPremiumStatus = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) return;
  
  try {
    const response = await fetch('/api/user/premium-status', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    setIsPro(data.isPremium);
    localStorage.setItem('isPro', data.isPremium);
  } catch (err) {
    console.error('Failed to check premium status:', err);
  }
};

// Call it after authentication
useEffect(() => {
  if (isAuthenticated) {
    checkPremiumStatus();
  }
}, [isAuthenticated]);
```

## Testing Checklist

- [ ] Premium link appears in navigation
- [ ] Clicking Premium link navigates to `#premium`
- [ ] Premium Dashboard loads with sidebar
- [ ] Overview page shows stats and features
- [ ] Book Library is accessible
- [ ] Non-premium users see lock icons
- [ ] Upgrade button opens pricing modal
- [ ] Coming Soon badges appear on unavailable features
- [ ] Responsive design works on mobile

## Quick Demo Mode

To test premium features without payment integration:

```javascript
// In App.js, temporarily set:
const [isPro, setIsPro] = useState(true); // Force premium mode

// Or add a dev toggle:
useEffect(() => {
  if (window.location.search.includes('demo=premium')) {
    setIsPro(true);
  }
}, []);

// Then visit: http://localhost:3000/#premium?demo=premium
```

## Troubleshooting

### Premium Dashboard not showing
- Check console for errors
- Verify imports are correct
- Ensure hash change handler is working

### Book Library shows locks even when premium
- Check `isPro` state value
- Verify `isPremium` prop is passed correctly
- Check localStorage for 'isPro' value

### Styling issues
- Ensure CSS files are imported
- Check for conflicting styles
- Verify CSS variables are defined in DesignSystem.css

### Navigation not updating
- Check `currentPage` prop in Navigation
- Verify hash change listener is attached
- Check browser console for errors

## Next Steps

1. **Add More Books**: Edit `BookLibrary.jsx` and add more books to the `sampleBooks` array
2. **Implement Resume Architect**: Follow the guide in `PREMIUM_FEATURES_GUIDE.md`
3. **Add Salary Heatmaps**: Integrate with salary APIs
4. **Build Interview Lab**: Add video recording and AI feedback
5. **Create Shadow Mentor**: Implement persistent AI assistant

## Support

For questions or issues:
1. Check the main guide: `docs/PREMIUM_FEATURES_GUIDE.md`
2. Review component files for inline documentation
3. Test with `isPremium={true}` to see full functionality

---

**Last Updated**: April 22, 2026
**Integration Time**: ~30 minutes
**Difficulty**: Easy
