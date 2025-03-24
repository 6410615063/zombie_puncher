console.log("Hello World");

// Create a Three.js scene
const scene = new THREE.Scene();

// Set the scene background to light blue (sky)
scene.background = new THREE.Color(0x87CEEB); // Light blue sky

// Create a camera (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 10); // Position the camera slightly above the ground and behind the player
camera.rotation.y = 0; // Rotate the camera by 180 degrees to face the opposite direction

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

// Create a baseball bat for the camera view
const batGeometryCamera = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 32); // Thin cylinder for the bat
const batMaterialCamera = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for the bat
const batCamera = new THREE.Mesh(batGeometryCamera, batMaterialCamera);

// Position the bat in front of the camera
batCamera.position.set(0.5, -0.5, -1); // Slightly to the right, below, and in front of the camera
batCamera.rotation.z = Math.PI / 4; // Rotate the bat slightly for a natural look
batCamera.visible = false; // Initially hide the bat
camera.add(batCamera); // Attach the bat to the camera

// Create the baseball bat
const baseballBatGroup = new THREE.Group(); // Group to hold all parts of the bat

// Bat handle (shorter cylinder)
const batHandleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32); // Shorter handle: height = 1.0
const batHandleMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for the handle
const batHandle = new THREE.Mesh(batHandleGeometry, batHandleMaterial);
batHandle.position.set(0, 0.5, 0); // Adjust position for shorter handle
baseballBatGroup.add(batHandle);

// Bat head (longer cylinder)
const batHeadGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32); // Longer head: height = 1.0
const batHeadMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Tan color for the bat head
const batHead = new THREE.Mesh(batHeadGeometry, batHeadMaterial);
batHead.position.set(0, 1.5, 0); // Adjust position for longer head
baseballBatGroup.add(batHead);

// Position the bat leaning on the wall
baseballBatGroup.position.set(-3, 0, -9); // Position near the wall
baseballBatGroup.rotation.z = Math.PI / 6; // Lean the bat slightly
baseballBatGroup.rotation.y = Math.PI / 8; // Rotate slightly for a natural look

// Add the bat to the scene
scene.add(baseballBatGroup);

// Create bounding boxes for collision detection
const wallBoundingBox = new THREE.Box3().setFromObject(wall);
const playerBoundingBox = new THREE.Box3();
// Create a bounding box for the baseball bat
const baseballBatBoundingBox = new THREE.Box3().setFromObject(baseballBatGroup);

const batDamage = 30; // Higher damage than punching
const batRange = 2.0; // Longer range than punching

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

let isSwingingBat = false;
let batSwingStartTime = 0;


// Player health
let playerHealth = 100;
let zombieHealth = 100;

let isZombieAlive = true; // Flag to track if the zombie is alive

let isZombieAttacking = false;
let zombieAttackStartTime = 0;
const zombieAttackRange = 1.0; // Increased attack range
const zombieAttackCooldown = 1.5; // Cooldown time between attacks (in seconds)

const playerPunchRange = 1.5; // Slightly longer than the zombie's attack range

let selectedSlot = 0; // Default to the fist (slot 0)

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

window.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '9') {
        // Select the corresponding inventory slot
        const slotNumber = parseInt(event.key);
        selectInventorySlot(slotNumber);
    } else if (event.key === '0') {
        // Use the fist (slot 0)
        selectInventorySlot(0);
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

                if (selectedSlot === 0) {
                    // Fist attack logic
                    isPunching = true;
                    punchStartTime = performance.now(); // Record the time when punching starts

                    const chargeDuration = (performance.now() - chargeStartTime) / 1000; // Calculate charge duration in seconds

                    // Calculate damage and knockback based on charge duration
                    const damage = Math.min(chargeDuration * 10, 50); // Cap damage at 50
                    const knockback = Math.min(chargeDuration * 2, 10); // Cap knockback at 10

                    // Check collisions with all zombies
                    checkZombieCollision(damage, knockback);
                } else if (selectedSlot === 1) {
                    // Baseball bat attack logic
                    isSwingingBat = true;
                    batSwingStartTime = performance.now(); // Record the time when swinging starts

                    const chargeDuration = (performance.now() - chargeStartTime) / 1000; // Calculate charge duration in seconds

                    // Calculate damage and knockback based on charge duration
                    const damage = Math.min(chargeDuration * 20, batDamage); // Cap damage at batDamage
                    const knockback = Math.min(chargeDuration * 3, 15); // Cap knockback at 15

                    // Check collisions with all zombies
                    checkZombieCollision(damage, knockback);
                }
            }
            break;
    }
});

