// js/graph-layout.js

import { relationTypes, nodeRadius } from "./config.js";

export function generateAndGroupEdges(relations, nodes) {
  const allEdges = [];
  const parallelEdgeGroups = new Map();
  const addedEdges = new Set();
  for (const sourceId in relations) {
    const sourceNode = nodes.get(sourceId);
    if (!sourceNode) continue;
    for (const type in relations[sourceId]) {
      if (!relations[sourceId][type]) continue;
      const relStyle = relationTypes[type];
      relations[sourceId][type].forEach((targetId) => {
        const targetNode = nodes.get(targetId);
        if (!targetNode) return;
        let edgeSource = sourceNode,
          edgeTarget = targetNode;
        if (relStyle.arrow === "incoming")
          [edgeSource, edgeTarget] = [targetNode, sourceNode];
        const isBidirectional = relStyle.arrow === "bidirectional";
        const edgeKey = isBidirectional
          ? [sourceId, targetId].sort().join("--")
          : `${edgeSource.id}--${edgeTarget.id}`;
        const fullEdgeKey = `${edgeKey}::${type}::${sourceId}`;
        if (addedEdges.has(fullEdgeKey)) return;
        addedEdges.add(fullEdgeKey);
        const edge = {
          source: edgeSource,
          target: edgeTarget,
          type,
          id: fullEdgeKey,
          definedOn: sourceNode,
        };
        allEdges.push(edge);
        const parallelKey = [sourceId, targetId].sort().join("--");
        if (!parallelEdgeGroups.has(parallelKey))
          parallelEdgeGroups.set(parallelKey, []);
        parallelEdgeGroups.get(parallelKey).push(edge);
      });
    }
  }
  return { allEdges, parallelEdgeGroups };
}

export function runClusterLayout(clusterInfo, edgeMap) {
  for (const id in clusterInfo) {
    const nodeCount = clusterInfo[id].nodes.length;
    clusterInfo[id].radius = Math.sqrt(nodeCount) * nodeRadius * 1.6 + 120;
  }
  const connectivity = {};
  for (const id in clusterInfo) connectivity[id] = 0;
  edgeMap.forEach((edge) => {
    if (
      edge.source &&
      edge.target &&
      edge.source.cluster !== edge.target.cluster
    ) {
      connectivity[edge.source.cluster]++;
      connectivity[edge.target.cluster]++;
    }
  });
  const sortedClusters = Object.keys(connectivity).sort(
    (a, b) => connectivity[b] - connectivity[a],
  );
  const centralClusterId = sortedClusters[0];
  const otherClusterIds = sortedClusters.slice(1);
  clusterInfo[centralClusterId].cx = 0;
  clusterInfo[centralClusterId].cy = 0;
  const initialMetaRadius = clusterInfo[centralClusterId].radius + 400;
  const angleStep = (2 * Math.PI) / otherClusterIds.length;
  otherClusterIds.forEach((id, i) => {
    const angle = i * angleStep;
    clusterInfo[id].cx = initialMetaRadius * Math.cos(angle);
    clusterInfo[id].cy = initialMetaRadius * Math.sin(angle);
  });
  for (let iter = 0; iter < 250; iter++) {
    for (const idA of sortedClusters) {
      for (const idB of sortedClusters) {
        if (idA >= idB) continue;
        const cA = clusterInfo[idA];
        const cB = clusterInfo[idB];
        const dx = cA.cx - cB.cx;
        const dy = cA.cy - cB.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = cA.radius + cB.radius + 60;
        if (dist < minDist) {
          const overlap = minDist - dist;
          const force = overlap * 0.1;
          const forceX = (dx / dist) * force;
          const forceY = (dy / dist) * force;
          if (idA !== centralClusterId) {
            cA.cx += forceX;
            cA.cy += forceY;
          }
          if (idB !== centralClusterId) {
            cB.cx -= forceX;
            cB.cy -= forceY;
          }
        }
      }
    }
  }
}

export function runNodeLayout(clusterInfo) {
  for (const id in clusterInfo) {
    const cluster = clusterInfo[id];
    const clusterNodes = cluster.nodes;
    const nodeCount = clusterNodes.length;
    if (nodeCount === 0) continue;
    if (nodeCount === 1) {
      clusterNodes[0].x = cluster.cx;
      clusterNodes[0].y = cluster.cy;
      continue;
    }
    const nodeCircleRadius = Math.max(
      cluster.radius - nodeRadius - 40,
      nodeRadius,
    );
    const angleStepNode = (2 * Math.PI) / nodeCount;
    clusterNodes.forEach((node, i) => {
      const angle = i * angleStepNode;
      node.x = cluster.cx + nodeCircleRadius * Math.cos(angle);
      node.y = cluster.cy + nodeCircleRadius * Math.sin(angle);
    });
  }
}
