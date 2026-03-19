const [edgePath, labelX, labelY] = getBezierPath({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  curvature: 0.25, // optional
});