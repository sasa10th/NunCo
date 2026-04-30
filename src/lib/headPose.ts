/**
 * Extract pitch and yaw from MediaPipe's facialTransformationMatrixes.
 * The matrix is a 4x4 column-major transformation matrix.
 */
export function extractHeadPose(matrix: { rows: number; columns: number; data: number[] }): {
  pitch: number;
  yaw: number;
} {
  const m = matrix.data;
  // Column-major 4x4: m[row + col*4]
  // Rotation matrix elements
  const r00 = m[0], r10 = m[1], r20 = m[2];
  const r01 = m[4], r11 = m[5], r21 = m[6];
  const r02 = m[8], r12 = m[9], r22 = m[10];

  // Extract Euler angles (XYZ convention)
  const pitch = Math.atan2(-r12, r22) * (180 / Math.PI); // rotation around X
  const yaw = Math.asin(Math.max(-1, Math.min(1, r02))) * (180 / Math.PI); // rotation around Y

  return { pitch, yaw };
}
