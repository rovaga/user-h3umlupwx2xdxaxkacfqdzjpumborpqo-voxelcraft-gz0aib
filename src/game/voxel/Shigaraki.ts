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

    // Eyes (red, menacing) - positioned slightly back so hand can cover them
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, // Red
      emissive: 0x330000 // Slight glow
    });
    
    // Left eye (positioned to be covered by hand)
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 1.05, 0.22); // Slightly further back
    this.mesh.add(leftEye);
    
    // Right eye (positioned to be covered by hand)
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 1.05, 0.22); // Slightly further back
    this.mesh.add(rightEye);

    // Hand on face (Shigaraki's signature - hand covering face with palm in mouth)
    this.createFaceHand();
  }

  private createFaceHand(): void {
    // Create a hand group to hold all hand parts
    const handGroup = new THREE.Group();
    
    // Hand material (white/pale skin - Shigaraki's signature white hand)
    const handMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, // White hand
      roughness: 0.7 
    });

    // Wrist (positioned to connect from arm, angled toward face)
    const wristGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.1);
    const wrist = new THREE.Mesh(wristGeometry, handMaterial);
    wrist.position.set(0.15, 0.65, 0.05);
    wrist.rotation.z = 0.5; // Angled upward toward face
    wrist.rotation.x = 0.2; // Slight forward tilt
    wrist.castShadow = true;
    handGroup.add(wrist);

    // Golden rectangle on wrist (decorative element - Shigaraki's signature)
    const goldenRectGeometry = new THREE.BoxGeometry(0.09, 0.12, 0.01);
    const goldenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, // Gold color
      roughness: 0.3,
      metalness: 0.8
    });
    const goldenRect = new THREE.Mesh(goldenRectGeometry, goldenMaterial);
    goldenRect.position.set(0.15, 0.65, 0.1); // On top of wrist
    goldenRect.rotation.z = 0.5; // Match wrist rotation
    goldenRect.rotation.x = 0.2;
    handGroup.add(goldenRect);

    // Palm (larger, covering the face - positioned to cover from chin to forehead)
    const palmGeometry = new THREE.BoxGeometry(0.22, 0.35, 0.08);
    const palm = new THREE.Mesh(palmGeometry, handMaterial);
    palm.position.set(0.18, 0.95, 0.28); // Centered on face, covering from mouth to forehead
    palm.rotation.z = -0.15; // Slight tilt to match face angle
    palm.rotation.x = 0.2; // Forward tilt to cover face properly
    palm.castShadow = true;
    handGroup.add(palm);

    // Thumb (positioned to the left side, wrapping around the left side of face)
    // Thumb base (proximal phalanx)
    const thumbBaseGeometry = new THREE.BoxGeometry(0.06, 0.1, 0.06);
    const thumbBase = new THREE.Mesh(thumbBaseGeometry, handMaterial);
    thumbBase.position.set(0.28, 0.88, 0.24);
    thumbBase.rotation.z = 0.7; // Angled outward
    thumbBase.rotation.x = -0.15;
    thumbBase.rotation.y = 0.4; // Wrapping around face
    thumbBase.castShadow = true;
    handGroup.add(thumbBase);
    
    // Thumb middle (middle phalanx)
    const thumbMiddleGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.05);
    const thumbMiddle = new THREE.Mesh(thumbMiddleGeometry, handMaterial);
    thumbMiddle.position.set(0.32, 0.85, 0.22);
    thumbMiddle.rotation.z = 0.9;
    thumbMiddle.rotation.x = -0.25;
    thumbMiddle.rotation.y = 0.5;
    thumbMiddle.castShadow = true;
    handGroup.add(thumbMiddle);
    
    // Thumb tip (distal phalanx - extended and curved)
    const thumbTipGeometry = new THREE.BoxGeometry(0.045, 0.12, 0.045);
    const thumbTip = new THREE.Mesh(thumbTipGeometry, handMaterial);
    thumbTip.position.set(0.35, 0.80, 0.20);
    thumbTip.rotation.z = 1.0;
    thumbTip.rotation.x = -0.3;
    thumbTip.rotation.y = 0.6;
    thumbTip.castShadow = true;
    handGroup.add(thumbTip);

    // Index finger (first finger, spread open - positioned above left eye/forehead area)
    // Index finger base
    const indexFingerBaseGeometry = new THREE.BoxGeometry(0.045, 0.1, 0.045);
    const indexFingerBase = new THREE.Mesh(indexFingerBaseGeometry, handMaterial);
    indexFingerBase.position.set(0.24, 1.05, 0.30);
    indexFingerBase.rotation.z = -0.4; // Spread outward to the left
    indexFingerBase.rotation.x = 0.15;
    indexFingerBase.castShadow = true;
    handGroup.add(indexFingerBase);
    
    // Index finger middle
    const indexFingerMiddleGeometry = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const indexFingerMiddle = new THREE.Mesh(indexFingerMiddleGeometry, handMaterial);
    indexFingerMiddle.position.set(0.25, 1.12, 0.32);
    indexFingerMiddle.rotation.z = -0.5;
    indexFingerMiddle.rotation.x = 0.2;
    indexFingerMiddle.castShadow = true;
    handGroup.add(indexFingerMiddle);
    
    // Index finger tip (extended upward)
    const indexFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.13, 0.04);
    const indexFingerTip = new THREE.Mesh(indexFingerTipGeometry, handMaterial);
    indexFingerTip.position.set(0.26, 1.20, 0.34);
    indexFingerTip.rotation.z = -0.6; // Spread outward
    indexFingerTip.rotation.x = 0.25;
    indexFingerTip.castShadow = true;
    handGroup.add(indexFingerTip);

    // Middle finger (longest finger, spread open - positioned at center/forehead)
    // Middle finger base
    const middleFingerBaseGeometry = new THREE.BoxGeometry(0.045, 0.1, 0.045);
    const middleFingerBase = new THREE.Mesh(middleFingerBaseGeometry, handMaterial);
    middleFingerBase.position.set(0.18, 1.08, 0.30);
    middleFingerBase.rotation.z = -0.1; // Slightly spread
    middleFingerBase.rotation.x = 0.15;
    middleFingerBase.castShadow = true;
    handGroup.add(middleFingerBase);
    
    // Middle finger middle
    const middleFingerMiddleGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.04);
    const middleFingerMiddle = new THREE.Mesh(middleFingerMiddleGeometry, handMaterial);
    middleFingerMiddle.position.set(0.18, 1.18, 0.32);
    middleFingerMiddle.rotation.z = -0.15;
    middleFingerMiddle.rotation.x = 0.2;
    middleFingerMiddle.castShadow = true;
    handGroup.add(middleFingerMiddle);
    
    // Middle finger tip (longest, extended upward)
    const middleFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.16, 0.04);
    const middleFingerTip = new THREE.Mesh(middleFingerTipGeometry, handMaterial);
    middleFingerTip.position.set(0.18, 1.28, 0.34);
    middleFingerTip.rotation.z = -0.2; // Slightly spread
    middleFingerTip.rotation.x = 0.25;
    middleFingerTip.castShadow = true;
    handGroup.add(middleFingerTip);

    // Ring finger (fourth finger, spread open - positioned above right eye area)
    // Ring finger base
    const ringFingerBaseGeometry = new THREE.BoxGeometry(0.045, 0.1, 0.045);
    const ringFingerBase = new THREE.Mesh(ringFingerBaseGeometry, handMaterial);
    ringFingerBase.position.set(0.12, 1.05, 0.30);
    ringFingerBase.rotation.z = 0.3; // Spread outward to the right
    ringFingerBase.rotation.x = 0.15;
    ringFingerBase.castShadow = true;
    handGroup.add(ringFingerBase);
    
    // Ring finger middle
    const ringFingerMiddleGeometry = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const ringFingerMiddle = new THREE.Mesh(ringFingerMiddleGeometry, handMaterial);
    ringFingerMiddle.position.set(0.11, 1.12, 0.32);
    ringFingerMiddle.rotation.z = 0.4;
    ringFingerMiddle.rotation.x = 0.2;
    ringFingerMiddle.castShadow = true;
    handGroup.add(ringFingerMiddle);
    
    // Ring finger tip
    const ringFingerTipGeometry = new THREE.BoxGeometry(0.04, 0.13, 0.04);
    const ringFingerTip = new THREE.Mesh(ringFingerTipGeometry, handMaterial);
    ringFingerTip.position.set(0.10, 1.20, 0.34);
    ringFingerTip.rotation.z = 0.5; // Spread outward
    ringFingerTip.rotation.x = 0.25;
    ringFingerTip.castShadow = true;
    handGroup.add(ringFingerTip);

    // Pinky finger (fifth finger, smallest, spread open - positioned to the right)
    // Pinky finger base
    const pinkyFingerBaseGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const pinkyFingerBase = new THREE.Mesh(pinkyFingerBaseGeometry, handMaterial);
    pinkyFingerBase.position.set(0.06, 1.02, 0.30);
    pinkyFingerBase.rotation.z = 0.6; // Spread outward to the right
    pinkyFingerBase.rotation.x = 0.15;
    pinkyFingerBase.castShadow = true;
    handGroup.add(pinkyFingerBase);
    
    // Pinky finger middle
    const pinkyFingerMiddleGeometry = new THREE.BoxGeometry(0.035, 0.09, 0.035);
    const pinkyFingerMiddle = new THREE.Mesh(pinkyFingerMiddleGeometry, handMaterial);
    pinkyFingerMiddle.position.set(0.05, 1.08, 0.32);
    pinkyFingerMiddle.rotation.z = 0.7;
    pinkyFingerMiddle.rotation.x = 0.2;
    pinkyFingerMiddle.castShadow = true;
    handGroup.add(pinkyFingerMiddle);
    
    // Pinky finger tip
    const pinkyFingerTipGeometry = new THREE.BoxGeometry(0.035, 0.12, 0.035);
    const pinkyFingerTip = new THREE.Mesh(pinkyFingerTipGeometry, handMaterial);
    pinkyFingerTip.position.set(0.04, 1.15, 0.34);
    pinkyFingerTip.rotation.z = 0.8; // Spread outward
    pinkyFingerTip.rotation.x = 0.25;
    pinkyFingerTip.castShadow = true;
    handGroup.add(pinkyFingerTip);

    // Position the entire hand group relative to head
    // The hand should be positioned to cover the face from the front/side
    // Hand is positioned to cover from chin (around y=0.7) to forehead (around y=1.3)
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
