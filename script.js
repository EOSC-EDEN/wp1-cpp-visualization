async function initializeDiagram() {
  // --- Data Loading and Constants ---
  // --- NEW: Fetch both graph data and CPP links ---
  const [graphDataResponse, linksResponse] = await Promise.all([
    fetch("graph-data.json"),
    fetch("cpp-links.json"),
  ]);

  if (!graphDataResponse.ok) {
    console.error("Failed to load graph-data.json");
    return;
  }
  if (!linksResponse.ok) {
    console.error("Failed to load cpp-links.json");
    return;
  }

  const { nodes: nodesData, edges: edgesData } = await graphDataResponse.json();
  const cppLinks = await linksResponse.json(); // --- NEW: Store the loaded links

  const clusterInfo = {
    planning: { label: "Preservation Planning" },
    dissemination: { label: "Dissemination" },
    "bit-level": { label: "Bit-level Preservation" },
    generation: { label: "Generation of New Files" },
    other: { label: "Other Activities" },
    lifecycle: { label: "Lifecycle Management" },
    characterisation: { label: "Characterisation" },
  };
  const nodeRadius = 100;
  const relationTypes = {
    triggers: { color: "#0d6efd", description: "Triggers" },
    uses: { color: "#6f42c1", description: "Uses / Requires" },
    input_for: { color: "#198754", description: "Is Input For" },
    conceptual: { color: "#fd7e14", description: "Conceptual Link" },
    default: { color: "#cccccc", description: "Relates to" },
  };

  // --- UI and SVG Element Creation ---
  const svg = document.getElementById("cpp-diagram");
  const svgContainer = document.getElementById("svg-container");
  const nodesGroup = document.getElementById("nodes");
  const edgesGroup = document.getElementById("edges");
  const clustersGroup = document.getElementById("clusters");
  const clusterLabelsGroup = document.getElementById("cluster-labels");
  const nodePopup = document.getElementById("node-popup");
  const linePopupsContainer = document.getElementById("line-popups");
  const defs = document.getElementById("arrow-defs");

  for (const type in relationTypes) {
    const color = relationTypes[type].color;
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );
    marker.id = `arrow-${type}`;
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.style.fill = color;
    marker.appendChild(path);
    defs.appendChild(marker);
  }

  const nodeMap = new Map(nodesData.map((n) => [n.id, n]));
  const edgeMap = edgesData.map((e) => ({
    source: nodeMap.get(e.from),
    target: nodeMap.get(e.to),
    type: e.type,
  }));

  // --- NEW: Connector Placement Setup ---
  // Add arrays to each node to track its connections.
  nodesData.forEach((node) => {
    node.outgoingEdges = [];
    node.incomingEdges = [];
  });
  // Populate the arrays.
  edgeMap.forEach((edge) => {
    if (edge.source) edge.source.outgoingEdges.push(edge);
    if (edge.target) edge.target.incomingEdges.push(edge);
  });

  for (const id in clusterInfo) {
    const cluster = clusterInfo[id];
    cluster.nodes = nodesData.filter((n) => n.cluster === id);
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("class", `cluster-circle node-${id}`);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", `cluster-label cluster-label-${id}`);
    text.textContent = cluster.label;
    clustersGroup.appendChild(circle);
    clusterLabelsGroup.appendChild(text);
    cluster.circleElement = circle;
    cluster.textElement = text;
  }

  edgeMap.forEach((edge) => {
    if (!edge.source || !edge.target) return;
    const edgeGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    edgeGroup.setAttribute("class", "edge-group");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `edge-path edge-${edge.type}`);
    path.setAttribute("marker-end", `url(#arrow-default)`);
    edgeGroup.appendChild(path);
    edgesGroup.appendChild(edgeGroup);
    edge.element = path;
    edge.groupElement = edgeGroup;
  });

  nodesData.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "node-group");
    group.id = node.id;
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("class", `node-circle node-${node.cluster}`);
    circle.setAttribute("r", nodeRadius);
    const textContainer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    textContainer.setAttribute("class", "node-text-container");
    const tspan1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    tspan1.setAttribute("class", "node-label");
    tspan1.setAttribute("x", 0);
    tspan1.setAttribute("dy", "-0.5em");
    tspan1.textContent = node.label;
    const tspan2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    tspan2.setAttribute("class", "node-sublabel");
    tspan2.setAttribute("x", 0);
    tspan2.setAttribute("dy", "1.2em");
    tspan2.textContent = node.sub;
    textContainer.appendChild(tspan1);
    textContainer.appendChild(tspan2);
    group.appendChild(circle);
    group.appendChild(textContainer);
    nodesGroup.appendChild(group);
    node.element = group;
  });

  // --- STAGE 1: CLUSTER LAYOUT ---
  function runClusterLayout() {
    for (const id in clusterInfo) {
      const nodeCount = clusterInfo[id].nodes.length;
      clusterInfo[id].radius = Math.sqrt(nodeCount) * nodeRadius * 1.6 + 120;
    }
    const connectivity = {};
    for (const id in clusterInfo) {
      connectivity[id] = 0;
    }
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

  // --- STAGE 2: GEOMETRIC NODE LAYOUT ---
  function runNodeLayout() {
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

  // --- STAGE 3: SVG UPDATE AND RENDERING ---
  function updateSVGPositions() {
    nodesData.forEach((n) => {
      if (n.element)
        n.element.setAttribute("transform", `translate(${n.x},${n.y})`);
    });

    // --- REVISED: This entire loop is updated for better connector logic. ---
    edgeMap.forEach((e) => {
      if (!e.element || !e.source || !e.target) return;

      const source = e.source;
      const target = e.target;

      // --- Part 1: Calculate logical attachment points to avoid overlaps ---
      const sourceEdgeIndex = source.outgoingEdges.indexOf(e);
      const numSourceEdges = source.outgoingEdges.length;
      const targetEdgeIndex = target.incomingEdges.indexOf(e);
      const numTargetEdges = target.incomingEdges.length;

      const maxSpreadAngle = Math.PI / 3; // Max spread of 60 degrees
      const angleSeparation = Math.PI / 18; // 10 degrees between each connector

      const sourceSpread = Math.min(
        maxSpreadAngle,
        (numSourceEdges - 1) * angleSeparation,
      );
      const targetSpread = Math.min(
        maxSpreadAngle,
        (numTargetEdges - 1) * angleSeparation,
      );

      const baseSourceAngle = Math.atan2(
        target.y - source.y,
        target.x - source.x,
      );
      const baseTargetAngle = Math.atan2(
        source.y - target.y,
        source.x - target.x,
      );

      const sourceAngleOffset =
        numSourceEdges > 1
          ? (sourceEdgeIndex / (numSourceEdges - 1) - 0.5) * sourceSpread
          : 0;
      const targetAngleOffset =
        numTargetEdges > 1
          ? (targetEdgeIndex / (numTargetEdges - 1) - 0.5) * targetSpread
          : 0;

      const sourceAttachAngle = baseSourceAngle + sourceAngleOffset;
      const targetAttachAngle = baseTargetAngle + targetAngleOffset;

      const p1c = {
        x: source.x + nodeRadius * Math.cos(sourceAttachAngle),
        y: source.y + nodeRadius * Math.sin(sourceAttachAngle),
      };
      const p2c = {
        x: target.x + nodeRadius * Math.cos(targetAttachAngle),
        y: target.y + nodeRadius * Math.sin(targetAttachAngle),
      };

      // --- Part 2: Calculate curvature based on length ---
      const center_dx = target.x - source.x;
      const center_dy = target.y - source.y;
      const center_dist = Math.sqrt(
        center_dx * center_dx + center_dy * center_dy,
      );

      if (center_dist === 0) return;

      // If nodes are very close, draw a straight line.
      if (center_dist < nodeRadius * 2.5) {
        e.element.setAttribute("d", `M ${p1c.x},${p1c.y} L ${p2c.x},${p2c.y}`);
        e.midPoint = { x: (p1c.x + p2c.x) / 2, y: (p1c.y + p2c.y) / 2 };
      } else {
        // For longer links, calculate a curve.
        const mid = { x: (p1c.x + p2c.x) / 2, y: (p1c.y + p2c.y) / 2 };
        const perp = {
          x: -center_dy / center_dist,
          y: center_dx / center_dist,
        };

        // Curve factor increases with distance, making longer links more curved.
        const curveFactor = center_dist * 0.2;
        const control = {
          x: mid.x + curveFactor * perp.x,
          y: mid.y + curveFactor * perp.y,
        };

        e.element.setAttribute(
          "d",
          `M ${p1c.x},${p1c.y} Q ${control.x},${control.y} ${p2c.x},${p2c.y}`,
        );
        // Update the midpoint for the curved line (used for popup positioning).
        e.midPoint = {
          x: 0.25 * p1c.x + 0.5 * control.x + 0.25 * p2c.x,
          y: 0.25 * p1c.y + 0.5 * control.y + 0.25 * p2c.y,
        };
      }
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

  function centerAndZoom() {
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
      svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
      return { x: newX, y: newY, w: newWidth, h: newHeight };
    }
    return { x: 0, y: 0, w: svg.clientWidth, h: svg.clientHeight };
  }

  // --- Execution ---
  runClusterLayout();
  runNodeLayout();

  // --- NEW: Sort connectors based on final node positions ---
  nodesData.forEach((node) => {
    node.outgoingEdges.sort((a, b) => {
      const angleA = Math.atan2(a.target.y - node.y, a.target.x - node.x);
      const angleB = Math.atan2(b.target.y - node.y, b.target.x - node.x);
      return angleA - angleB;
    });
    node.incomingEdges.sort((a, b) => {
      const angleA = Math.atan2(a.source.y - node.y, a.source.x - node.x);
      const angleB = Math.atan2(b.source.y - node.y, b.source.x - node.x);
      return angleA - angleB;
    });
  });

  updateSVGPositions();
  let viewBox = centerAndZoom();
  let panScale = svg.clientWidth / viewBox.w;

  // --- FINAL Corrected Interaction Logic ---
  let selectedNode = null;

  function clearSelection() {
    if (!selectedNode) return;
    svg.classList.remove("graph--dimmed");
    const oldSelected = document.querySelector(".node--selected");
    if (oldSelected) oldSelected.classList.remove("node--selected");

    document
      .querySelectorAll(".node--related")
      .forEach((el) => el.classList.remove("node--related"));
    document.querySelectorAll(".edge--highlighted").forEach((el) => {
      el.classList.remove("edge--highlighted");
      const path = el.querySelector(".edge-path");
      if (path) path.setAttribute("marker-end", "url(#arrow-default)");
      edgesGroup.insertBefore(el, edgesGroup.firstChild);
    });

    nodePopup.style.display = "none";
    linePopupsContainer.innerHTML = "";
    selectedNode = null;
  }

  function selectNode(node) {
    clearSelection();
    selectedNode = node;

    svg.classList.add("graph--dimmed");
    node.element.classList.add("node--selected");

    const relatedEdges = edgeMap.filter(
      (e) => e.source === node || e.target === node,
    );
    relatedEdges.forEach((edge) => {
      edge.groupElement.classList.add("edge--highlighted");
      edge.element.setAttribute("marker-end", `url(#arrow-${edge.type})`);
      edgesGroup.appendChild(edge.groupElement);

      const neighbor = edge.source === node ? edge.target : edge.source;
      if (neighbor && neighbor.element) {
        neighbor.element.classList.add("node--related");
      }

      const linePopup = document.createElement("div");
      linePopup.className = `popup line-popup popup--${edge.type}`;
      linePopup.textContent =
        relationTypes[edge.type]?.description ||
        relationTypes.default.description;
      linePopupsContainer.appendChild(linePopup);
      linePopup.style.display = "block";
    });

    // --- NEW: Use the loaded links from cpp-links.json ---
    const link = cppLinks[node.id];
    if (link) {
      nodePopup.querySelector("a").href = link;
    } else {
      // Fallback if a link is not found for a given CPP ID
      nodePopup.querySelector("a").href = "#";
      console.warn(`No link found for ${node.id}`);
    }

    updatePopupsOnTransform();
    nodePopup.style.display = "block";
  }

  // --- Pan and Zoom (Persistent Selection) ---
  let isPanning = false;
  let startPoint = { x: 0, y: 0 };

  function svgToScreen(svgPoint) {
    const pt = svg.createSVGPoint();
    pt.x = svgPoint.x;
    pt.y = svgPoint.y;
    return pt.matrixTransform(svg.getScreenCTM());
  }

  function updatePopupsOnTransform() {
    if (!selectedNode) return;

    const nodeScreenPos = svgToScreen(selectedNode);
    nodePopup.style.left = `${nodeScreenPos.x}px`;
    nodePopup.style.top = `${nodeScreenPos.y}px`;

    const relatedEdges = edgeMap.filter(
      (e) => e.source === selectedNode || e.target === selectedNode,
    );
    const linePopupElements = linePopupsContainer.children;
    relatedEdges.forEach((edge, i) => {
      if (linePopupElements[i] && edge.midPoint) {
        const screenPoint = svgToScreen(edge.midPoint);
        linePopupElements[i].style.left = `${screenPoint.x}px`;
        linePopupElements[i].style.top = `${screenPoint.y}px`;
      }
    });
  }

  svgContainer.addEventListener("mousedown", function (evt) {
    if (evt.button !== 0) return;
    const targetNodeElement = evt.target.closest(".node-group");

    if (targetNodeElement) {
      const clickedNode = nodeMap.get(targetNodeElement.id);
      if (clickedNode === selectedNode) {
        clearSelection();
      } else {
        selectNode(clickedNode);
      }
    } else {
      isPanning = true;
      svgContainer.classList.add("grabbing");
      startPoint = { x: evt.clientX, y: evt.clientY };
    }
  });

  svgContainer.addEventListener("mousemove", function (evt) {
    if (!isPanning) return;
    evt.preventDefault();
    const dx = (evt.clientX - startPoint.x) / panScale;
    const dy = (evt.clientY - startPoint.y) / panScale;
    viewBox.x -= dx;
    viewBox.y -= dy;
    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`,
    );
    startPoint = { x: evt.clientX, y: evt.clientY };
    updatePopupsOnTransform();
  });

  const stopPanning = () => {
    isPanning = false;
    svgContainer.classList.remove("grabbing");
  };
  svgContainer.addEventListener("mouseup", stopPanning);
  svgContainer.addEventListener("mouseleave", stopPanning);

  svgContainer.addEventListener("wheel", function (evt) {
    evt.preventDefault();
    const pt = (() => {
      const point = svg.createSVGPoint();
      point.x = evt.clientX;
      point.y = evt.clientY;
      return point.matrixTransform(svg.getScreenCTM().inverse());
    })();

    const scaleChange = evt.deltaY < 0 ? 1 / 1.1 : 1.1;
    viewBox.x = pt.x - (pt.x - viewBox.x) * scaleChange;
    viewBox.y = pt.y - (pt.y - viewBox.y) * scaleChange;
    viewBox.w *= scaleChange;
    viewBox.h *= scaleChange;
    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`,
    );
    panScale = svg.clientWidth / viewBox.w;
    updatePopupsOnTransform();
  });
}

initializeDiagram();
