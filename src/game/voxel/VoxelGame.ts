/**
 * AI-EDITABLE: Voxel Game Implementation
 *
 * Minecraft-like voxel game with block creation and destruction.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Engine } from '../../engine/Engine';
import type { Game } from '../../engine/Types';
import { VoxelWorld } from './VoxelWorld';
import { FirstPersonCamera } from './FirstPersonCamera';

export class VoxelGame implements Game {
  private engine: Engine;
  private voxelWorld: VoxelWorld;
  private cameraController: FirstPersonCamera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedBlockType: number = 1; // Default block type
  private destroyPointerMesh: THREE.LineSegments | null = null; // Visual pointer for block destruction (red)
  private placePointerMesh: THREE.LineSegments | null = null; // Visual pointer for block placement (green)
  private shigarakiModel: THREE.Group | null = null; // Shigaraki Tomura character model
  private shigarakiVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0); // Shigaraki's movement velocity
  private shigarakiFollowSpeed: number = 4; // Speed at which Shigaraki follows the player
  private decayingBlocks: Map<string, { startTime: number; mesh: THREE.Mesh }> = new Map(); // Blocks that are decaying
  private dustParticles: THREE.Points[] = []; // Dust particle systems

  constructor(engine: Engine) {
    this.engine = engine;

    // Setup PBR-friendly lighting for better material rendering
    this.setupPBRLighting();

    // Initialize raycaster for block selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create voxel world
    this.voxelWorld = new VoxelWorld(engine);

    // Create first-person camera controller
    this.cameraController = new FirstPersonCamera(engine);
    this.cameraController.setVoxelWorld(this.voxelWorld);
    this.cameraController.setPosition(new THREE.Vector3(0, 10, 0));

    // Generate initial terrain
    this.generateTerrain();

    // Setup mouse click handlers for block placement/destruction
    this.setupInputHandlers();

    // Create visual pointer for block placement/destruction
    this.createPointer();

    // Load Shigaraki Tomura character model
    this.loadShigarakiModel();

    console.log('[VoxelGame] Initialized');
  }

  private setupPBRLighting(): void {
    // Hemisphere light for ambient lighting (sky/ground)
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    this.engine.scene.add(hemisphereLight);

    // Directional light for main illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.engine.scene.add(directionalLight);
  }

  private generateTerrain(): void {
    // Generate a simple flat terrain with some variation
    const size = 20;
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        // Create ground layer
        this.voxelWorld.setBlock(x, 0, z, 2); // Grass block
        
        // Add some dirt layers below
        for (let y = -1; y >= -3; y--) {
          this.voxelWorld.setBlock(x, y, z, 3); // Dirt block
        }

        // Add some random blocks for variety
        if (Math.random() > 0.95) {
          const height = Math.floor(Math.random() * 3) + 1;
          for (let y = 1; y <= height; y++) {
            this.voxelWorld.setBlock(x, y, z, 1); // Stone block
          }
        }
      }
    }
  }

  private setupInputHandlers(): void {
    // Handle mouse clicks for block placement/destruction
    window.addEventListener('mousedown', (e) => {
      if (!this.engine.input.isPointerLocked()) {
        return;
      }

      if (e.button === 0) {
        // Left click - destroy block
        this.destroyBlock();
      } else if (e.button === 2) {
        // Right click - place block
        this.placeBlock();
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handle number keys for block type selection
    window.addEventListener('keydown', (e) => {
      const key = e.code;
      if (key >= 'Digit1' && key <= 'Digit9') {
        const blockType = parseInt(key.replace('Digit', ''));
        this.selectedBlockType = blockType;
        console.log(`[VoxelGame] Selected block type: ${blockType}`);
      }
    });
  }

  private getBlockRaycast(screenX?: number, screenY?: number): { 
    hit: boolean; 
    position?: THREE.Vector3; 
    normal?: THREE.Vector3;
    blockPosition?: { x: number; y: number; z: number };
  } {
    // Cast ray from camera through screen position (or center if not provided)
    if (screenX !== undefined && screenY !== undefined) {
      // Convert screen coordinates to normalized device coordinates (-1 to 1)
      const rect = this.engine.renderer.domElement.getBoundingClientRect();
      const normalizedX = ((screenX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((screenY - rect.top) / rect.height) * 2 + 1;
      
      this.mouse.set(normalizedX, normalizedY);
      this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    } else {
      // Default: cast ray from camera forward (center of screen)
      const direction = new THREE.Vector3();
      this.engine.camera.getWorldDirection(direction);
      this.raycaster.set(this.engine.camera.position, direction);
    }
    
    // Get all block meshes from the world
    const blockMeshes = this.voxelWorld.getBlockMeshes();
    
    const intersects = this.raycaster.intersectObjects(blockMeshes, false);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const position = intersect.point.clone();
      const normal = intersect.face?.normal.clone();
      
      if (normal) {
        // Convert normal from local to world space
        if (intersect.object instanceof THREE.Mesh) {
          normal.transformDirection(intersect.object.matrixWorld);
        }
      }
      
      // Get the block position from the intersected mesh
      const mesh = intersect.object as THREE.Mesh;
      const blockPos = mesh.userData.blockPosition;
      
      return { hit: true, position, normal, blockPosition: blockPos };
    }
    
    return { hit: false };
  }

  private destroyBlock(screenX?: number, screenY?: number): void {
    const raycast = this.getBlockRaycast(screenX, screenY);
    
    if (raycast.hit && raycast.blockPosition) {
      this.voxelWorld.removeBlock(
        raycast.blockPosition.x, 
        raycast.blockPosition.y, 
        raycast.blockPosition.z
      );
    }
  }

  private placeBlock(screenX?: number, screenY?: number): void {
    const raycast = this.getBlockRaycast(screenX, screenY);
    
    if (raycast.hit && raycast.position && raycast.normal) {
      // Calculate where to place the block (adjacent to the hit face)
      // Move slightly away from the hit point along the normal
      const blockPos = raycast.position.clone().add(raycast.normal.multiplyScalar(0.5));
      
      // Round to nearest block position
      const x = Math.round(blockPos.x - 0.5);
      const y = Math.round(blockPos.y - 0.5);
      const z = Math.round(blockPos.z - 0.5);
      
      // Check if block already exists
      if (this.voxelWorld.getBlock(x, y, z)) {
        return;
      }
      
      // Check if player is not inside this block
      const playerPos = this.cameraController.getPosition();
      const playerBlockX = Math.floor(playerPos.x);
      const playerBlockY = Math.floor(playerPos.y);
      const playerBlockZ = Math.floor(playerPos.z);
      
      if (x === playerBlockX && y === playerBlockY && z === playerBlockZ) {
        return; // Don't place block where player is
      }
      
      // Also check adjacent blocks to player
      if (Math.abs(x - playerPos.x) < 0.6 && Math.abs(y - playerPos.y) < 1.6 && Math.abs(z - playerPos.z) < 0.6) {
        return; // Don't place block too close to player
      }
      
      // Place the block
      this.voxelWorld.setBlock(x, y, z, this.selectedBlockType);
    }
  }

  private async loadShigarakiModel(): Promise<void> {
    const modelUrl = this.engine.assetLoader.getUrl('tomura_shigaraki_fortnite.glb');
    
    if (!modelUrl) {
      console.warn('[VoxelGame] Shigaraki model not found');
      return;
    }

    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(modelUrl);
      
      // Get the model group
      this.shigarakiModel = gltf.scene;
      
      // Enable shadows for the model
      this.shigarakiModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Position the model in the scene (adjust position as needed)
      // Place it at a visible location, e.g., at origin or slightly offset
      this.shigarakiModel.position.set(0, 1, -5);
      
      // Scale if needed (adjust based on model size)
      // this.shigarakiModel.scale.set(1, 1, 1);
      
      // Add to scene
      this.engine.scene.add(this.shigarakiModel);
      
      console.log('[VoxelGame] Shigaraki Tomura model loaded successfully');
    } catch (error) {
      console.error('[VoxelGame] Failed to load Shigaraki model:', error);
    }
  }

  private updateShigaraki(deltaTime: number): void {
    if (!this.shigarakiModel) return;

    // Get player position
    const playerPos = this.cameraController.getPosition();
    
    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(playerPos, this.shigarakiModel.position);
    direction.y = 0; // Keep movement horizontal
    
    // Calculate distance to player
    const distance = direction.length();
    
    // Only move if not too close to player (maintain some distance)
    const minDistance = 2.0;
    if (distance > minDistance) {
      direction.normalize();
      
      // Apply follow speed
      const moveSpeed = this.shigarakiFollowSpeed;
      this.shigarakiVelocity.x = direction.x * moveSpeed;
      this.shigarakiVelocity.z = direction.z * moveSpeed;
      
      // Move Shigaraki
      const newPosition = this.shigarakiModel.position.clone();
      newPosition.addScaledVector(this.shigarakiVelocity, deltaTime);
      
      // Simple ground check - keep Shigaraki on the ground
      const groundY = this.getGroundHeight(newPosition.x, newPosition.z);
      newPosition.y = groundY + 1; // Adjust based on model height
      
      // Check for block collisions
      const collidingBlock = this.checkShigarakiBlockCollision(newPosition);
      if (collidingBlock) {
        // Mark block as decaying
        this.markBlockForDecay(collidingBlock.x, collidingBlock.y, collidingBlock.z);
      }
      
      // Update position
      this.shigarakiModel.position.copy(newPosition);
      
      // Make Shigaraki face the direction of movement
      if (direction.length() > 0.1) {
        const angle = Math.atan2(direction.x, direction.z);
        this.shigarakiModel.rotation.y = angle;
      }
    } else {
      // Stop moving when close to player
      this.shigarakiVelocity.set(0, 0, 0);
    }
  }

  private getGroundHeight(x: number, z: number): number {
    // Find the highest block at this x, z position
    let maxY = -10;
    for (let y = 20; y >= -10; y--) {
      if (this.voxelWorld.getBlock(Math.floor(x), y, Math.floor(z))) {
        maxY = y;
        break;
      }
    }
    return maxY + 1; // Return top of block
  }

  private checkShigarakiBlockCollision(position: THREE.Vector3): { x: number; y: number; z: number } | null {
    if (!this.shigarakiModel) return null;
    
    // Shigaraki collision box (adjust based on model size)
    const shigarakiWidth = 0.5;
    const shigarakiHeight = 1.5;
    
    // Check blocks that could intersect with Shigaraki's bounding box
    const minX = Math.floor(position.x - shigarakiWidth);
    const maxX = Math.floor(position.x + shigarakiWidth);
    const minY = Math.floor(position.y);
    const maxY = Math.floor(position.y + shigarakiHeight);
    const minZ = Math.floor(position.z - shigarakiWidth);
    const maxZ = Math.floor(position.z + shigarakiWidth);
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (this.voxelWorld.getBlock(x, y, z)) {
            // Check if this block actually intersects with Shigaraki's bounding box
            const blockMinX = x;
            const blockMaxX = x + 1;
            const blockMinY = y;
            const blockMaxY = y + 1;
            const blockMinZ = z;
            const blockMaxZ = z + 1;
            
            const shigarakiMinX = position.x - shigarakiWidth;
            const shigarakiMaxX = position.x + shigarakiWidth;
            const shigarakiMinY = position.y;
            const shigarakiMaxY = position.y + shigarakiHeight;
            const shigarakiMinZ = position.z - shigarakiWidth;
            const shigarakiMaxZ = position.z + shigarakiWidth;
            
            // AABB collision detection
            if (shigarakiMinX < blockMaxX && shigarakiMaxX > blockMinX &&
                shigarakiMinY < blockMaxY && shigarakiMaxY > blockMinY &&
                shigarakiMinZ < blockMaxZ && shigarakiMaxZ > blockMinZ) {
              return { x, y, z };
            }
          }
        }
      }
    }
    
    return null;
  }

  private markBlockForDecay(x: number, y: number, z: number): void {
    const key = `${x},${y},${z}`;
    
    // Don't mark if already decaying
    if (this.decayingBlocks.has(key)) {
      return;
    }
    
    // Find the mesh for this block
    const blockMeshes = this.voxelWorld.getBlockMeshes();
    const mesh = blockMeshes.find((m) => {
      const pos = m.userData.blockPosition;
      return pos && pos.x === x && pos.y === y && pos.z === z;
    });
    
    if (!mesh) return;
    
    // Create dust particle effect
    this.createDustEffect(x + 0.5, y + 0.5, z + 0.5);
    
    // Mark block as decaying
    this.decayingBlocks.set(key, {
      startTime: performance.now(),
      mesh: mesh
    });
  }

  private createDustEffect(x: number, y: number, z: number): void {
    // Create particle system for dust
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Start all particles at the block center
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Random velocity for each particle
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.random() * 2 + 0.5; // Upward velocity
      velocities[i3 + 2] = Math.sin(angle) * speed;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x8b7355, // Dust color (brownish-gray)
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData.startTime = performance.now();
    particles.userData.lifetime = 3.0; // 3 seconds
    particles.userData.velocities = velocities;
    
    this.engine.scene.add(particles);
    this.dustParticles.push(particles);
  }

  private updateDustParticles(deltaTime: number): void {
    const currentTime = performance.now();
    
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const particles = this.dustParticles[i];
      const elapsed = (currentTime - particles.userData.startTime) / 1000;
      const lifetime = particles.userData.lifetime;
      
      if (elapsed >= lifetime) {
        // Remove expired particles
        this.engine.scene.remove(particles);
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
        this.dustParticles.splice(i, 1);
        continue;
      }
      
      // Update particle positions
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const velocities = particles.userData.velocities as Float32Array;
      
      for (let j = 0; j < positions.length; j += 3) {
        positions[j] += velocities[j] * deltaTime;
        positions[j + 1] += velocities[j + 1] * deltaTime;
        velocities[j + 1] -= 9.8 * deltaTime; // Apply gravity
        positions[j + 2] += velocities[j + 2] * deltaTime;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      // Fade out particles over time
      const fadeProgress = elapsed / lifetime;
      const opacity = 0.8 * (1 - fadeProgress);
      (particles.material as THREE.PointsMaterial).opacity = opacity;
    }
  }

  private updateDecayingBlocks(deltaTime: number): void {
    const currentTime = performance.now();
    const decayDuration = 3000; // 3 seconds in milliseconds
    
    for (const [key, blockData] of this.decayingBlocks.entries()) {
      // Check if block still exists (might have been removed by player)
      const [x, y, z] = key.split(',').map(Number);
      if (!this.voxelWorld.getBlock(x, y, z)) {
        // Block was removed, clean up
        this.decayingBlocks.delete(key);
        continue;
      }
      
      // Check if mesh is still valid (might have been disposed)
      if (!blockData.mesh.parent) {
        // Mesh was removed, clean up
        this.decayingBlocks.delete(key);
        continue;
      }
      
      const elapsed = currentTime - blockData.startTime;
      
      if (elapsed >= decayDuration) {
        // Remove the block
        this.voxelWorld.removeBlock(x, y, z);
        this.decayingBlocks.delete(key);
      } else {
        // Animate block decay (make it fade and shrink)
        const progress = elapsed / decayDuration;
        const scale = 1 - progress * 0.5; // Shrink to 50% size
        const opacity = 1 - progress; // Fade out
        
        blockData.mesh.scale.set(scale, scale, scale);
        
        if (blockData.mesh.material instanceof THREE.MeshStandardMaterial) {
          blockData.mesh.material.transparent = true;
          blockData.mesh.material.opacity = opacity;
        }
      }
    }
  }

  private createPointer(): void {
    // Create wireframe box outlines to show where blocks will be placed/destroyed
    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01); // Slightly larger than block to be visible
    const edges = new THREE.EdgesGeometry(geometry);
    
    // Red pointer for block destruction
    const destroyMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    this.destroyPointerMesh = new THREE.LineSegments(edges.clone(), destroyMaterial);
    this.destroyPointerMesh.visible = false;
    this.engine.scene.add(this.destroyPointerMesh);
    
    // Green pointer for block placement
    const placeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    this.placePointerMesh = new THREE.LineSegments(edges.clone(), placeMaterial);
    this.placePointerMesh.visible = false;
    this.engine.scene.add(this.placePointerMesh);
  }

  private updatePointer(): void {
    if (!this.destroyPointerMesh || !this.placePointerMesh) return;

    // Use center of screen for pointer visualization (always shows where you're looking)
    const raycast = this.getBlockRaycast();
    const isPointerLocked = this.engine.input.isPointerLocked();
    const isMobile = this.engine.mobileInput.isMobileControlsActive();

    // Only show pointers when pointer is locked or mobile controls are active
    if (!raycast.hit || (!isPointerLocked && !isMobile)) {
      this.destroyPointerMesh.visible = false;
      this.placePointerMesh.visible = false;
      return;
    }

    // Show red pointer on the block that will be destroyed
    if (raycast.blockPosition) {
      const blockPos = raycast.blockPosition;
      this.destroyPointerMesh.position.set(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
      this.destroyPointerMesh.visible = true;
    } else {
      this.destroyPointerMesh.visible = false;
    }

    // Show green pointer where block will be placed
    if (raycast.position && raycast.normal) {
      const blockPos = raycast.position.clone().add(raycast.normal.multiplyScalar(0.5));
      const x = Math.round(blockPos.x - 0.5);
      const y = Math.round(blockPos.y - 0.5);
      const z = Math.round(blockPos.z - 0.5);
      
      // Check if placement is valid (not inside player, not already occupied)
      const playerPos = this.cameraController.getPosition();
      const playerBlockX = Math.floor(playerPos.x);
      const playerBlockY = Math.floor(playerPos.y);
      const playerBlockZ = Math.floor(playerPos.z);
      
      const isValidPlacement = 
        !this.voxelWorld.getBlock(x, y, z) &&
        !(x === playerBlockX && y === playerBlockY && z === playerBlockZ) &&
        !(Math.abs(x - playerPos.x) < 0.6 && Math.abs(y - playerPos.y) < 1.6 && Math.abs(z - playerPos.z) < 0.6);
      
      if (isValidPlacement) {
        this.placePointerMesh.position.set(x + 0.5, y + 0.5, z + 0.5);
        this.placePointerMesh.visible = true;
      } else {
        this.placePointerMesh.visible = false;
      }
    } else {
      this.placePointerMesh.visible = false;
    }
  }

  update(deltaTime: number): void {
    // Update camera controller (handles movement and rotation)
    this.cameraController.update(deltaTime);

    // Update pointer position
    this.updatePointer();

    // Update Shigaraki follow behavior
    this.updateShigaraki(deltaTime);

    // Update decaying blocks
    this.updateDecayingBlocks(deltaTime);

    // Update dust particles
    this.updateDustParticles(deltaTime);

    // Handle mobile map taps for create/destroy
    if (this.engine.mobileInput.isMobileControlsActive()) {
      const tapResult = this.engine.mobileInput.consumeMapTap();
      if (tapResult.pressed) {
        // Store tap position for raycasting
        const tapScreenX = tapResult.position?.x;
        const tapScreenY = tapResult.position?.y;
        
        if (this.engine.mobileInput.isCreateMode()) {
          this.placeBlock(tapScreenX, tapScreenY);
        } else {
          this.destroyBlock(tapScreenX, tapScreenY);
        }
      }
    }
  }

  onResize(width: number, height: number): void {
    // Camera aspect ratio is handled by engine
  }

  dispose(): void {
    // Clean up pointers
    if (this.destroyPointerMesh) {
      this.engine.scene.remove(this.destroyPointerMesh);
      this.destroyPointerMesh.geometry.dispose();
      (this.destroyPointerMesh.material as THREE.Material).dispose();
      this.destroyPointerMesh = null;
    }
    
    if (this.placePointerMesh) {
      this.engine.scene.remove(this.placePointerMesh);
      this.placePointerMesh.geometry.dispose();
      (this.placePointerMesh.material as THREE.Material).dispose();
      this.placePointerMesh = null;
    }
    
    // Clean up dust particles
    for (const particles of this.dustParticles) {
      this.engine.scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    }
    this.dustParticles = [];
    
    // Clean up Shigaraki model
    if (this.shigarakiModel) {
      this.engine.scene.remove(this.shigarakiModel);
      this.shigarakiModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.shigarakiModel = null;
    }
    
    // Clear decaying blocks
    this.decayingBlocks.clear();
    
    this.voxelWorld.dispose();
    console.log('[VoxelGame] Disposed');
  }
}
