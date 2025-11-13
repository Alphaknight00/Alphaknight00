class FloorPlanDesigner {
    constructor() {
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.currentTool = null;
        this.walls = [];
        this.doors = [];
        this.windows = [];
        this.rooms = [];
        this.dimensions = [];
        this.tempPoints = [];
        this.gridVisible = true;
        this.dimensionsVisible = true;
        this.hatchingVisible = true;
        this.gridLines = [];
        this.history = [];

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

        // Create orthographic camera for 2D view
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            0,
            0,
            100,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 10;
        this.camera.orthoBottom = -10;
        this.camera.orthoLeft = -15;
        this.camera.orthoRight = 15;
        this.camera.attachControl(this.canvas, true);

        // Lock camera to top view
        this.camera.alpha = 0;
        this.camera.beta = 0;
        this.camera.radius = 100;
        this.camera.lowerRadiusLimit = 50;
        this.camera.upperRadiusLimit = 200;

        // Create light
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        light.intensity = 1;

        // Create grid
        this.createGrid();

        // Render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createGrid() {
        const gridSize = parseInt(document.getElementById('gridSize').value) / 100; // Convert cm to meters
        const extent = 20;
        const color = new BABYLON.Color3(0.9, 0.9, 0.9);

        for (let i = -extent; i <= extent; i++) {
            // Vertical lines
            const vLine = BABYLON.MeshBuilder.CreateLines(
                `gridV${i}`,
                {
                    points: [
                        new BABYLON.Vector3(i * gridSize, 0, -extent * gridSize),
                        new BABYLON.Vector3(i * gridSize, 0, extent * gridSize)
                    ]
                },
                this.scene
            );
            vLine.color = i === 0 ? new BABYLON.Color3(0.7, 0.7, 0.7) : color;
            this.gridLines.push(vLine);

            // Horizontal lines
            const hLine = BABYLON.MeshBuilder.CreateLines(
                `gridH${i}`,
                {
                    points: [
                        new BABYLON.Vector3(-extent * gridSize, 0, i * gridSize),
                        new BABYLON.Vector3(extent * gridSize, 0, i * gridSize)
                    ]
                },
                this.scene
            );
            hLine.color = i === 0 ? new BABYLON.Color3(0.7, 0.7, 0.7) : color;
            this.gridLines.push(hLine);
        }
    }

    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        this.gridLines.forEach(line => {
            line.isVisible = this.gridVisible;
        });
    }

    toggleDimensions() {
        this.dimensionsVisible = !this.dimensionsVisible;
        this.dimensions.forEach(dim => {
            dim.lines.isVisible = this.dimensionsVisible;
            if (dim.text) dim.text.isVisible = this.dimensionsVisible;
        });
    }

    toggleHatching() {
        this.hatchingVisible = !this.hatchingVisible;
        this.walls.forEach(wall => {
            if (wall.hatching) {
                wall.hatching.forEach(h => h.isVisible = this.hatchingVisible);
            }
        });
    }

    setupEventListeners() {
        // Tool buttons
        document.getElementById('wallBtn').addEventListener('click', () => {
            this.setTool('wall');
        });

        document.getElementById('doorBtn').addEventListener('click', () => {
            this.setTool('door');
        });

        document.getElementById('windowBtn').addEventListener('click', () => {
            this.setTool('window');
        });

        document.getElementById('roomBtn').addEventListener('click', () => {
            this.setTool('room');
        });

        // Action buttons
        document.getElementById('toggleGridBtn').addEventListener('click', () => {
            this.toggleGrid();
        });

        document.getElementById('toggleDimensionsBtn').addEventListener('click', () => {
            this.toggleDimensions();
        });

        document.getElementById('toggleHatchingBtn').addEventListener('click', () => {
            this.toggleHatching();
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all?')) {
                this.clearAll();
            }
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        // Canvas click
        this.canvas.addEventListener('click', (evt) => {
            this.handleCanvasClick(evt);
        });

        // Canvas move for cursor position
        this.canvas.addEventListener('mousemove', (evt) => {
            const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit) {
                const pos = pickResult.pickedPoint;
                document.getElementById('cursorPos').textContent =
                    `${(pos.x * 100).toFixed(0)}, ${(pos.z * 100).toFixed(0)} cm`;
            }
        });
    }

    setTool(tool) {
        // Deactivate all buttons
        document.querySelectorAll('#sidebar button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate current tool button
        const toolButtons = {
            'wall': 'wallBtn',
            'door': 'doorBtn',
            'window': 'windowBtn',
            'room': 'roomBtn'
        };

        if (toolButtons[tool]) {
            document.getElementById(toolButtons[tool]).classList.add('active');
        }

        this.currentTool = tool;
        this.tempPoints = [];
        document.getElementById('currentTool').textContent = tool || 'None';
    }

    handleCanvasClick(evt) {
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

        if (!pickResult.hit) return;

        const point = new BABYLON.Vector3(
            Math.round(pickResult.pickedPoint.x * 2) / 2, // Snap to 0.5m grid
            0,
            Math.round(pickResult.pickedPoint.z * 2) / 2
        );

        switch (this.currentTool) {
            case 'wall':
                this.drawWall(point);
                break;
            case 'door':
                this.addDoor(point);
                break;
            case 'window':
                this.addWindow(point);
                break;
            case 'room':
                this.drawRoom(point);
                break;
        }

        this.updateObjectCount();
    }

    drawWall(point) {
        this.tempPoints.push(point);

        if (this.tempPoints.length === 2) {
            const start = this.tempPoints[0];
            const end = this.tempPoints[1];
            const thickness = parseInt(document.getElementById('wallThickness').value) / 100;
            const color = document.getElementById('wallColor').value;

            // Create wall mesh
            const direction = end.subtract(start);
            const length = direction.length();
            const center = BABYLON.Vector3.Center(start, end);

            const wall = BABYLON.MeshBuilder.CreateBox(
                `wall${this.walls.length}`,
                { width: thickness, height: 0.1, depth: length },
                this.scene
            );

            wall.position = center;
            wall.position.y = 0.05;

            const angle = Math.atan2(direction.z, direction.x);
            wall.rotation.y = -angle + Math.PI / 2;

            const material = new BABYLON.StandardMaterial(`wallMat${this.walls.length}`, this.scene);
            material.diffuseColor = BABYLON.Color3.FromHexString(color);
            wall.material = material;

            // Create hatching
            const hatching = this.createHatching(start, end, thickness);

            // Create dimension
            const dimension = this.createDimension(start, end, length);

            this.walls.push({
                mesh: wall,
                start: start,
                end: end,
                thickness: thickness,
                hatching: hatching,
                dimension: dimension
            });

            this.saveState();
            this.tempPoints = [];
        }
    }

    createHatching(start, end, thickness) {
        const hatches = [];
        const direction = end.subtract(start);
        const length = direction.length();
        const perpendicular = new BABYLON.Vector3(-direction.z, 0, direction.x).normalize();
        const hatchSpacing = 0.1;
        const hatchCount = Math.floor(length / hatchSpacing);

        for (let i = 0; i <= hatchCount; i++) {
            const t = i / hatchCount;
            const pos = BABYLON.Vector3.Lerp(start, end, t);

            const hatchLine = BABYLON.MeshBuilder.CreateLines(
                `hatch${this.walls.length}_${i}`,
                {
                    points: [
                        pos.add(perpendicular.scale(thickness / 2)),
                        pos.add(perpendicular.scale(-thickness / 2))
                    ]
                },
                this.scene
            );
            hatchLine.color = new BABYLON.Color3(0.5, 0.5, 0.5);
            hatches.push(hatchLine);
        }

        return hatches;
    }

    createDimension(start, end, length) {
        const direction = end.subtract(start);
        const perpendicular = new BABYLON.Vector3(-direction.z, 0, direction.x).normalize();
        const offset = perpendicular.scale(0.5);

        const dimStart = start.add(offset);
        const dimEnd = end.add(offset);
        const dimMid = BABYLON.Vector3.Center(dimStart, dimEnd);

        // Dimension line
        const dimLine = BABYLON.MeshBuilder.CreateLines(
            `dim${this.dimensions.length}`,
            {
                points: [dimStart, dimEnd]
            },
            this.scene
        );
        dimLine.color = new BABYLON.Color3(0, 0, 0);

        // Extension lines
        const ext1 = BABYLON.MeshBuilder.CreateLines(
            `ext1_${this.dimensions.length}`,
            {
                points: [start, dimStart]
            },
            this.scene
        );
        ext1.color = new BABYLON.Color3(0, 0, 0);

        const ext2 = BABYLON.MeshBuilder.CreateLines(
            `ext2_${this.dimensions.length}`,
            {
                points: [end, dimEnd]
            },
            this.scene
        );
        ext2.color = new BABYLON.Color3(0, 0, 0);

        // Create text
        const lengthCm = (length * 100).toFixed(0);
        const textPlane = this.createTextPlane(`${lengthCm} cm`, dimMid);

        const dimension = {
            lines: dimLine,
            ext1: ext1,
            ext2: ext2,
            text: textPlane,
            value: lengthCm
        };

        this.dimensions.push(dimension);
        return dimension;
    }

    createTextPlane(text, position) {
        // Create a simple text representation using a plane
        const plane = BABYLON.MeshBuilder.CreatePlane(
            `text${Date.now()}`,
            { width: 0.8, height: 0.2 },
            this.scene
        );
        plane.position = position.add(new BABYLON.Vector3(0, 0.3, 0));
        plane.rotation.x = Math.PI / 2;

        const material = new BABYLON.StandardMaterial(`textMat${Date.now()}`, this.scene);

        // Create dynamic texture for text
        const texture = new BABYLON.DynamicTexture(
            `textTexture${Date.now()}`,
            { width: 512, height: 128 },
            this.scene
        );
        texture.hasAlpha = true;

        const ctx = texture.getContext();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 128);

        texture.drawText(
            text,
            null,
            null,
            'bold 60px Arial',
            'black',
            'white'
        );

        material.diffuseTexture = texture;
        material.emissiveTexture = texture;
        plane.material = material;

        return plane;
    }

    addDoor(point) {
        const doorWidth = 0.9; // 90cm standard door
        const color = new BABYLON.Color3(0.6, 0.4, 0.2);

        // Create door opening (gap in wall)
        const door = BABYLON.MeshBuilder.CreateBox(
            `door${this.doors.length}`,
            { width: 0.05, height: 0.1, depth: doorWidth },
            this.scene
        );
        door.position = point;
        door.position.y = 0.05;

        const material = new BABYLON.StandardMaterial(`doorMat${this.doors.length}`, this.scene);
        material.diffuseColor = color;
        door.material = material;

        // Create door arc (swing indicator)
        const arcPoints = [];
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI / 2;
            arcPoints.push(new BABYLON.Vector3(
                point.x + Math.cos(angle) * doorWidth,
                0,
                point.z + Math.sin(angle) * doorWidth
            ));
        }

        const arc = BABYLON.MeshBuilder.CreateLines(
            `doorArc${this.doors.length}`,
            { points: arcPoints },
            this.scene
        );
        arc.color = color;

        this.doors.push({ mesh: door, arc: arc, position: point });
        this.saveState();
    }

    addWindow(point) {
        const windowWidth = 1.2; // 120cm standard window
        const color = new BABYLON.Color3(0.5, 0.7, 0.9);

        const window = BABYLON.MeshBuilder.CreateBox(
            `window${this.windows.length}`,
            { width: 0.1, height: 0.1, depth: windowWidth },
            this.scene
        );
        window.position = point;
        window.position.y = 0.05;

        const material = new BABYLON.StandardMaterial(`windowMat${this.windows.length}`, this.scene);
        material.diffuseColor = color;
        material.alpha = 0.7;
        window.material = material;

        // Add window lines (mullions)
        const line1 = BABYLON.MeshBuilder.CreateLines(
            `windowLine1_${this.windows.length}`,
            {
                points: [
                    new BABYLON.Vector3(point.x, 0, point.z - windowWidth / 2),
                    new BABYLON.Vector3(point.x, 0, point.z + windowWidth / 2)
                ]
            },
            this.scene
        );
        line1.color = new BABYLON.Color3(0.2, 0.2, 0.2);

        const line2 = BABYLON.MeshBuilder.CreateLines(
            `windowLine2_${this.windows.length}`,
            {
                points: [
                    new BABYLON.Vector3(point.x - 0.05, 0, point.z),
                    new BABYLON.Vector3(point.x + 0.05, 0, point.z)
                ]
            },
            this.scene
        );
        line2.color = new BABYLON.Color3(0.2, 0.2, 0.2);

        this.windows.push({ mesh: window, lines: [line1, line2], position: point });
        this.saveState();
    }

    drawRoom(point) {
        this.tempPoints.push(point);

        // Create marker for this point
        const marker = BABYLON.MeshBuilder.CreateSphere(
            `marker${this.tempPoints.length}`,
            { diameter: 0.2 },
            this.scene
        );
        marker.position = point;

        const material = new BABYLON.StandardMaterial('markerMat', this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        marker.material = material;
    }

    undo() {
        if (this.history.length > 0) {
            this.history.pop();
            // For simplicity, we'll just clear the last added element
            if (this.walls.length > 0) {
                const wall = this.walls.pop();
                wall.mesh.dispose();
                if (wall.hatching) {
                    wall.hatching.forEach(h => h.dispose());
                }
            }
            this.updateObjectCount();
        }
    }

    clearAll() {
        // Dispose all meshes
        this.walls.forEach(wall => {
            wall.mesh.dispose();
            if (wall.hatching) {
                wall.hatching.forEach(h => h.dispose());
            }
        });

        this.doors.forEach(door => {
            door.mesh.dispose();
            door.arc.dispose();
        });

        this.windows.forEach(window => {
            window.mesh.dispose();
            window.lines.forEach(line => line.dispose());
        });

        this.dimensions.forEach(dim => {
            dim.lines.dispose();
            dim.ext1.dispose();
            dim.ext2.dispose();
            if (dim.text) dim.text.dispose();
        });

        this.walls = [];
        this.doors = [];
        this.windows = [];
        this.dimensions = [];
        this.history = [];
        this.tempPoints = [];

        this.updateObjectCount();
    }

    saveState() {
        this.history.push({
            walls: this.walls.length,
            doors: this.doors.length,
            windows: this.windows.length
        });
    }

    updateObjectCount() {
        const total = this.walls.length + this.doors.length + this.windows.length;
        document.getElementById('objectCount').textContent = total;
    }

    async exportToPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Add title
        pdf.setFontSize(20);
        pdf.text('Architectural Floor Plan', 148, 20, { align: 'center' });

        // Add date
        pdf.setFontSize(10);
        const date = new Date().toLocaleDateString();
        pdf.text(`Date: ${date}`, 20, 30);

        // Add project info
        pdf.setFontSize(12);
        pdf.text('Project: Custom Floor Plan', 20, 40);
        pdf.text(`Total Elements: ${this.walls.length + this.doors.length + this.windows.length}`, 20, 47);
        pdf.text(`Walls: ${this.walls.length}`, 20, 54);
        pdf.text(`Doors: ${this.doors.length}`, 20, 61);
        pdf.text(`Windows: ${this.windows.length}`, 20, 68);

        // Capture canvas as image
        try {
            const imageData = await this.captureSceneAsImage();
            pdf.addImage(imageData, 'PNG', 20, 80, 257, 120);
        } catch (error) {
            console.error('Error capturing scene:', error);
        }

        // Add scale reference
        pdf.setFontSize(10);
        pdf.text('Scale: 1:100 (approximate)', 20, 205);

        // Add legend
        pdf.setFontSize(12);
        pdf.text('Legend:', 20, 180);
        pdf.setFontSize(10);
        pdf.setFillColor(44, 62, 80);
        pdf.rect(25, 185, 5, 3, 'F');
        pdf.text('Walls', 35, 188);

        pdf.setFillColor(153, 102, 51);
        pdf.rect(25, 192, 5, 3, 'F');
        pdf.text('Doors', 35, 195);

        pdf.setFillColor(128, 179, 230);
        pdf.rect(25, 199, 5, 3, 'F');
        pdf.text('Windows', 35, 202);

        // Save PDF
        pdf.save(`floor-plan-${Date.now()}.pdf`);
        alert('Floor plan exported successfully!');
    }

    captureSceneAsImage() {
        return new Promise((resolve) => {
            BABYLON.Tools.CreateScreenshot(this.engine, this.camera, { width: 1920, height: 1080 }, (data) => {
                resolve(data);
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FloorPlanDesigner();
});
