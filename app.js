console.log("Hello World");

// Create a Three.js scene
const scene = new THREE.Scene();

// Set the scene background to light blue (sky)
scene.background = new THREE.Color(0x87CEEB); // Light blue sky

// Create a camera (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20); // Move the camera up and back
camera.lookAt(0, 0, 0); // Make the camera look at the origin

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

// Create a player (a simple cube for now)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.5, 0); // Position the player slightly above the ground
scene.add(player);

// Movement variables
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};

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
    }
});

// Update the camera position to match the player's position
function updateCameraPosition() {
    camera.position.set(player.position.x, player.position.y + 1.5, player.position.z); // Slightly above the player
    camera.lookAt(
        player.position.x + Math.sin(camera.rotation.y), // Look in the direction the player is facing
        player.position.y + 1.5,
        player.position.z - Math.cos(camera.rotation.y)
    );
}

// Update player position in the animation loop
function updatePlayerPosition() {
    const speed = 0.1; // Movement speed
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

    // Update the camera position after moving the player
    updateCameraPosition();
}

// Modify the animation loop to include player movement and camera updates
function animate() {
    requestAnimationFrame(animate);

    // Update player position
    updatePlayerPosition();

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