function selectInventorySlot(slotNumber) {
    // Deselect the currently selected slot
    if (selectedSlot > 0) {
        const previousSlot = document.getElementById(`slot-${selectedSlot}`);
        previousSlot.classList.remove('selected');
    }

    // Update the selected slot
    selectedSlot = slotNumber;

    // Highlight the new slot if it's not the fist
    if (selectedSlot > 0) {
        const newSlot = document.getElementById(`slot-${selectedSlot}`);
        newSlot.classList.add('selected');
    }

    // Toggle between fist and bat models
    if (selectedSlot === 0) {
        // Show the fist and hide the bat
        fistCamera.visible = true;
        batCamera.visible = false;
    } else if (selectedSlot === 1) {
        // Show the bat and hide the fist
        fistCamera.visible = false;
        batCamera.visible = true;
    }

    console.log(`Selected slot: ${selectedSlot}`);
}

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

// Helper function to move a zombie
function moveZombie(zombie, boundingBox, health, updateHealthCallback) {
    // Update the zombie's bounding box
    boundingBox.setFromObject(zombie);

    // Check if the zombie is within attack range of the player
    const distanceToPlayer = zombie.position.distanceTo(player.position);
    if (distanceToPlayer <= zombieAttackRange) {
        // Stop the zombie's movement and attack
        zombieAttack(zombie, boundingBox);
        return;
    }

    // Save the zombie's current position
    const previousPosition = zombie.position.clone();

    // Calculate the direction vector from the zombie to the player
    const direction = new THREE.Vector3();
    direction.subVectors(player.position, zombie.position).normalize();

    // Move the zombie toward the player
    zombie.position.x += direction.x * zombieSpeed;
    zombie.position.z += direction.z * zombieSpeed;

    // Update the zombie's bounding box after moving
    boundingBox.setFromObject(zombie);

    // Check for collision with the wall
    if (boundingBox.intersectsBox(wallBoundingBox)) {
        // If there's a collision with the wall, revert to the previous position
        zombie.position.copy(previousPosition);
    }

    // Check for collisions with other zombies
    zombieManager.zombies.forEach((otherZombie) => {
        if (otherZombie.group !== zombie && boundingBox.intersectsBox(otherZombie.boundingBox)) {
            // If there's a collision with another zombie, revert to the previous position
            zombie.position.copy(previousPosition);
        }
    });

    // Make the zombie look at the player
    zombie.lookAt(player.position.x, zombie.position.y, player.position.z);

    // Update health if needed
    updateHealthCallback(health);
}

