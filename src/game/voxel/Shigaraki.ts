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
    const wristGeometry = new THREE.BoxGeometry(0.1, 0.12, 0.08);
    const wrist = new THREE.Mesh(wristGeometry, handMaterial);
    wrist.position.set(0.1, 0.7, 0.1);
    wrist.rotation.z = 0.4; // Angled upward toward face
    wrist.castShadow = true;
    handGroup.add(wrist);

    // Golden rectangle on wrist (decorative element)
    const goldenRectGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.01);
    const goldenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, // Gold color
      roughness: 0.3,
      metalness: 0.8
    });
    const goldenRect = new THREE.Mesh(goldenRectGeometry, goldenMaterial);
    goldenRect.position.set(0.1, 0.7, 0.15); // On top of wrist
    goldenRect.rotation.z = 0.4; // Match wrist rotation
    handGroup.add(goldenRect);

    // Palm (covering lower face/mouth area)
    const palmGeometry = new THREE.BoxGeometry(0.18, 0.2, 0.06);
    const palm = new THREE.Mesh(palmGeometry, handMaterial);
    palm.position.set(0.12, 0.88, 0.22); // Covering mouth area
    palm.rotation.z = -0.1; // Slight tilt
    palm.rotation.x = 0.15; // Forward tilt to cover face
    palm.castShadow = true;
    handGroup.add(palm);

    // Thumb (positioned to the left side, wrapping around face)
    // Thumb base
    const thumbBaseGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.05);
    const thumbBase = new THREE.Mesh(thumbBaseGeometry, handMaterial);
    thumbBase.position.set(0.22, 0.85, 0.2);
    thumbBase.rotation.z = 0.6;
    thumbBase.rotation.x = -0.2;
    thumbBase.rotation.y = 0.3;
    thumbBase.castShadow = true;
    handGroup.add(thumbBase);
    
    // Thumb tip (extended)
    const thumbTipGeometry = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const thumbTip = new THREE.Mesh(thumbTipGeometry, handMaterial);
    thumbTip.position.set(0.26, 0.82, 0.18);
    thumbTip.rotation.z = 0.8;
    thumbTip.rotation.x = -0.3;
    thumbTip.rotation.y = 0.4;
    thumbTip.castShadow = true;
    handGroup.add(thumbTip);

    // Index finger (first finger, spread open - positioned above left eye area)
    const indexFingerBaseGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const indexFingerBase = new THREE.Mesh(indexFingerBaseGeometry, handMaterial);
    indexFingerBase.position.set(0.18, 0.98, 0.25);
    indexFingerBase.rotation.z = -0.3; // Spread outward
    indexFingerBase.rotation.x = 0.1;
    indexFingerBase.castShadow = true;
    handGroup.add(indexFingerBase);
    
    const indexFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.04);
    const indexFingerTip = new THREE.Mesh(indexFingerTipGeometry, handMaterial);
    indexFingerTip.position.set(0.19, 1.08, 0.27);
    indexFingerTip.rotation.z = -0.4; // Spread outward
    indexFingerTip.rotation.x = 0.15;
    indexFingerTip.castShadow = true;
    handGroup.add(indexFingerTip);

    // Middle finger (longest finger, spread open - positioned at center/forehead)
    const middleFingerBaseGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const middleFingerBase = new THREE.Mesh(middleFingerBaseGeometry, handMaterial);
    middleFingerBase.position.set(0.14, 1.0, 0.25);
    middleFingerBase.rotation.z = -0.05; // Slightly spread
    middleFingerBase.rotation.x = 0.1;
    middleFingerBase.castShadow = true;
    handGroup.add(middleFingerBase);
    
    const middleFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.14, 0.04);
    const middleFingerTip = new THREE.Mesh(middleFingerTipGeometry, handMaterial);
    middleFingerTip.position.set(0.14, 1.12, 0.27);
    middleFingerTip.rotation.z = -0.1; // Slightly spread
    middleFingerTip.rotation.x = 0.15;
    middleFingerTip.castShadow = true;
    handGroup.add(middleFingerTip);

    // Ring finger (fourth finger, spread open - positioned above right eye area)
    const ringFingerBaseGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const ringFingerBase = new THREE.Mesh(ringFingerBaseGeometry, handMaterial);
    ringFingerBase.position.set(0.10, 0.98, 0.25);
    ringFingerBase.rotation.z = 0.25; // Spread outward
    ringFingerBase.rotation.x = 0.1;
    ringFingerBase.castShadow = true;
    handGroup.add(ringFingerBase);
    
    const ringFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.04);
    const ringFingerTip = new THREE.Mesh(ringFingerTipGeometry, handMaterial);
    ringFingerTip.position.set(0.09, 1.08, 0.27);
    ringFingerTip.rotation.z = 0.3; // Spread outward
    ringFingerTip.rotation.x = 0.15;
    ringFingerTip.castShadow = true;
    handGroup.add(ringFingerTip);

    // Pinky finger (fifth finger, smallest, spread open - positioned to the right)
    const pinkyFingerBaseGeometry = new THREE.BoxGeometry(0.035, 0.07, 0.035);
    const pinkyFingerBase = new THREE.Mesh(pinkyFingerBaseGeometry, handMaterial);
    pinkyFingerBase.position.set(0.06, 0.95, 0.25);
    pinkyFingerBase.rotation.z = 0.5; // Spread outward
    pinkyFingerBase.rotation.x = 0.1;
    pinkyFingerBase.castShadow = true;
    handGroup.add(pinkyFingerBase);
    
    const pinkyFingerTipGeometry = new THREE.BoxGeometry(0.035, 0.11, 0.035);
    const pinkyFingerTip = new THREE.Mesh(pinkyFingerTipGeometry, handMaterial);
    pinkyFingerTip.position.set(0.05, 1.04, 0.27);
    pinkyFingerTip.rotation.z = 0.6; // Spread outward
    pinkyFingerTip.rotation.x = 0.15;
    pinkyFingerTip.castShadow = true;
    handGroup.add(pinkyFingerTip);

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
