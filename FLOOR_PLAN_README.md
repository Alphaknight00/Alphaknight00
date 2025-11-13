# 🏗️ Architectural Floor Plan Designer

A professional web-based floor plan design application built with Babylon.js that allows users to create architectural floor plans and export them as legitimate PDF documents with dimensions and hatching patterns.

## ✨ Features

### Core Functionality
- **Interactive Drawing Tools**
  - 📐 Draw walls with customizable thickness
  - 🚪 Add doors with swing indicators
  - 🪟 Place windows with mullion details
  - 🏠 Create complete rooms

### Professional Elements
- **Automatic Dimensions**: Every wall automatically gets dimension lines with measurements in centimeters
- **Hatching Patterns**: Walls include cross-hatching for better visual clarity and professional appearance
- **Grid System**: Snap-to-grid functionality for precise placement
- **Measurement Display**: Real-time cursor position tracking

### Export Capabilities
- **PDF Export**: Generate professional architectural floor plans in PDF format
  - A4 landscape format
  - Title block with date
  - Project information summary
  - Legend for elements
  - Scale reference
  - High-quality rendering

### User Interface
- Modern, intuitive sidebar with organized tool groups
- Real-time object counting
- Toggle visibility for grid, dimensions, and hatching
- Undo functionality
- Clear all option
- Color customization for walls

## 🚀 Getting Started

### Prerequisites
No installation required! The application uses CDN-hosted libraries:
- Babylon.js (3D rendering engine)
- jsPDF (PDF generation)

### Running the Application

1. **Clone or download this repository**

2. **Open the application**
   - Simply open `index.html` in a modern web browser
   - OR use a local server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js http-server
     npx http-server
     ```

3. **Start designing!**
   - The application will load automatically
   - Select a tool from the sidebar
   - Click on the canvas to start drawing

## 📖 Usage Guide

### Drawing Walls
1. Click the "📐 Draw Wall" button
2. Click on the canvas for the start point
3. Click again for the end point
4. Wall is created with automatic dimensions and hatching

### Adding Doors
1. Click the "🚪 Add Door" button
2. Click on the canvas where you want the door
3. A door with swing arc indicator is placed

### Adding Windows
1. Click the "🪟 Add Window" button
2. Click on the canvas for window placement
3. Window with mullion details is created

### Drawing Rooms
1. Click the "🏠 Draw Room" button
2. Click to create corner points
3. Double-click to complete the room

### Customizing Settings

**Wall Thickness**: Adjust from 10cm to 50cm (default: 20cm)
**Grid Size**: Change grid spacing from 10cm to 100cm (default: 50cm)
**Wall Color**: Use the color picker to change wall appearance

### View Options

- **Toggle Grid**: Show/hide the background grid
- **Toggle Dimensions**: Show/hide dimension lines and measurements
- **Toggle Hatching**: Show/hide wall hatching patterns

### Exporting to PDF

1. Create your floor plan
2. Click "📄 Export to PDF"
3. PDF will be generated and downloaded automatically

The exported PDF includes:
- Title: "Architectural Floor Plan"
- Date stamp
- Project information (element counts)
- Rendered floor plan view
- Legend showing wall, door, and window symbols
- Scale reference

## 🎨 Features in Detail

### Dimension System
- Automatically calculated for all walls
- Displayed in centimeters
- Positioned offset from walls for clarity
- Includes extension lines
- Can be toggled on/off

### Hatching Patterns
- Professional cross-hatching on walls
- Evenly spaced at 10cm intervals
- Helps distinguish wall thickness
- Creates professional architectural appearance
- Can be toggled on/off

### Grid System
- Snap-to-grid functionality (50cm default)
- Helps align elements precisely
- Centered coordinate system
- Major axis lines highlighted
- Can be toggled on/off

### Camera Controls
- Orthographic (top-down) view perfect for floor plans
- Zoom in/out with scroll wheel
- Pan by dragging (right-click)
- Locked to top view for consistency

## 🛠️ Technical Architecture

### Files Structure
```
floor-plan-designer/
├── index.html          # Main HTML structure
├── floorplan.js        # Core application logic
└── FLOOR_PLAN_README.md # Documentation
```

### Technology Stack
- **Babylon.js**: 3D rendering engine used in 2D orthographic mode
- **jsPDF**: PDF generation library
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with flexbox

### Key Classes and Components

**FloorPlanDesigner Class**
- Main application controller
- Handles scene setup and management
- Manages all drawing tools
- Coordinates PDF export

**Drawing System**
- Wall creation with thickness
- Door and window placement
- Room polygon creation
- Automatic snap-to-grid

**Dimension System**
- Automatic measurement calculation
- Dynamic text rendering
- Extension lines
- Proper offset positioning

**Hatching System**
- Perpendicular line generation
- Configurable spacing
- Material indication

## 🎯 Use Cases

- **Architectural Planning**: Create initial floor plan concepts
- **Interior Design**: Plan room layouts and furniture placement
- **Real Estate**: Visualize property layouts
- **Home Renovation**: Plan modifications and additions
- **Educational**: Learn architectural drawing principles
- **Quick Mockups**: Rapid prototyping of space layouts

## 🔧 Customization

### Changing Default Values
Edit the input values in the HTML or modify these lines in `floorplan.js`:

```javascript
// Wall thickness (in cm)
const thickness = parseInt(document.getElementById('wallThickness').value) / 100;

// Grid size (in cm)
const gridSize = parseInt(document.getElementById('gridSize').value) / 100;

// Door width
const doorWidth = 0.9; // 90cm

// Window width
const windowWidth = 1.2; // 120cm
```

### Adding New Elements
Extend the `FloorPlanDesigner` class with new methods:

```javascript
addFurniture(point) {
    // Your furniture creation logic
}
```

### Customizing PDF Output
Modify the `exportToPDF()` method in `floorplan.js` to change:
- Page size and orientation
- Title and headers
- Layout and positioning
- Additional information fields

## 📱 Browser Compatibility

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
✅ Opera

**Minimum Requirements:**
- WebGL support
- ES6 JavaScript support
- Canvas API support

## ⚡ Performance Tips

- For complex plans with many elements, consider toggling off hatching
- Use the grid to align elements quickly
- Zoom in for precise placement
- Clear unused elements to improve performance

## 🐛 Troubleshooting

**Issue**: Canvas appears blank
- **Solution**: Ensure WebGL is enabled in browser settings

**Issue**: PDF export fails
- **Solution**: Check browser console for errors, ensure jsPDF loaded correctly

**Issue**: Elements not snapping to grid
- **Solution**: Grid snapping is automatic, ensure grid size is appropriate

**Issue**: Dimensions not showing
- **Solution**: Click "Toggle Dimensions" to enable

## 📄 License

This project is open source and available for educational and commercial use.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🔮 Future Enhancements

Potential features for future versions:
- Furniture library
- Custom room labels and annotations
- Measurement in imperial units (feet/inches)
- Save/load floor plans (JSON format)
- Multi-floor support
- Area calculations
- Material cost estimation
- 3D preview mode
- Collaborative editing
- Template library
- DXF/DWG export

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

## 🌟 Acknowledgments

- Built with [Babylon.js](https://www.babylonjs.com/)
- PDF generation by [jsPDF](https://github.com/parallax/jsPDF)

---

**Made with ❤️ for architects, designers, and anyone who needs to create floor plans quickly and professionally.**
