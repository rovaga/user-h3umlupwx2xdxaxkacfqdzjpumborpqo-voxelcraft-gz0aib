/**
 * AI-EDITABLE: Shigaraki Tomura Character
 *
 * Character model for Shigaraki Tomura from "My Hero Academia"
 */

import * as THREE from 'three';
import type { Engine } from '../../engine/Engine';

export class Shigaraki {
  private engine: Engine;
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private baseY: number; // Base Y position for idle animation
  private rotation: number = 0;
  
  // Animation properties
  private idleAnimationTime: number = 0;
  private isIdle: boolean = true;

  constructor(engine: Engine, position: THREE.Vector3 = new THREE.Vector3(5, 1, 5)) {
    this.engine = engine;
    this.position = position.clone();
    this.baseY = position.y;

    // Create character group
    this.mesh = new THREE.Group();
    engine.scene.add(this.mesh);

    // Create Shigaraki's body
    this.createBody();
    
    // Create head with distinctive features
    this.createHead();
    
    // Create hands (Shigaraki's signature feature)
    this.createHands();

    // Position the character
    this.updateMesh();

    console.log('[Shigaraki] Character created');
  }

  private createBody(): void {
    // Torso (dark clothing)
    const torsoGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
    const torsoMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, // Dark gray/black
      roughness: 0.8 
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.4;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, // Slightly lighter dark gray
      roughness: 0.8 
    });
    
    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.3, 0);
    leftLeg.castShadow = true;
    this.mesh.add(leftLeg);
    
    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.3, 0);
    rightLeg.castShadow = true;
    this.mesh.add(rightLeg);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8 
    });
    
    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4, 0.3, 0);
    leftArm.castShadow = true;
    this.mesh.add(leftArm);
    
    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4, 0.3, 0);
    rightArm.castShadow = true;
    this.mesh.add(rightArm);
  }

  private createHead(): void {
    // Head (pale skin)
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5e6d3, // Pale skin tone
      roughness: 0.7 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.0;
    head.castShadow = true;
    this.mesh.add(head);

    // White/gray hair (messy, distinctive)
    const hairGeometry = new THREE.SphereGeometry(0.35, 12, 12);
    const hairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd0d0d0, // Light gray/white
      roughness: 0.9 
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.1;
    hair.position.z = -0.1;
    hair.scale.set(1, 0.8, 1.2); // Make it messy/spiky
    hair.castShadow = true;
    this.mesh.add(hair);

    // Eyes (red, menacing)
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, // Red
      emissive: 0x330000 // Slight glow
    });
    
    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 1.05, 0.25);
    this.mesh.add(leftEye);
    
    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 1.05, 0.25);
    this.mesh.add(rightEye);

    // Hand on face (Shigaraki's signature - hand covering face with palm in mouth)
    this.createFaceHand();
  }

  private createFaceHand(): void {
    // Create a hand group to hold all hand parts
    const handGroup = new THREE.Group();
    
    // Hand material (white/pale skin)
    const handMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, // White hand
      roughness: 0.7 
    });

    // Wrist (positioned lower, connecting to arm area)
    const wristGeometry = new THREE.BoxGeometry(0.12, 0.15, 0.08);
    const wrist = new THREE.Mesh(wristGeometry, handMaterial);
    wrist.position.set(0.12, 0.75, 0.12);
    wrist.rotation.z = 0.3; // Angled upward
    wrist.castShadow = true;
    handGroup.add(wrist);

    // Golden rectangle on wrist (decorative element)
    const goldenRectGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.01);
    const goldenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, // Gold color
      roughness: 0.3,
      metalness: 0.8
    });
    const goldenRect = new THREE.Mesh(goldenRectGeometry, goldenMaterial);
    goldenRect.position.set(0.12, 0.75, 0.17); // On top of wrist
    goldenRect.rotation.z = 0.3; // Match wrist rotation
    handGroup.add(goldenRect);

    // Palm (larger, covering mouth area - positioned so palm is in mouth)
    const palmGeometry = new THREE.BoxGeometry(0.2, 0.24, 0.08);
    const palm = new THREE.Mesh(palmGeometry, handMaterial);
    palm.position.set(0.15, 0.92, 0.25); // Covering mouth area
    palm.rotation.z = -0.15; // Slight tilt
    palm.rotation.x = 0.1; // Slight forward tilt
    palm.castShadow = true;
    handGroup.add(palm);

    // Thumb (positioned to the side, wrapping around face)
    const thumbGeometry = new THREE.BoxGeometry(0.06, 0.13, 0.05);
    const thumb = new THREE.Mesh(thumbGeometry, handMaterial);
    thumb.position.set(0.25, 0.88, 0.22);
    thumb.rotation.z = 0.5;
    thumb.rotation.x = -0.3;
    thumb.rotation.y = 0.2;
    thumb.castShadow = true;
    handGroup.add(thumb);

    // Index finger (open/spread, positioned to reveal left eye)
    const indexFingerGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.04);
    const indexFinger = new THREE.Mesh(indexFingerGeometry, handMaterial);
    indexFinger.position.set(0.18, 1.06, 0.28); // Above left eye area
    indexFinger.rotation.z = -0.4; // Spread outward
    indexFinger.rotation.x = 0.1;
    indexFinger.castShadow = true;
    handGroup.add(indexFinger);

    // Middle finger (open/spread, positioned between eyes)
    const middleFingerGeometry = new THREE.BoxGeometry(0.05, 0.17, 0.04);
    const middleFinger = new THREE.Mesh(middleFingerGeometry, handMaterial);
    middleFinger.position.set(0.15, 1.09, 0.28); // Between eyes
    middleFinger.rotation.z = -0.1; // Slightly spread
    middleFinger.rotation.x = 0.1;
    middleFinger.castShadow = true;
    handGroup.add(middleFinger);

    // Ring finger (open/spread, positioned to reveal right eye)
    const ringFingerGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.04);
    const ringFinger = new THREE.Mesh(ringFingerGeometry, handMaterial);
    ringFinger.position.set(0.12, 1.06, 0.28); // Above right eye area
    ringFinger.rotation.z = 0.2; // Spread outward
    ringFinger.rotation.x = 0.1;
    ringFinger.castShadow = true;
    handGroup.add(ringFinger);

    // Pinky finger (open/spread)
    const pinkyFingerGeometry = new THREE.BoxGeometry(0.04, 0.13, 0.04);
    const pinkyFinger = new THREE.Mesh(pinkyFingerGeometry, handMaterial);
    pinkyFinger.position.set(0.09, 1.03, 0.28);
    pinkyFinger.rotation.z = 0.4; // Spread outward
    pinkyFinger.rotation.x = 0.1;
    pinkyFinger.castShadow = true;
    handGroup.add(pinkyFinger);

    // Position the entire hand group relative to head
    // The hand should be positioned to cover the face from the side
    handGroup.position.set(0, 0, 0); // Position relative to head (head is at y=1.0)
    
    this.mesh.add(handGroup);
  }

  private createHands(): void {
    const handGeometry = new THREE.BoxGeometry(0.12, 0.15, 0.08);
    const handMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5e6d3, // Skin color
      roughness: 0.7 
    });

    // Left hand (at end of left arm)
    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(-0.4, 0.0, 0);
    leftHand.castShadow = true;
    this.mesh.add(leftHand);

    // Right hand (at end of right arm)
    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(0.4, 0.0, 0);
    rightHand.castShadow = true;
    this.mesh.add(rightHand);

    // Additional hands (Shigaraki often has multiple hands)
    // Hand on left shoulder
    const shoulderHand1 = new THREE.Mesh(handGeometry, handMaterial);
    shoulderHand1.position.set(-0.35, 0.6, 0.15);
    shoulderHand1.rotation.z = 0.5;
    shoulderHand1.castShadow = true;
    this.mesh.add(shoulderHand1);

    // Hand on right shoulder
    const shoulderHand2 = new THREE.Mesh(handGeometry, handMaterial);
    shoulderHand2.position.set(0.35, 0.6, 0.15);
    shoulderHand2.rotation.z = -0.5;
    shoulderHand2.castShadow = true;
    this.mesh.add(shoulderHand2);
  }

  update(deltaTime: number): void {
    // Simple idle animation (slight bobbing)
    if (this.isIdle) {
      this.idleAnimationTime += deltaTime;
      const bobAmount = Math.sin(this.idleAnimationTime * 2) * 0.05;
      this.position.y = this.baseY + bobAmount;
    }

    this.updateMesh();
  }

  private updateMesh(): void {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  setPosition(position: THREE.Vector3): void {
    this.position.copy(position);
    this.baseY = position.y;
    this.updateMesh();
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
    this.updateMesh();
  }

  dispose(): void {
    this.engine.scene.remove(this.mesh);
    
    // Dispose all geometries and materials
    this.mesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
    
    console.log('[Shigaraki] Disposed');
  }
}
