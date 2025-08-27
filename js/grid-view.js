// grid-view.js

import { relationTypes } from "./config.js";

// Module-level variables to hold references passed from main.js
let popupContainer;
let popupList;
let popupTitle;
let allCppLinks;

/**
 * Initializes the grid view module with necessary DOM elements and data from the main script.
 * @param {object} config - Configuration object.
 * @param {HTMLElement} config.popupContainerEl - The main popup container element.
 * @param {HTMLElement} config.popupListEl - The UL element for the relation list.
 * @param {HTMLElement} config.popupTitleEl - The H3 element for the popup title.
 * @param {object} config.cppLinksData - The object mapping CPP IDs to URLs.
 */
export function initializeGridView(config) {
  popupContainer = config.popupContainerEl;
  popupList = config.popupListEl;
  popupTitle = config.popupTitleEl;
  allCppLinks = config.cppLinksData;
}

/**
 * Generates the correct CSS background for a grid cell based on the number of relations.
 * @param {string[]} relationKeys - Array of relation type keys.
 * @returns {string} - A CSS background value.
 */
function getCellBackground(relationKeys) {
  const colors = relationKeys
    .map((key) => relationTypes[key]?.color || "#cccccc")
    .slice(0, 4); // Limit to a max of 4 colors for the pattern

  switch (colors.length) {
    case 0:
      return "";
    case 1:
      return colors[0];
    case 2:
      // Diagonal split
      return `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
    case 3:
      // Three vertical stripes
      return `linear-gradient(to right, ${colors[0]} 33.3%, ${colors[1]} 33.3% 66.6%, ${colors[2]} 66.6%)`;
    case 4:
    default:
      // 2x2 quadrant
      return `linear-gradient(to right, ${colors[0]} 50%, ${colors[1]} 50%) 0 0 / 100% 50% no-repeat, 
              linear-gradient(to right, ${colors[2]} 50%, ${colors[3]} 50%) 0 100% / 100% 50% no-repeat`;
  }
}

/**
 * Displays and populates the popup with relation details.
 * @param {object} source - The source node object.
 * @param {object} target - The target node object.
 * @param {string[]} relations - An array of relation type keys.
 */
function showGridPopup(source, target, relations) {
  popupList.innerHTML = "";

  const sourceLink = allCppLinks[source.id]
    ? `<a href="${allCppLinks[source.id]}" target="_blank" rel="noopener noreferrer">${source.label}</a>`
    : `<span>${source.label}</span>`;

  const targetLink = allCppLinks[target.id]
    ? `<a href="${allCppLinks[target.id]}" target="_blank" rel="noopener noreferrer">${target.label}</a>`
    : `<span>${target.label}</span>`;

  popupTitle.innerHTML = `Relations: ${sourceLink} → ${targetLink}`;

  if (relations.length > 0) {
    relations.forEach((relType) => {
      const li = document.createElement("li");
      const info = relationTypes[relType];
      if (info) {
        li.textContent = info.description;
        li.style.color = info.color;
        li.style.fontWeight = "bold";
      } else {
        li.textContent = relType;
      }
      popupList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No direct relations defined.";
    popupList.appendChild(li);
  }

  popupContainer.classList.remove("grid-popup-hidden");
}

/**
 * Renders the entire grid view into a container element.
 * @param {HTMLElement} gridContainer - The DOM element to render the grid into.
 * @param {Array} nodes - The array of all node data.
 * @param {object} relations - The main relations data object.
 */
export function renderGridView(gridContainer, nodes, relations) {
  gridContainer.innerHTML = ""; // Clear previous grid

  const sortedNodes = [...nodes].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );

  const table = document.createElement("table");
  table.className = "grid-table";

  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const cornerCell = document.createElement("th");
  const cornerDiv = document.createElement("div");
  cornerDiv.textContent = "Source ↓ / Target →";
  cornerCell.appendChild(cornerDiv);
  headerRow.appendChild(cornerCell);

  sortedNodes.forEach((targetNode) => {
    const th = document.createElement("th");
    const div = document.createElement("div");
    div.textContent = targetNode.label;
    th.appendChild(div);
    headerRow.appendChild(th);
  });

  const tbody = table.createTBody();
  sortedNodes.forEach((sourceNode) => {
    const row = tbody.insertRow();
    const sourceHeaderCell = document.createElement("th");
    sourceHeaderCell.className = "grid-header-source";
    sourceHeaderCell.textContent = sourceNode.label;
    row.appendChild(sourceHeaderCell);

    sortedNodes.forEach((targetNode) => {
      const cell = row.insertCell();
      cell.className = "grid-cell";

      const foundRelations = [];
      if (relations[sourceNode.id]) {
        for (const relType in relations[sourceNode.id]) {
          if (relations[sourceNode.id][relType]?.includes(targetNode.id)) {
            foundRelations.push(relType);
          }
        }
      }

      if (foundRelations.length > 0) {
        cell.dataset.hasRelation = "true";

        if (foundRelations.length === 1) {
          cell.style.backgroundColor = getCellBackground(foundRelations);
        } else {
          cell.style.background = getCellBackground(foundRelations);
        }

        cell.addEventListener("click", () => {
          showGridPopup(sourceNode, targetNode, foundRelations);
        });
      }
    });
  });

  gridContainer.appendChild(table);
}