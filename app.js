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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
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
