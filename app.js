console.log("Hello World");

// Create a Three.js scene
const scene = new THREE.Scene();

// Set the scene background to light blue (sky)
scene.background = new THREE.Color(0x87CEEB); // Light blue sky

// Create a camera (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 10); // Position the camera slightly above the ground and behind the player
camera.rotation.y = Math.PI; // Rotate the camera to face the negative Z direction (toward the wall)

// Create a WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a grass field (plane)
const grassGeometry = new THREE.PlaneGeometry(50, 50);
const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 }); // Grass green
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
scene.add(grass);

// Create a stone wall (box)
const wallGeometry = new THREE.BoxGeometry(10, 5, 1);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8B8B83 }); // Stone gray
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(0, 2.5, -10); // Position the wall
scene.add(wall);

// Add a black outline to the wall
const wallEdges = new THREE.EdgesGeometry(wallGeometry); // Get the edges of the wall
const wallOutlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color
const wallOutline = new THREE.LineSegments(wallEdges, wallOutlineMaterial);
wallOutline.position.copy(wall.position); // Match the wall's position
scene.add(wallOutline);

// Create a player (a simple cube for now)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.5, 0); // Position the player slightly above the ground
scene.add(player);

// Create a zombie (composed of cubes)
const zombieGroup = new THREE.Group(); // Group to hold all parts of the zombie

// Zombie body (orange shirt)
const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 }); // Orange color
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.set(0, 1.25, 0); // Position the body above the ground
zombieGroup.add(body);

// Zombie head (dark green skin)
const headGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
const headMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 }); // Dark green color
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.set(0, 2.25, 0); // Position the head above the body
zombieGroup.add(head);

// Zombie legs (brown pants)
const legGeometry = new THREE.BoxGeometry(0.4, 0.75, 0.4);
const legMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color

const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(-0.3, 0.375, 0); // Position the left leg
zombieGroup.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(0.3, 0.375, 0); // Position the right leg
zombieGroup.add(rightLeg);

// Position the zombie in front of the wall
zombieGroup.position.set(0, 0, -7); // Adjust position as needed
scene.add(zombieGroup);

// Create bounding boxes for collision detection
const wallBoundingBox = new THREE.Box3().setFromObject(wall);
const playerBoundingBox = new THREE.Box3();

// Movement variables
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};

// Add camera rotation variables
const cameraRotation = {
    left: false,  // Rotate counterclockwise (Q)
    right: false, // Rotate clockwise (E)
};
const cameraRotationSpeed = 0.05; // Speed of rotation

// Event listeners for key press and release
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            movement.forward = true;
            break;
        case 's':
        case 'ArrowDown':
            movement.backward = true;
            break;
        case 'a':
        case 'ArrowLeft':
            movement.left = true;
            break;
        case 'd':
        case 'ArrowRight':
            movement.right = true;
            break;
        case 'q': // Rotate counterclockwise
            cameraRotation.left = true;
            break;
        case 'e': // Rotate clockwise
            cameraRotation.right = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            movement.forward = false;
            break;
        case 's':
        case 'ArrowDown':
            movement.backward = false;
            break;
        case 'a':
        case 'ArrowLeft':
            movement.left = false;
            break;
        case 'd':
        case 'ArrowRight':
            movement.right = false;
            break;
        case 'q': // Stop rotating counterclockwise
            cameraRotation.left = false;
            break;
        case 'e': // Stop rotating clockwise
            cameraRotation.right = false;
            break;
    }
});

// Update the camera position to match the player's position
function updateCameraPosition() {
    camera.position.set(player.position.x, player.position.y + 1.5, player.position.z); // Slightly above the player
}

// Update player position in the animation loop
function updatePlayerPosition() {
    const speed = 0.1; // Movement speed
    const previousPosition = player.position.clone(); // Save the player's position before moving

    if (movement.forward) {
        player.position.z -= speed * Math.cos(camera.rotation.y);
        player.position.x -= speed * Math.sin(camera.rotation.y);
    }
    if (movement.backward) {
        player.position.z += speed * Math.cos(camera.rotation.y);
        player.position.x += speed * Math.sin(camera.rotation.y);
    }
    if (movement.left) {
        player.position.x -= speed * Math.cos(camera.rotation.y);
        player.position.z += speed * Math.sin(camera.rotation.y);
    }
    if (movement.right) {
        player.position.x += speed * Math.cos(camera.rotation.y);
        player.position.z -= speed * Math.sin(camera.rotation.y);
    }

    // Update the player's bounding box
    playerBoundingBox.setFromObject(player);

    // Check for collision with the wall
    if (playerBoundingBox.intersectsBox(wallBoundingBox)) {
        // If there's a collision, revert to the previous position
        player.position.copy(previousPosition);
    }

    // Update the camera position after moving the player
    updateCameraPosition();
}

// Update camera rotation in the animation loop
function updateCameraRotation() {
    if (cameraRotation.left) {
        camera.rotation.y += cameraRotationSpeed; // Rotate counterclockwise (swapped with E)
    }
    if (cameraRotation.right) {
        camera.rotation.y -= cameraRotationSpeed; // Rotate clockwise (swapped with Q)
    }
}

// Modify the animation loop to include player movement and camera updates
function animate() {
    requestAnimationFrame(animate);

    // Update player position
    updatePlayerPosition();

    // Update camera rotation
    updateCameraRotation();

    // Update camera position after all changes
    updateCameraPosition();

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start animation
animate();
