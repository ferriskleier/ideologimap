Use the following tech stack for this project:

- Shadcn UI
- TypeScript NextJS
- SQLite Database
- Tailwind CSS

# Political Compass Interactive Map

## Overview
This project implements an interactive political compass map with a draggable, zoomable canvas that displays political ideologies and people positioned according to their political alignment.

## Key Features

### Interactive Canvas
- **Draggable Map**: Click and drag to move around the political compass
- **Zoomable**: Scroll to zoom in/out, with limits to prevent the map from becoming too small
- **Constrained Movement**: When fully zoomed out, the map stays centered and cannot be dragged outside the viewport
- **Square Aspect Ratio**: The map maintains a square shape regardless of window dimensions
- **High DPI Support**: Canvas renders at native resolution for sharp text and graphics

### Coordinate System
- **Range**: -10 to +10 on both axes
- **X-axis**: Economic scale (Left negative, Right positive)
- **Y-axis**: Social scale (Libertarian negative, Authoritarian positive)
- **Display**: Current mouse coordinates shown in bottom-right corner when hovering over the map

### Visual Design
- **Four Quadrants**:
  - Top-left (Authoritarian Left): Muted red (#ef9a9a)
  - Top-right (Authoritarian Right): Muted blue (#90caf9)
  - Bottom-left (Libertarian Left): Muted green (#a5d6a7)
  - Bottom-right (Libertarian Right): Muted yellow (#fff59d)
- **Grid**: 1-unit spacing with light gray lines
- **Axes**: Bold dark gray lines at x=0 and y=0

### People on the Map
- **Database**: SQLite database stores people with their positions and Wikipedia links
- **Visual**: Red dots with gradient fill and dark border
- **Labels**: Names displayed above dots in bold text
- **Interaction**: Click on a person to show popup with:
  - Name
  - Coordinates
  - Wikipedia link (if available)
- **Example**: Ayn Rand positioned at (8, -8)

### Ideology Labels
- **Display**: Gray text (30% opacity) in background
- **Font Size**: 20px (scaled with zoom)
- **Purpose**: Indicate which ideologies belong in different regions

## Technical Implementation

### Database Schema (SQLite)
```sql
CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  wikipedia_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### API Routes
- `GET /api/people` - Fetch all people
- `POST /api/people` - Add a new person

### Adding New People
1. Use the `addPerson` function in `lib/db.ts`:
   ```typescript
   addPerson('Name', x, y, 'https://en.wikipedia.org/wiki/Name');
   ```
2. Or make a POST request to `/api/people` with:
   ```json
   {
     "name": "Person Name",
     "x": 5.5,
     "y": -3.2,
     "wikipedia_url": "https://..."
   }
   ```

### Adding New Ideology Labels
Edit the `ideologyLabels` array in `components/political-compass.tsx`:
```typescript
const ideologyLabels: IdeologyLabel[] = [
  { text: "Anarcho Capitalism", x: 9, y: -9.5 },
  // Add more labels here
];
```

### Canvas Rendering Pipeline
1. Clear canvas with background color
2. Draw colored quadrants
3. Draw ideology labels (background layer)
4. Draw grid lines
5. Draw main axes
6. Draw axis labels and values
7. Draw people dots and names (foreground layer)

### Coordinate Calculations
- Canvas uses inverted Y-axis (positive Y goes down)
- Political compass uses normal Y-axis (positive Y goes up)
- Conversion: `canvasY = -politicalY`

### Mouse Interactions
- **Click on person**: Shows popup with details
- **Click elsewhere**: Closes popup and enables dragging
- **Drag**: Moves the map (when not clicking on a person)
- **Scroll**: Zooms in/out with mouse position as focal point

## Future Enhancements
- Add more people to the database
- Implement search/filter functionality
- Add animation when navigating to specific people
- Include more detailed ideology descriptions
- Add ability to take the political compass quiz and see your position