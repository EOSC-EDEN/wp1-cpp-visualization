// js/graph-renderer.js

import { nodeRadius } from "./config.js";

export function updateSVGPositions(nodesData, parallelEdgeGroups, clusterInfo) {
  nodesData.forEach((n) => {
    if (n.element)
      n.element.setAttribute("transform", `translate(${n.x},${n.y})`);
  });

  parallelEdgeGroups.forEach((group) => {
    const count = group.length;
    if (count === 0) {
      return;
    }

    const refSource = group[0].source;
    const refTarget = group[0].target;

    const refDx = refTarget.x - refSource.x;
    const refDy = refTarget.y - refSource.y;
    const refDist = Math.sqrt(refDx * refDx + refDy * refDy);

    if (refDist === 0) {
      return;
    }

    const perp = { x: -refDy / refDist, y: refDx / refDist };

    group.forEach((edge, index) => {
      if (!edge.element || !edge.source || !edge.target) return;

      const { source, target } = edge;
      const curveOffset = index - (count - 1) / 2.0;

      const mid = {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2,
      };

      const controlPoint = {
        x: mid.x + curveOffset * 60 * perp.x,
        y: mid.y + curveOffset * 60 * perp.y,
      };

      const angle1 = Math.atan2(
        controlPoint.y - source.y,
        controlPoint.x - source.x,
      );
      const angle2 = Math.atan2(
        controlPoint.y - target.y,
        controlPoint.x - target.x,
      );
      const p1c = {
        x: source.x + nodeRadius * Math.cos(angle1),
        y: source.y + nodeRadius * Math.sin(angle1),
      };
      const p2c = {
        x: target.x + nodeRadius * Math.cos(angle2),
        y: target.y + nodeRadius * Math.sin(angle2),
      };
      const reversePath = source.x > target.x;
      edge.isReversed = reversePath;
      if (reversePath) {
        edge.element.setAttribute(
          "d",
          `M ${p2c.x},${p2c.y} Q ${controlPoint.x},${controlPoint.y} ${p1c.x},${p1c.y}`,
        );
      } else {
        edge.element.setAttribute(
          "d",
          `M ${p1c.x},${p1c.y} Q ${controlPoint.x},${controlPoint.y} ${p2c.x},${p2c.y}`,
        );
      }
    });
  });

  for (const id in clusterInfo) {
    const c = clusterInfo[id];
    c.circleElement.setAttribute("cx", c.cx);
    c.circleElement.setAttribute("cy", c.cy);
    c.circleElement.setAttribute("r", c.radius);
    c.textElement.setAttribute("x", c.cx);
    c.textElement.setAttribute("y", c.cy - c.radius - 20);
  }
}

export function centerAndZoom(svg, clusterInfo) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const id in clusterInfo) {
    const c = clusterInfo[id];
    if (!c.radius) continue;
    minX = Math.min(minX, c.cx - c.radius);
    minY = Math.min(minY, c.cy - c.radius);
    maxX = Math.max(maxX, c.cx + c.radius);
    maxY = Math.max(maxY, c.cy + c.radius);
  }
  if (isFinite(minX)) {
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const finalScale =
      Math.min(
        svg.clientWidth / contentWidth,
        svg.clientHeight / contentHeight,
      ) * 0.95;
    const newWidth = svg.clientWidth / finalScale;
    const newHeight = svg.clientHeight / finalScale;
    const newX = minX - (newWidth - contentWidth) / 2;
    const newY = minY - (newHeight - contentHeight) / 2;
    const viewBox = { x: newX, y: newY, w: newWidth, h: newHeight };
    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`,
    );
    return viewBox;
  }
  return { x: 0, y: 0, w: svg.clientWidth, h: svg.clientHeight };
}
