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

// Create a fist (attached to the player)
const fistGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const fistMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for the fist
const fist = new THREE.Mesh(fistGeometry, fistMaterial);
fist.position.set(0.75, 0, 0.75); // Position the fist relative to the player
player.add(fist); // Attach the fist to the player

// Create a fist (visible in the camera view)
const fistGeometryCamera = new THREE.SphereGeometry(0.25, 32, 32); // Sphere with radius 0.25
const fistMaterialCamera = new THREE.MeshBasicMaterial({ color: 0xf1c27d }); // Light brown color for the fist
const fistCamera = new THREE.Mesh(fistGeometryCamera, fistMaterialCamera);

// Position the fist in front of the camera
fistCamera.position.set(0.5, -0.5, -1); // Slightly to the right, below, and in front of the camera
camera.add(fistCamera); // Attach the fist to the camera
scene.add(camera); // Ensure the camera (with the fist) is part of the scene

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

// Zombie arms (dark green skin)
const armGeometry = new THREE.BoxGeometry(0.3, 0.75, 0.3); // Width, height, depth
const armMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 }); // Dark green color

// Left arm
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.75, 1.5, 0); // Position the left arm
leftArm.rotation.x = Math.PI / 2; // Rotate the arm to point forward
zombieGroup.add(leftArm);

// Right arm
const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.75, 1.5, 0); // Position the right arm
rightArm.rotation.x = Math.PI / 2; // Rotate the arm to point forward
zombieGroup.add(rightArm);

// Create a zombie health bar
const zombieHealthBarGeometry = new THREE.PlaneGeometry(1, 0.1); // Width 1, height 0.1
const zombieHealthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
const zombieHealthBar = new THREE.Mesh(zombieHealthBarGeometry, zombieHealthBarMaterial);
zombieHealthBar.position.set(0, 3, 0); // Position above the zombie's head
zombieGroup.add(zombieHealthBar); // Attach to the zombie group

// Position the zombie in front of the wall
zombieGroup.position.set(0, 0, -7); // Adjust position as needed
scene.add(zombieGroup);

// Create bounding boxes for collision detection
const wallBoundingBox = new THREE.Box3().setFromObject(wall);
const playerBoundingBox = new THREE.Box3();
const zombieBoundingBox = new THREE.Box3();

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

// Zombie movement speed
const zombieSpeed = 0.05; // Slower than the player

// Variables for charging attack
let isCharging = false;
let chargeStartTime = 0;

// Variables for fist animation
let isPunching = false;
let punchStartTime = 0;

// Zombie health
let zombieHealth = 100;

// Player health
let playerHealth = 100;

let isZombieAlive = true; // Flag to track if the zombie is alive

let isZombieAttacking = false;
let zombieAttackStartTime = 0;
const zombieAttackRange = 1.0; // Increased attack range
const zombieAttackCooldown = 1.5; // Cooldown time between attacks (in seconds)

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
        case ' ':
            if (!isCharging && !isPunching) {
                isCharging = true;
                chargeStartTime = performance.now(); // Record the time when charging starts
            }
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
        case ' ':
            if (isCharging) {
                isCharging = false;
                isPunching = true;
                punchStartTime = performance.now(); // Record the time when punching starts

                const chargeDuration = (performance.now() - chargeStartTime) / 1000; // Calculate charge duration in seconds

                // Calculate damage and knockback based on charge duration
                const damage = Math.min(chargeDuration * 10, 50); // Cap damage at 50
                const knockback = Math.min(chargeDuration * 2, 10); // Cap knockback at 10

                // Apply knockback to the zombie
                applyKnockbackToZombie(knockback);

                console.log(`Attack released! Damage: ${damage}, Knockback: ${knockback}`);
            }
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
        // If there's a collision with the wall, revert to the previous position
        player.position.copy(previousPosition);
    }

    // Remove the logic for zombie collision damage
    // The zombie will now only damage the player through its attack animation

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

