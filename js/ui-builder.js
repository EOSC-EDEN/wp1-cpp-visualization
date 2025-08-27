// js/ui-builder.js

/**
 * Creates the classification system selector dropdown.
 * @param {object} classifications - The main classification configuration object.
 * @param {function} onClassificationChange - Callback to run when the selector changes.
 */
export function initializeClassificationSelector(
  classifications,
  onClassificationChange,
) {
  const filterContainer = document.getElementById("top-filter-bar");
  if (!filterContainer) return;

  const wrapper = document.createElement("div");
  wrapper.className = "classification-selector-wrapper";

  const label = document.createElement("label");
  label.htmlFor = "classification-selector";
  label.textContent = "Classification:";

  const select = document.createElement("select");
  select.id = "classification-selector";

  for (const key in classifications) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = classifications[key].label;
    select.appendChild(option);
  }

  wrapper.appendChild(label);
  wrapper.appendChild(select);

  // Prepend the selector to the filter bar
  filterContainer.prepend(wrapper);

  select.addEventListener("change", (e) => {
    onClassificationChange(e.target.value);
  });
}

/**
 * Helper function to create the "Select/Deselect All" button controls.
 * @param {HTMLElement} container - The parent container for the checkboxes.
 */
function createActionButtons(container) {
  const actionsWrapper = document.createElement("div");
  actionsWrapper.classList.add("filter-actions");

  const selectAllButton = document.createElement("button");
  selectAllButton.textContent = "Select All";
  selectAllButton.addEventListener("click", () => {
    container
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = true));
    container.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const deselectAllButton = document.createElement("button");
  deselectAllButton.textContent = "Deselect All";
  deselectAllButton.addEventListener("click", () => {
    container
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    container.dispatchEvent(new Event("change", { bubbles: true }));
  });

  actionsWrapper.appendChild(selectAllButton);
  actionsWrapper.appendChild(deselectAllButton);
  return actionsWrapper;
}

/**
 * Creates the filter checkboxes for the categories (top bar).
 * @param {object} clusterInfo - The configuration object for clusters.
 * @param {function} onFilterChange - A callback function to execute when filters change.
 */
export function initializeCategoryFilters(clusterInfo, onFilterChange) {
  const filterContainer = document.getElementById("top-filter-bar");
  if (!filterContainer) return;

  const categoryGroup = document.createElement("div");
  categoryGroup.className = "filter-group";

  categoryGroup.appendChild(createActionButtons(categoryGroup));

  for (const id in clusterInfo) {
    const info = clusterInfo[id];
    const wrapper = document.createElement("div");
    wrapper.classList.add("filter-option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `filter-${id}`;
    checkbox.value = id;
    checkbox.checked = true;

    const label = document.createElement("label");
    label.htmlFor = `filter-${id}`;
    label.textContent = info.label;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    categoryGroup.appendChild(wrapper);
  }

  filterContainer.appendChild(categoryGroup);

  categoryGroup.addEventListener("change", () => {
    const activeIds = new Set(
      Array.from(categoryGroup.querySelectorAll("input:checked")).map(
        (cb) => cb.value,
      ),
    );
    onFilterChange(activeIds);
  });
}

/**
 * Creates global graph view options, like the strict scope checkbox.
 * @param {function} onOptionChange - A callback function to execute when an option changes.
 */
export function initializeGlobalFilters(onOptionChange) {
  const filterContainer = document.getElementById("top-filter-bar");
  if (!filterContainer) return;

  const globalOptionsContainer = document.createElement("div");
  globalOptionsContainer.className = "global-filter-container";

  const wrapper = document.createElement("div");
  wrapper.classList.add("filter-option");
  wrapper.style.fontWeight = "bold";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "option-child-relationships";
  checkbox.checked = false;

  const label = document.createElement("label");
  label.htmlFor = "option-child-relationships";
  label.textContent = "Category Source Relations Only";
  label.title =
    "If checked, only relationships defined ON a node within a selected category will be shown.";

  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  globalOptionsContainer.appendChild(wrapper);

  filterContainer.appendChild(globalOptionsContainer);

  checkbox.addEventListener("change", () => {
    onOptionChange({
      isStrictScope: checkbox.checked,
    });
  });
}

/**
 * Creates the filter checkboxes for the relation types (side bar).
 * @param {object} relationTypes - The configuration object for relation types.
 * @param {function} onFilterChange - A callback function to execute when filters change.
 */
export function initializeRelationFilters(relationTypes, onFilterChange) {
  const filterContainer = document.getElementById("side-filter-bar");
  if (!filterContainer) return;

  filterContainer.appendChild(createActionButtons(filterContainer));

  const totalWrapper = document.createElement("div");
  totalWrapper.classList.add("total-relations");
  totalWrapper.innerHTML =
    'Total Visible: <span id="total-relations-count">0</span>';
  filterContainer.appendChild(totalWrapper);

  const relationGroups = [
    {
      title: "Procedural",
      types: [
        "triggered_by",
        "triggers",
        "supplier",
        "customer",
        "alternative_to",
      ],
    },
    {
      title: "Dependencies",
      types: [
        "dependency",
        "required_by",
        "may_require",
        "may_be_required_by",
      ],
    },
    {
      title: "Logical",
      types: [
        "affects",
        "affected_by",
        "facilitates",
        "facilitated_by",
        "affinity_with",
        "not_to_be_confused_with",
      ],
    },
  ];

  relationGroups.forEach((group) => {
    const header = document.createElement("h3");
    header.textContent = group.title;
    header.classList.add("filter-header");
    filterContainer.appendChild(header);

    group.types.forEach((typeKey) => {
      if (!relationTypes[typeKey]) return;

      const info = relationTypes[typeKey];
      const wrapper = document.createElement("div");
      wrapper.classList.add("filter-option");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `filter-${typeKey}`;
      checkbox.value = typeKey;
      checkbox.checked = true;

      const label = document.createElement("label");
      label.htmlFor = `filter-${typeKey}`;

      const labelText = document.createElement("span");
      labelText.textContent = info.description;

      const countSpan = document.createElement("span");
      countSpan.classList.add("relation-count");
      countSpan.setAttribute("data-count-for", typeKey);
      countSpan.textContent = " (0)";

      label.appendChild(labelText);
      label.appendChild(countSpan);

      label.style.color = info.color;
      label.style.fontWeight = "bold";

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      filterContainer.appendChild(wrapper);
    });
  });

  filterContainer.addEventListener("change", () => {
    const activeIds = new Set(
      Array.from(filterContainer.querySelectorAll("input:checked")).map(
        (cb) => cb.value,
      ),
    );
    onFilterChange(activeIds);
  });
}
