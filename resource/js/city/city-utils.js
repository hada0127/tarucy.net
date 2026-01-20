/**
 * city-utils.js
 * Three.js utility functions for creating occluded wireframes
 */

import * as THREE from 'three';

// Wire colors and opacity
export const wireColor = 0xffffff;
export const wireOpacity = 0.9;

// Depth mask material for proper occlusion
export const depthMaskMaterial = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: true,
  side: THREE.DoubleSide
});

/**
 * Creates a wireframe mesh with proper depth occlusion
 * @param {THREE.BufferGeometry} geometry - The geometry to create wireframe from
 * @param {number} color - Wire color (default: wireColor)
 * @param {number} opacity - Wire opacity (default: wireOpacity)
 * @returns {THREE.Group} Group containing depth mask and wireframe
 */
export function createOccludedWireframe(geometry, color = wireColor, opacity = wireOpacity) {
  const group = new THREE.Group();

  // Depth mask for occlusion
  const depthMask = new THREE.Mesh(geometry, depthMaskMaterial);
  depthMask.renderOrder = 0;
  group.add(depthMask);

  // Wireframe edges
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    depthTest: true
  });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  wireframe.renderOrder = 1;
  group.add(wireframe);

  return group;
}

/**
 * Creates a canvas texture with Korean text
 * @param {string} text - The text to render
 * @param {object} options - Options for text rendering
 * @returns {THREE.CanvasTexture} The generated texture
 */
export function createTextTexture(text, options = {}) {
  const {
    width = 512,
    height = 256,
    fontSize = 48,
    fontFamily = 'IBMPlexSansKR, sans-serif',
    color = '#ffffff',
    backgroundColor = 'transparent',
    padding = 20,
    align = 'center',
    lineHeight = 1.3
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Text setup
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  // Multi-line text support
  const lines = text.split('\n');
  const totalHeight = lines.length * fontSize * lineHeight;
  const startY = (height - totalHeight) / 2 + fontSize / 2;

  lines.forEach((line, index) => {
    const x = align === 'center' ? width / 2 : padding;
    const y = startY + index * fontSize * lineHeight;
    ctx.fillText(line, x, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * Smooth easing function for animations
 * @param {number} t - Progress value (0-1)
 * @returns {number} Eased value
 */
export function easeInOutCubic(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}
