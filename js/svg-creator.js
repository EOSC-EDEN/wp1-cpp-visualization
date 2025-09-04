// js/svg-creator.js

import { relationTypes, nodeRadius } from "./config.js";

/**
 * Creates a sublabel, automatically splitting it into two lines if it's too long.
 * @param {SVGTextElement} parentTextContainer - The parent <text> element.
 * @param {string} subText - The text content for the sublabel.
 */
function createWrappedSublabel(parentTextContainer, subText) {
  if (!subText) {
    return; // Do nothing if there's no sublabel text
  }

  const maxLength = 22; // Max characters before attempting to wrap
  const lineHeight = "1.2em"; // Vertical distance between wrapped lines

  // If the text is short enough, create a single tspan
  if (subText.length <= maxLength) {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    tspan.setAttribute("class", "node-sublabel");
    tspan.setAttribute("x", 0);
    tspan.setAttribute("dy", "1.5em"); // Initial offset from the main label
    tspan.textContent = subText;
    parentTextContainer.appendChild(tspan);
    return;
  }

  // If the text is long, find a good split point and create two tspans
  let splitPoint = subText.lastIndexOf(" ", maxLength);

  // If no space is found before maxLength, force a split at maxLength
  if (splitPoint === -1) {
    splitPoint = maxLength;
  }

  const line1 = subText.substring(0, splitPoint).trim();
  const line2 = subText.substring(splitPoint).trim();

  // Create the first line
  const tspan1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan",
  );
  tspan1.setAttribute("class", "node-sublabel");
  tspan1.setAttribute("x", 0);
  tspan1.setAttribute("dy", "1.5em"); // Initial offset from the main label
  tspan1.textContent = line1;

  // Create the second line
  const tspan2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan",
  );
  tspan2.setAttribute("class", "node-sublabel");
  tspan2.setAttribute("x", 0);
  tspan2.setAttribute("dy", lineHeight); // Relative offset from the first sublabel line
  tspan2.textContent = line2;

  parentTextContainer.appendChild(tspan1);
  parentTextContainer.appendChild(tspan2);
}

export function createMarkers(defs) {
  for (const type in relationTypes) {
    const rel = relationTypes[type];
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );
    marker.id = `arrow-end-${type}`;
    marker.setAttribute("viewBox", "0 -5 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "0");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,-5L10,0L0,5");
    path.style.fill = rel.color;
    marker.appendChild(path);
    defs.appendChild(marker);

    if (rel.arrow === "bidirectional") {
      const markerStart = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker",
      );
      markerStart.id = `arrow-start-${type}`;
      markerStart.setAttribute("viewBox", "0 -5 10 10");
      markerStart.setAttribute("refX", "1");
      markerStart.setAttribute("refY", "0");
      markerStart.setAttribute("markerWidth", "6");
      markerStart.setAttribute("markerHeight", "6");
      markerStart.setAttribute("orient", "auto");
      const pathStart = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      pathStart.setAttribute("d", "M10,-5L0,0L10,5");
      pathStart.style.fill = rel.color;
      markerStart.appendChild(pathStart);
      defs.appendChild(markerStart);
    }
  }
}

export function createClusters(
  clusterInfo,
  nodesData,
  clustersGroup,
  clusterLabelsGroup,
) {
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
}

export function createEdges(edgeMap, edgesGroup, edgeLabelsGroup) {
  edgeMap.forEach((edge) => {
    const edgeGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    edgeGroup.setAttribute("class", "edge-group");
    edgeGroup.id = edge.id;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `edge-path`);
    path.id = edge.id + "-path";
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", "edge-label-text");
    const textPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "textPath",
    );
    textPath.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      "#" + path.id,
    );

    // Get the configuration for the current relation type
    const relationInfo = relationTypes[edge.type];
    // Use arrowLabel if it exists, otherwise fall back to the description
    textPath.textContent = relationInfo.arrowLabel || relationInfo.description;

    textPath.setAttribute("startOffset", "50%");
    text.appendChild(textPath);
    edgeGroup.appendChild(path);
    edgeLabelsGroup.appendChild(text);
    edgesGroup.appendChild(edgeGroup);
    edge.element = path;
    edge.groupElement = edgeGroup;
    edge.textElement = text;
  });
}

export function createNodes(nodesData, nodesGroup, cppLinks) {
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

    // Create the main label tspan
    const tspan1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    tspan1.setAttribute("class", "node-label");
    tspan1.setAttribute("x", 0);
    tspan1.setAttribute("dy", "-0.5em");
    tspan1.textContent = node.label;
    textContainer.appendChild(tspan1);

    // --- MODIFIED: Use the helper function for the sublabel ---
    createWrappedSublabel(textContainer, node.sub);

    group.appendChild(circle);
    group.appendChild(textContainer);

    const link = cppLinks[node.id];
    if (link) {
      const popupGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      popupGroup.setAttribute("class", "popup-group");
      popupGroup.setAttribute("display", "none");

      const popupWidth = 150; // Increased size
      const popupHeight = 45; // Increased size
      const verticalOffset = -nodeRadius - popupHeight - 15;

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("class", "popup-rect");
      rect.setAttribute("x", -popupWidth / 2);
      rect.setAttribute("y", verticalOffset);
      rect.setAttribute("width", popupWidth);
      rect.setAttribute("height", popupHeight);
      rect.setAttribute("rx", 6);

      const connector = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      connector.setAttribute("class", "popup-connector");
      const connectorY = verticalOffset + popupHeight;
      connector.setAttribute(
        "d",
        `M -8 ${connectorY} L 8 ${connectorY} L 0 ${connectorY + 8} Z`,
      );

      const foreignObject = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject",
      );
      foreignObject.setAttribute("x", -popupWidth / 2);
      foreignObject.setAttribute("y", verticalOffset);
      foreignObject.setAttribute("width", popupWidth);
      foreignObject.setAttribute("height", popupHeight);

      const linkContainer = document.createElement("div");
      linkContainer.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      linkContainer.style.width = "100%";
      linkContainer.style.height = "100%";
      linkContainer.style.display = "flex";
      linkContainer.style.alignItems = "center";
      linkContainer.style.justifyContent = "center";

      const anchor = document.createElement("a");
      anchor.setAttribute("href", link);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
      anchor.textContent = "Zenodo link";
      anchor.setAttribute("class", "popup-link");

      anchor.addEventListener("mousedown", (event) => {
        event.stopPropagation();
      });

      linkContainer.appendChild(anchor);
      foreignObject.appendChild(linkContainer);

      popupGroup.appendChild(rect);
      popupGroup.appendChild(connector);
      popupGroup.appendChild(foreignObject);

      group.appendChild(popupGroup);
      node.popupElement = popupGroup;
    }

    nodesGroup.appendChild(group);
    node.element = group;
  });
}
