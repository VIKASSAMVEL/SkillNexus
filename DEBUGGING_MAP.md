# SkillsMap Debugging Guide

## Current Issue
Map component is not rendering to the DOM even though:
- ✅ Leaflet library loading successfully
- ✅ Geolocation API working correctly
- ✅ Backend API running on port 5000
- ❌ Map container not visible

## Quick Debug Steps

### 1. Check Browser Console
1. Open browser (Chrome/Firefox)
2. Press F12 to open DevTools
3. Click "Console" tab
4. Go to Skills page → Switch to "Map View" tab
5. Look for "SkillsMap component rendering" log

### 2. Expected Console Logs (in order)
```
SkillsMap component rendering, skills: X onSkillSelect: true
Ref effect - mapRef.current: [DIV object] dimensions: {height: 500, width: 1200, ...}
Dark mode Leaflet CSS injected
Leaflet CSS loaded
Leaflet JS loaded, window.L available: true
User location obtained: {latitude: 20.146..., longitude: 85.674...}
Map init effect - isLeafletReady: true mapRef.current: [DIV] mapInitialized: false
Initializing map...
Container element: [DIV] scrollHeight: 500 offsetHeight: 500
Container styled - new height: 500 width: 1200
Creating Leaflet map with center: [20.146, 85.674]
Map instance created: [Object] map bounds: ...
Tile layer added
Invalidating map size...
Map loaded successfully
Map state set, map container visible: 500 x 1200
```

### 3. If Map Init Effect Logs Missing
Means the effect condition failed. Check:
- `isLeafletReady: ` → Should be `true`
- `mapRef.current: ` → Should be truthy (DIV object)
- `mapInitialized: ` → Should be `false` first time
- `window.L: ` → Should be `true`

### 4. Inspect DOM Element
1. DevTools → Elements tab
2. Press Ctrl+F (search in DOM)
3. Search for class "skills-map-container"
4. Check if element is visible:
   - Should have height: 500px
   - Should have width: 100% or pixel value
   - Should have display: block
   - Should contain Leaflet divs (class "leaflet-container")

### 5. Network Issues to Check
1. DevTools → Network tab
2. Check for failed requests:
   - Leaflet CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
   - Leaflet JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
   - Map tiles: `https://{s}.tile.openstreetmap.org/...`
3. All should return 200 status

## Common Issues & Fixes

### Issue: "Map init effect - isLeafletReady: false"
**Cause**: Leaflet library didn't load
**Fix**: Check network for CDN timeouts, check browser console for CORS errors

### Issue: Container dimensions are 0x0
**Cause**: Parent container too small or display:none
**Fix**: Check parent Box padding/sizing, check if SkillsList is rendering properly

### Issue: Map renders blank/grey
**Cause**: Tile layer failed to load OR z-index issues
**Fix**: Check OpenStreetMap tile requests in Network tab, check CSS z-index conflicts

### Issue: Map renders but no markers
**Cause**: Skills array empty or coordinates invalid
**Fix**: Check skills.length in console, verify database has latitude/longitude

## Quick Fix to Try

If map still not showing after checking above:

1. Go to `frontend/src/components/SkillsMap.js`
2. Find the return statement (around line 475)
3. Temporarily add this below the first Box:
```jsx
<Box sx={{ p: 2, bgcolor: '#1A2332', color: '#E2E8F0', mb: 2 }}>
  <Typography>
    Debug: Leaflet Loaded: {leafletLoaded ? '✓' : '✗'} | 
    Map Ready: {mapLoaded ? '✓' : '✗'} | 
    User Location: {userLocation ? '✓' : '✗'}
  </Typography>
</Box>
```

This will show the state visually on the page.

## Contacts for Further Help
- Check browser console for specific error messages
- Run: `console.log(window.L)` in DevTools console to verify Leaflet loaded
- Run: `console.log(document.querySelector('.skills-map-container'))` to verify DOM element exists
