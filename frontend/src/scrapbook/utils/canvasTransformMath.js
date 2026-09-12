/**
 * Canvas geometry and trigonometry math helpers for
 * drag-move, rotation, and corner-pinned affine resizing.
 */

/**
 * Initializes state for corner resize based on the dragged handle ('nw', 'ne', 'sw', 'se')
 * and current element rotation.
 */
export function calculateResizeInit({ el, handle, domEl }) {
  const origW = el.width || domEl.offsetWidth || 100
  const origH = el.height || domEl.offsetHeight || 100
  const origRot = el.rotation || 0
  const rad = (origRot * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const origCx = (el.x || 0) + origW / 2
  const origCy = (el.y || 0) + origH / 2

  const hw = origW / 2
  const hh = origH / 2

  let anchorLx = 0
  let anchorLy = 0
  let handleLx = 0
  let handleLy = 0

  if (handle === 'se') {
    anchorLx = -hw
    anchorLy = -hh // Fixed Anchor: Top-Left
    handleLx = hw
    handleLy = hh // Drag Handle: Bottom-Right
  } else if (handle === 'sw') {
    anchorLx = hw
    anchorLy = -hh // Fixed Anchor: Top-Right
    handleLx = -hw
    handleLy = hh // Drag Handle: Bottom-Left
  } else if (handle === 'ne') {
    anchorLx = -hw
    anchorLy = hh // Fixed Anchor: Bottom-Left
    handleLx = hw
    handleLy = -hh // Drag Handle: Top-Right
  } else if (handle === 'nw') {
    anchorLx = hw
    anchorLy = hh // Fixed Anchor: Bottom-Right
    handleLx = -hw
    handleLy = -hh // Drag Handle: Top-Left
  }

  // Exact canvas coordinate of the opposite anchor corner
  const anchorAx = origCx + (anchorLx * cos - anchorLy * sin)
  const anchorAy = origCy + (anchorLx * sin + anchorLy * cos)

  // Diagonal direction vector v0 from Anchor to Handle in canvas space
  const handlePosCanvasX = origCx + (handleLx * cos - handleLy * sin)
  const handlePosCanvasY = origCy + (handleLx * sin + handleLy * cos)
  const v0x = handlePosCanvasX - anchorAx
  const v0y = handlePosCanvasY - anchorAy
  const L0sq = Math.max(1, v0x * v0x + v0y * v0y)

  return {
    origW,
    origH,
    cos,
    sin,
    anchorAx,
    anchorAy,
    v0x,
    v0y,
    L0sq,
    anchorLx,
    anchorLy,
  }
}

/**
 * Calculates updated position and dimensions during an active resize drag.
 */
export function calculateResizeStep({ clientX, clientY, canvasRect, scale, transformState }) {
  const mouseCanvasX = (clientX - canvasRect.left) / scale
  const mouseCanvasY = (clientY - canvasRect.top) / scale

  const {
    origW,
    origH,
    cos,
    sin,
    anchorAx,
    anchorAy,
    v0x,
    v0y,
    L0sq,
    anchorLx,
    anchorLy,
  } = transformState

  // Vector from Anchor A to mouse
  const dx = mouseCanvasX - anchorAx
  const dy = mouseCanvasY - anchorAy

  // Project (dx, dy) onto diagonal vector v0
  const proj = (dx * v0x + dy * v0y) / L0sq
  const scaleFactor = Math.max(0.2, proj)

  const newW = Math.max(30, Math.round(origW * scaleFactor))
  const newH = Math.max(20, Math.round(origH * scaleFactor))

  // In the new state, anchor A is at offset (anchorLx * scaleFactor, anchorLy * scaleFactor) from new center C'
  const curAnchorLx = anchorLx * scaleFactor
  const curAnchorLy = anchorLy * scaleFactor

  const newCx = anchorAx - (curAnchorLx * cos - curAnchorLy * sin)
  const newCy = anchorAy - (curAnchorLx * sin + curAnchorLy * cos)

  const newX = Math.round(newCx - newW / 2)
  const newY = Math.round(newCy - newH / 2)

  return { newX, newY, newW, newH }
}

/**
 * Calculates updated rotation angle during an active rotate drag.
 */
export function calculateRotateStep({ clientX, clientY, shiftKey, transformState }) {
  const currentAngle =
    Math.atan2(
      clientY - transformState.centerY,
      clientX - transformState.centerX
    ) * (180 / Math.PI)

  const angleDelta = currentAngle - transformState.startAngle
  let newRotation = transformState.origRotation + angleDelta

  if (shiftKey) {
    newRotation = Math.round(newRotation / 15) * 15
  } else {
    newRotation = Math.round(newRotation)
  }

  // Normalize to [-180, 180]
  newRotation = ((((newRotation + 180) % 360) + 360) % 360) - 180

  return newRotation
}

/**
 * Calculates updated x, y position during an active move drag.
 */
export function calculateMoveStep({ clientX, clientY, scale, transformState }) {
  const deltaX = (clientX - transformState.startX) / scale
  const deltaY = (clientY - transformState.startY) / scale

  return {
    newX: Math.round(transformState.origX + deltaX),
    newY: Math.round(transformState.origY + deltaY),
  }
}