// Update zombie position in the animation loop
function updateZombiePosition() {
    if (!isZombieAlive) {
        return; // Stop updating the zombie's position if it is dead
    }

    // Update the zombie's bounding box
    zombieBoundingBox.setFromObject(zombieGroup);

    // Check if the zombie is within attack range
    const distanceToPlayer = zombieGroup.position.distanceTo(player.position);
    if (distanceToPlayer <= zombieAttackRange) {
        // Stop the zombie's movement and attack
        zombieAttack();
        return;
    }

    // Save the zombie's current position
    const previousPosition = zombieGroup.position.clone();

    // Calculate the direction vector from the zombie to the player
    const direction = new THREE.Vector3();
    direction.subVectors(player.position, zombieGroup.position).normalize();

    // Move the zombie toward the player
    zombieGroup.position.x += direction.x * zombieSpeed;
    zombieGroup.position.z += direction.z * zombieSpeed;

    // Update the zombie's bounding box after moving
    zombieBoundingBox.setFromObject(zombieGroup);

    // Check for collision with the wall
    if (zombieBoundingBox.intersectsBox(wallBoundingBox)) {
        // If there's a collision with the wall, revert to the previous position
        zombieGroup.position.copy(previousPosition);
    }

    // Make the zombie look at the player
    zombieGroup.lookAt(player.position.x, zombieGroup.position.y, player.position.z);
}

// Function to apply knockback to the zombie
function applyKnockbackToZombie(knockback) {
    // Calculate the direction vector from the player to the zombie
    const direction = new THREE.Vector3();
    direction.subVectors(zombieGroup.position, player.position).normalize();

    // Apply knockback to the zombie's position
    zombieGroup.position.x += direction.x * knockback;
    zombieGroup.position.z += direction.z * knockback;

    // Reduce the zombie's health
    const damage = Math.min((performance.now() - chargeStartTime) / 100, 50); // Damage based on charge duration
    zombieHealth -= damage;

    console.log(`Zombie Health: ${zombieHealth}`);

    // Check if the zombie is dead
    if (zombieHealth <= 0) {
        handleZombieDeath(); // Call the centralized death handler
    } else {
        // Update the zombie's bounding box
        zombieBoundingBox.setFromObject(zombieGroup);
    }
}

// Function to update the fist during charging and punching
function updateFistDuringCharging() {
    if (isCharging) {
        const chargeDuration = (performance.now() - chargeStartTime) / 2000; // Normalize charge duration (2 seconds to reach max charge)
        const scale = Math.min(1 + chargeDuration, 2); // Scale the fist up to 2x size, slower growth

        // Make the fist shake slightly when fully charged
        if (chargeDuration >= 1) {
            const shakeAmount = 0.05 * Math.sin(performance.now() * 10); // Small oscillation
            fistCamera.position.x = 0.5 + shakeAmount; // Add shake to the x position
        } else {
            fistCamera.position.x = 0.5; // Reset x position if not fully charged
        }

        // Scale the fist
        fistCamera.scale.set(scale, scale, scale);
    } else if (isPunching) {
        // Handle punching animation
        const punchDuration = (performance.now() - punchStartTime) / 1000;

        if (punchDuration < 0.2) {
            // Launch the fist forward
            fistCamera.position.set(0.5, -0.5, -2);
        } else if (punchDuration < 0.4) {
            // Retract the fist back
            fistCamera.position.set(0.5, -0.5, -1);
        } else {
            // End punching animation
            isPunching = false;
            fistCamera.scale.set(1, 1, 1);
            fistCamera.position.set(0.5, -0.5, -1);
        }
    } else {
        // Reset the fist's scale and position after the attack
        fistCamera.scale.set(1, 1, 1);
        fistCamera.position.set(0.5, -0.5, -1);
    }
}

// Function to update health bars
function updateHealthBars() {
    // Update player's health bar
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerHealthPercentage = Math.max(playerHealth / 100, 0); // Ensure it doesn't go below 0
    playerHealthBar.style.width = `${playerHealthPercentage * 100}%`;

    // Update zombie's health bar
    const zombieHealthPercentage = Math.max(zombieHealth / 100, 0); // Ensure it doesn't go below 0
    zombieHealthBar.scale.x = zombieHealthPercentage; // Scale the health bar horizontally
    zombieHealthBar.material.color.set(zombieHealthPercentage > 0.5 ? 0x00ff00 : 0xff0000); // Green if >50%, red otherwise
}