// Function to apply knockback to the zombie
function applyKnockbackToZombie(zombie, knockback) {
    // Calculate the direction vector from the player to the zombie
    const direction = new THREE.Vector3();
    direction.subVectors(zombie.position, player.position).normalize();

    // Save the zombie's current position
    const originalPosition = zombie.position.clone();

    // Incrementally move the zombie along the knockback direction
    const stepSize = 0.1; // Small step size for collision checking
    let distanceMoved = 0;

    while (distanceMoved < knockback) {
        // Move the zombie by a small step
        zombie.position.x += direction.x * stepSize;
        zombie.position.z += direction.z * stepSize;
        distanceMoved += stepSize;

        // Update the zombie's bounding box
        const boundingBox = new THREE.Box3().setFromObject(zombie);

        // Check for collisions with walls
        if (boundingBox.intersectsBox(wallBoundingBox)) {
            // Revert to the last valid position and stop knockback
            zombie.position.copy(originalPosition);
            break;
        }

        // Check for collisions with other zombies
        let collidedWithOtherZombie = false;
        zombieManager.zombies.forEach((otherZombie) => {
            if (otherZombie.group !== zombie && boundingBox.intersectsBox(otherZombie.boundingBox)) {
                collidedWithOtherZombie = true;
            }
        });

        if (collidedWithOtherZombie) {
            // Revert to the last valid position and stop knockback
            zombie.position.copy(originalPosition);
            break;
        }

        // Update the original position to the current position
        originalPosition.copy(zombie.position);
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

function updateBatDuringCharging() {
    if (isCharging && selectedSlot === 1) { // Check if the bat is selected
        const chargeDuration = (performance.now() - chargeStartTime) / 2000; // Normalize charge duration (2 seconds to reach max charge)
        const scale = Math.min(1 + chargeDuration, 1.5); // Scale the bat slightly during charging

        // Make the bat shake slightly when fully charged
        if (chargeDuration >= 1) {
            const shakeAmount = 0.05 * Math.sin(performance.now() * 10); // Small oscillation
            batCamera.position.x = 0.5 + shakeAmount; // Add shake to the x position
        } else {
            batCamera.position.x = 0.5; // Reset position if not fully charged
        }

        // Scale the bat during charging
        batCamera.scale.set(scale, scale, scale);
    } else if (isSwingingBat) {
        // Handle swinging animation
        const swingDuration = (performance.now() - batSwingStartTime) / 1000;

        if (swingDuration < 0.2) {
            // Swing the bat forward
            batCamera.rotation.z = -Math.PI / 4;
        } else if (swingDuration < 0.4) {
            // Retract the bat back
            batCamera.rotation.z = 0;
        } else {
            // End swinging animation
            isSwingingBat = false;
            batCamera.scale.set(1, 1, 1); // Reset scale
            batCamera.position.set(0.5, -0.5, -1); // Reset position
        }
    }
}

// Function to update health bars
function updateHealthBars() {
    // Update player's health bar
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerHealthPercentage = Math.max(playerHealth / 100, 0); // Ensure it doesn't go below 0
    playerHealthBar.style.width = `${playerHealthPercentage * 100}%`;

    // Update each zombie's health bar
    zombieManager.zombies.forEach((zombie) => {
        const healthPercentage = Math.max(zombie.health / 100, 0); // Ensure it doesn't go below 0
        zombie.group.children.forEach((child) => {
            if (child.geometry instanceof THREE.PlaneGeometry) {
                // Scale the health bar horizontally
                child.scale.x = healthPercentage;

                // Update the health bar color (green if >50%, red otherwise)
                child.material.color.set(healthPercentage > 0.5 ? 0x00ff00 : 0xff0000);
            }
        });
    });
}

// Function to handle zombie death
function handleZombieDeath(zombie, boundingBox) {
    // Replace the zombie with a "corpse"
    const corpseMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for the corpse
    const corpse = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), corpseMaterial);
    corpse.position.copy(zombie.position); // Place the corpse where the zombie died
    scene.add(corpse);

    // Remove the zombie from the scene
    scene.remove(zombie);

    // Reset the zombie's bounding box to prevent further collisions
    boundingBox.makeEmpty(); // Clear the bounding box

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
function zombieAttack(zombie, boundingBox) {
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
            zombie.children[3].position.z -= 0.05; // Left arm
            zombie.children[4].position.z -= 0.05; // Right arm
        } else if (elapsedTime < attackDuration) {
            // Move the arms back
            zombie.children[3].position.z += 0.05;
            zombie.children[4].position.z += 0.05;
        } else {
            // End the attack animation
            clearInterval(attackInterval);
            isZombieAttacking = false;
        }
    }, 16); // Run every 16ms (~60 FPS)

    // Apply damage to the player
    setTimeout(() => {
        if (playerBoundingBox.intersectsBox(boundingBox)) {
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

// Function to pick up the baseball bat
function pickUpBaseballBat() {
    console.log("Baseball bat picked up!");

    // Remove the bat from the scene
    scene.remove(baseballBatGroup);

    // Clear the bat's bounding box
    baseballBatBoundingBox.makeEmpty();

    // Add the bat to the inventory
    selectInventorySlot(1); // Assume slot 1 is for the baseball bat
    const batSlot = document.getElementById('slot-1');
    batSlot.innerText = "Bat"; // Add text to the inventory slot
    batSlot.style.color = "white"; // Set the text color
    batSlot.style.fontSize = "14px"; // Adjust the font size
    batSlot.style.textAlign = "center"; // Center the text
    batSlot.style.lineHeight = "50px"; // Vertically center the text (matches the slot height)

    console.log("Baseball bat added to inventory!");
}

// Modify the animation loop to include player movement and camera updates
function animate() {
    animationId = requestAnimationFrame(animate);

    // Update player position
    updatePlayerPosition();

    // Update camera rotation
    updateCameraRotation();

    // Update zombies
    zombieManager.updateZombies();

    // Update the fist during charging
    updateFistDuringCharging();

    // Update the bat during charging and swinging
    updateBatDuringCharging();

    // Check for collision with the baseball bat
    if (baseballBatBoundingBox.intersectsBox(playerBoundingBox)) {
        pickUpBaseballBat();
    }

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

function checkZombieCollision(damage, knockback) {
    // Iterate through all zombies in the ZombieManager
    zombieManager.zombies.forEach((zombie, index) => {
        if (zombie.health > 0 && playerBoundingBox.intersectsBox(zombie.boundingBox)) {
            // Apply damage to the zombie
            zombie.health -= damage;
            console.log(`Zombie ${index + 1} hit! Damage: ${damage}, Health: ${zombie.health}`);

            // Apply knockback to the zombie
            applyKnockbackToZombie(zombie.group, knockback);

            // Check if the zombie is dead
            if (zombie.health <= 0) {
                zombieManager.handleZombieDeath(index);
            }
        }
    });
}

class ZombieManager {
    constructor() {
        this.zombies = []; // Array to store all zombies
    }

    // Add a new zombie
    addZombie(position) {
        const zombieGroup = new THREE.Group();

        // Generate a random color for the zombie's shirt
        const randomShirtColor = Math.floor(Math.random() * 0xffffff); // Generate a random hex color

        // Zombie body (shirt)
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: randomShirtColor }); // Use the random color
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.25, 0);
        zombieGroup.add(body);

        // Zombie head (dark green skin)
        const headGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.25, 0);
        zombieGroup.add(head);

        // Zombie legs (brown pants)
        const legGeometry = new THREE.BoxGeometry(0.4, 0.75, 0.4);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, 0.375, 0);
        zombieGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, 0.375, 0);
        zombieGroup.add(rightLeg);

        // Zombie arms (dark green skin)
        const armGeometry = new THREE.BoxGeometry(0.3, 0.75, 0.3);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.75, 1.5, 0);
        leftArm.rotation.x = Math.PI / 2;
        zombieGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.75, 1.5, 0);
        rightArm.rotation.x = Math.PI / 2;
        zombieGroup.add(rightArm);

        // Create a zombie health bar
        const zombieHealthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
        const zombieHealthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const zombieHealthBar = new THREE.Mesh(zombieHealthBarGeometry, zombieHealthBarMaterial);
        zombieHealthBar.position.set(0, 3, 0);
        zombieGroup.add(zombieHealthBar);

        // Position the zombie
        zombieGroup.position.copy(position);
        scene.add(zombieGroup);

        // Add the zombie to the array
        this.zombies.push({
            group: zombieGroup,
            health: 100,
            boundingBox: new THREE.Box3().setFromObject(zombieGroup),
        });
    }

    // Update all zombies
    updateZombies() {
        this.zombies.forEach((zombie, index) => {
            if (zombie.health > 0) {
                // Move the zombie
                moveZombie(zombie.group, zombie.boundingBox, zombie.health, (health) => {
                    zombie.health = health;
                });

                // Update the zombie's health bar
                const healthPercentage = Math.max(zombie.health / 100, 0); // Ensure it doesn't go below 0
                zombie.group.children.forEach((child) => {
                    if (child.geometry instanceof THREE.PlaneGeometry) {
                        // Scale the health bar horizontally
                        child.scale.x = healthPercentage;

                        // Update the health bar color (green if >50%, red otherwise)
                        child.material.color.set(healthPercentage > 0.5 ? 0x00ff00 : 0xff0000);
                    }
                });
            } else {
                // Remove dead zombies from the array
                this.handleZombieDeath(index);
            }
        });
    }

    // Handle zombie death
    handleZombieDeath(index) {
        const zombie = this.zombies[index];

        // Replace the zombie with a "corpse"
        const corpseMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const corpse = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), corpseMaterial);
        corpse.position.copy(zombie.group.position);
        scene.add(corpse);

        // Remove the zombie from the scene
        scene.remove(zombie.group);

        // Remove the zombie from the array
        this.zombies.splice(index, 1);

        console.log("Zombie defeated! A corpse has been left behind.");
    }
}

// Update the zombie position function to use the ZombieManager
function updateZombiePosition() {
    zombieManager.updateZombies();
}

// Initialize the ZombieManager
const zombieManager = new ZombieManager();

// Add initial zombies
zombieManager.addZombie(new THREE.Vector3(0, 0, -7)); // First zombie
zombieManager.addZombie(new THREE.Vector3(-3, 0, -7)); // Second zombie
zombieManager.addZombie(new THREE.Vector3(3, 0, -7)); // Third zombie

// Modify the animation loop to include player movement and camera updates
function animate() {
    animationId = requestAnimationFrame(animate);

    // Update player position
    updatePlayerPosition();

    // Update camera rotation
    updateCameraRotation();

    // Update zombies
    zombieManager.updateZombies();

    // Update the fist during charging
    updateFistDuringCharging();

    // Update the bat during charging and swinging
    updateBatDuringCharging();

    // Check for collision with the baseball bat
    if (baseballBatBoundingBox.intersectsBox(playerBoundingBox)) {
        pickUpBaseballBat();
    }

    // Update health bars
    updateHealthBars();

    // Update camera position after all changes
    updateCameraPosition();

    renderer.render(scene, camera);
}

// Start animation
animate();
