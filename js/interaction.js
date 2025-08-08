// js/interaction.js

import { relationTypes, nodeRadius } from "./config.js";

export function initializeInteractions(state) {
  let selectedNode = null;
  const highlightedEdges = new Set();
  let isPanning = false;
  let startPoint = { x: 0, y: 0 };
  let panScale = state.svg.clientWidth / state.viewBox.w;

  const edgesGroup = document.getElementById("edges");
  const edgeLabelsGroup = document.getElementById("edge-labels");
  const highlightedEdgesGroup = document.getElementById("highlighted-edges");
  const highlightedEdgeLabelsGroup = document.getElementById(
    "highlighted-edge-labels",
  );

  function clearSelection() {
    if (!selectedNode) return;
    state.svg.classList.remove("graph--dimmed");
    document.querySelector(".node--selected")?.classList.remove("node--selected");
    
    // Hide the popup of the previously selected node
    if (selectedNode.popupElement) {
      selectedNode.popupElement.setAttribute("display", "none");
    }

    document.querySelectorAll(".node--related").forEach((el) => el.classList.remove("node--related"));
    highlightedEdges.forEach((edge) => {
      edgesGroup.appendChild(edge.groupElement);
      edgeLabelsGroup.appendChild(edge.textElement);
      edge.groupElement.classList.remove("edge--highlighted");
      const path = edge.groupElement.querySelector(".edge-path");
      path.removeAttribute("marker-start");
      path.removeAttribute("marker-end");
      path.style.stroke = "";
      edge.textElement.style.fill = "";
      path.classList.remove(...Object.keys(relationTypes));
      edge.textElement.style.display = "none";
    });
    highlightedEdges.clear();
    selectedNode = null;
  }

  function selectNode(node) {
    clearSelection();
    selectedNode = node;
    state.svg.classList.add("graph--dimmed");
    node.element.classList.add("node--selected");

    // Show the popup if it exists for this node
    if (node.popupElement) {
      // Also check if the parent node is filtered out
      const isFilteredOut = node.element.getAttribute('data-filtered-out') === 'true';
      if (!isFilteredOut) {
        node.popupElement.setAttribute("display", "block");
      }
    }

    state.edgeMap.forEach((edge) => {
      if (edge.definedOn !== node) return;
      if (edge.groupElement.hasAttribute('data-filtered-out')) {
        return;
      }
      highlightedEdges.add(edge);
      const neighbor = edge.source === node ? edge.target : edge.source;
      if (neighbor) neighbor.element.classList.add("node--related");
      highlightedEdgesGroup.appendChild(edge.groupElement);
      highlightedEdgeLabelsGroup.appendChild(edge.textElement);
      edge.groupElement.classList.add("edge--highlighted");
      const path = edge.groupElement.querySelector(".edge-path");
      const relStyle = relationTypes[edge.type];
      path.style.stroke = relStyle.color;
      edge.textElement.style.fill = relStyle.color;
      path.classList.add(edge.type);
      edge.textElement.style.display = "block";
      const markerEndUrl = `url(#arrow-end-${edge.type})`;
      const markerStartUrl = `url(#arrow-start-${edge.type})`;
      if (relStyle.arrow === "outgoing" || relStyle.arrow === "incoming") {
        if (edge.isReversed) {
          path.setAttribute("marker-start", markerEndUrl);
        } else {
          path.setAttribute("marker-end", markerEndUrl);
        }
      } else if (relStyle.arrow === "bidirectional") {
        path.setAttribute("marker-start", markerStartUrl);
        path.setAttribute("marker-end", markerEndUrl);
      }
    });
  }

  state.svgContainer.addEventListener("mousedown", (evt) => {
    if (evt.button !== 0) return;
    const targetNodeElement = evt.target.closest(".node-group");
    if (targetNodeElement) {
      const clickedNode = state.nodeMap.get(targetNodeElement.id);
      if (clickedNode === selectedNode) {
        clearSelection();
      } else {
        selectNode(clickedNode);
      }
    } else {
      isPanning = true;
      state.svgContainer.classList.add("grabbing");
      startPoint = { x: evt.clientX, y: evt.clientY };
    }
  });

  state.svgContainer.addEventListener("mousemove", (evt) => {
    if (!isPanning) return;
    evt.preventDefault();
    const dx = (evt.clientX - startPoint.x) / panScale;
    const dy = (evt.clientY - startPoint.y) / panScale;
    state.viewBox.x -= dx;
    state.viewBox.y -= dy;
    state.svg.setAttribute(
      "viewBox",
      `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`,
    );
    startPoint = { x: evt.clientX, y: evt.clientY };
  });

  const stopPanning = () => {
    isPanning = false;
    state.svgContainer.classList.remove("grabbing");
  };
  state.svgContainer.addEventListener("mouseup", stopPanning);
  state.svgContainer.addEventListener("mouseleave", stopPanning);

  state.svgContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    const pt = (() => {
      const point = state.svg.createSVGPoint();
      point.x = evt.clientX;
      point.y = evt.clientY;
      const ctm = state.svg.getScreenCTM();
      return ctm ? point.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
    })();
    const scaleChange = evt.deltaY < 0 ? 1 / 1.1 : 1.1;
    state.viewBox.x = pt.x - (pt.x - state.viewBox.x) * scaleChange;
    state.viewBox.y = pt.y - (pt.y - state.viewBox.y) * scaleChange;
    state.viewBox.w *= scaleChange;
    state.viewBox.h *= scaleChange;
    state.svg.setAttribute(
      "viewBox",
      `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`,
    );
    panScale = state.svg.clientWidth / state.viewBox.w;
  });

  // This function is still needed for when filters change
  function updatePopupsOnFilterChange() {
    if (selectedNode && selectedNode.popupElement) {
        const isFilteredOut = selectedNode.element.getAttribute('data-filtered-out') === 'true';
        selectedNode.popupElement.setAttribute('display', isFilteredOut ? 'none' : 'block');
    }
  }

  return {
    clearSelection,
    updatePopupsOnFilterChange,
  };
}