// Function to handle zombie death
function handleZombieDeath() {
    // Replace the zombie with a "corpse"
    const corpseMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for the corpse
    const corpse = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), corpseMaterial);
    corpse.position.copy(zombieGroup.position); // Place the corpse where the zombie died
    scene.add(corpse);

    // Remove the zombie from the scene
    scene.remove(zombieGroup);

    // Reset the zombie's bounding box to prevent further collisions
    zombieBoundingBox.makeEmpty(); // Clear the bounding box

    // Mark the zombie as dead
    isZombieAlive = false;

    console.log("Zombie defeated! A corpse has been left behind.");
}

// Function to display the game over screen
function displayGameOverScreen() {
    // Stop the game loop
    cancelAnimationFrame(animationId);

    // Create a "Game Over" overlay
    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.style.position = 'absolute';
    gameOverOverlay.style.top = '50%';
    gameOverOverlay.style.left = '50%';
    gameOverOverlay.style.transform = 'translate(-50%, -50%)';
    gameOverOverlay.style.fontSize = '48px';
    gameOverOverlay.style.color = 'red';
    gameOverOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameOverOverlay.style.padding = '20px';
    gameOverOverlay.style.borderRadius = '10px';
    gameOverOverlay.innerText = 'Game Over';
    document.body.appendChild(gameOverOverlay);
}

// Function to handle zombie attack
function zombieAttack() {
    if (!isZombieAlive || isZombieAttacking) {
        return; // Stop the attack if the zombie is dead or already attacking
    }

    isZombieAttacking = true;
    zombieAttackStartTime = performance.now();

    // Animate the zombie's arms (simulate a punch)
    const attackDuration = 0.5; // Duration of the attack animation (in seconds)

    const attackInterval = setInterval(() => {
        if (!isZombieAlive) {
            clearInterval(attackInterval); // Stop the attack animation if the zombie dies
            return;
        }

        const elapsedTime = (performance.now() - zombieAttackStartTime) / 1000;

        if (elapsedTime < attackDuration / 2) {
            // Move the arms forward
            leftArm.position.z -= 0.05;
            rightArm.position.z -= 0.05;
        } else if (elapsedTime < attackDuration) {
            // Move the arms back
            leftArm.position.z += 0.05;
            rightArm.position.z += 0.05;
        } else {
            // End the attack animation
            clearInterval(attackInterval);
            isZombieAttacking = false;
        }
    }, 16); // Run every 16ms (~60 FPS)

    // Apply damage to the player
    setTimeout(() => {
        if (!isZombieAlive) {
            return; // Stop applying damage if the zombie dies
        }

        if (playerBoundingBox.intersectsBox(zombieBoundingBox)) {
            playerHealth -= 10; // Reduce player's health by 10
            console.log(`Player hit by zombie! Health: ${playerHealth}`);

            // Show the red overlay
            showDamageOverlay();

            // Check if the player is dead
            if (playerHealth <= 0) {
                console.log("Game Over! Player defeated.");
                displayGameOverScreen();
            }
        }
    }, attackDuration * 1000); // Apply damage at the end of the attack animation
}

// Function to show damage overlay
function showDamageOverlay() {
    const overlay = document.getElementById('damage-overlay');
    overlay.style.opacity = 1; // Show the overlay
    setTimeout(() => {
        overlay.style.opacity = 0; // Hide the overlay after 1 second
    }, 1000);
}

// Modify the animation loop to include player movement and camera updates
function animate() {
    animationId = requestAnimationFrame(animate);

    // Update player position
    updatePlayerPosition();

    // Update camera rotation
    updateCameraRotation();

    // Update zombie position
    updateZombiePosition();

    // Update the fist during charging
    updateFistDuringCharging();

    // Update health bars
    updateHealthBars();

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
