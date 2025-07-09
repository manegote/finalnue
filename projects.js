// Projects page functionality

let projectsData = {};
let projectCards = [];

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const statusSelect = document.getElementById("status");
  const categorySelect = document.getElementById("category");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const filterResults = document.querySelector(".filter-results");
  const autocompleteList = document.getElementById("autocomplete-list");

  // Load projects data and initialize page
  loadProjectsData().then(() => {
    renderProjectCards();
    setupEventListeners();
  });

  async function loadProjectsData() {
    try {
      const response = await fetch("data/projects.json");
      projectsData = await response.json();
    } catch (error) {
      console.error("Error loading projects data:", error);
      projectsData = {};
    }
  }

  function renderProjectCards() {
    const projectsGrid = document.getElementById("projects-grid");
    projectsGrid.innerHTML = "";

    const projects = Object.values(projectsData);

    projects.forEach((project) => {
      const projectCard = createProjectCard(project);
      projectsGrid.appendChild(projectCard);
    });

    // Update the projectCards reference for filtering
    projectCards = document.querySelectorAll(".project-card");

    // Build autocomplete suggestions from loaded data
    const autocompleteSuggestions = buildAutocompleteSuggestions();
    setupAutocomplete(autocompleteSuggestions);

    // Update initial stats
    updateStats(projects.length);
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = `Showing ${projects.length} of ${projects.length} projects`;

    // Update summary stats
    updateSummaryStats(projects);
  }

  function createProjectCard(project) {
    const card = document.createElement("a");
    card.href = `project-detail.html?id=${project.id}`;
    card.className = "project-card";
    card.setAttribute("data-status", project.status);
    card.setAttribute("data-category", project.category);

    const statusBadgeClass = getStatusBadgeClass(project.status);
    const statusIcon = getStatusIcon(project.status);
    const statusText = project.status.replace("-", " ").toUpperCase();

    const hasSubprojects =
      project.subprojects && project.subprojects.length > 0;
    const hasParent = project.parentProject;

    let relationshipHtml = "";
    if (hasSubprojects) {
      relationshipHtml = `
        <div class="project-relationships">
          <div class="relationship-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>${project.subprojects.length} subprojects</span>
          </div>
        </div>
      `;
    } else if (hasParent) {
      relationshipHtml = `
        <div class="project-relationships">
          <div class="relationship-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Part of larger project</span>
          </div>
        </div>
      `;
    }

    const completedDateHtml = project.completedDate
      ? `<span>Completed ${formatDate(project.completedDate)}</span>`
      : "";

    card.innerHTML = `
      <img
        src="${project.coverImage}"
        alt="${project.title}"
        class="project-image"
      />
      <div class="project-content">
        <h2 class="project-title">${project.title}</h2>
        <p class="project-description">${project.description}</p>

        <div class="project-status-category">
          <span class="badge ${statusBadgeClass}">${statusIcon}${statusText}</span>
          <span class="category-text">${project.category}</span>
        </div>

        ${relationshipHtml}

        <div class="project-dates">
          <div class="date-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Started ${formatDate(project.startDate)}</span>
          </div>
          ${completedDateHtml}
          <div class="date-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${project.readingTime} min read</span>
          </div>
        </div>

        <div class="project-tags">
          ${project.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
        </div>
      </div>
    `;

    return card;
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "completed":
        return "badge-success";
      case "in-progress":
        return "badge-accent";
      case "planning":
        return "badge-warning";
      case "paused":
        return "badge-muted";
      default:
        return "badge-muted";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "completed":
        return '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      case "in-progress":
        return '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      case "planning":
        return '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      case "paused":
        return '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      default:
        return '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function updateSummaryStats(projects) {
    const completed = projects.filter((p) => p.status === "completed").length;
    const inProgress = projects.filter(
      (p) => p.status === "in-progress",
    ).length;

    const statsNumbers = document.querySelectorAll(".stat-number");
    if (statsNumbers.length >= 4) {
      statsNumbers[0].textContent = projects.length; // Total
      statsNumbers[1].textContent = completed; // Completed
      statsNumbers[2].textContent = inProgress; // In Progress
      statsNumbers[3].textContent = projects.length; // Currently Showing
    }
  }

  function setupEventListeners() {
    searchInput.addEventListener("input", (e) => {
      showAutocompleteSuggestions(e.target.value);
      filterProjects();
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        autocompleteList.style.display = "none";
      }, 200);
    });

    statusSelect.addEventListener("change", filterProjects);
    categorySelect.addEventListener("change", filterProjects);
    clearFiltersBtn.addEventListener("click", clearFilters);

    // Tag click functionality
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("tag")) {
        const tagText = e.target.textContent.replace("#", "");
        searchInput.value = tagText;
        filterProjects();
      }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !autocompleteList.contains(e.target)
      ) {
        autocompleteList.style.display = "none";
      }
    });
  }

  function setupAutocomplete(autocompleteSuggestions) {
    window.autocompleteSuggestions = autocompleteSuggestions;
  }

  // Build autocomplete suggestions from loaded data
  function buildAutocompleteSuggestions() {
    const suggestions = new Set();

    Object.values(projectsData).forEach((project) => {
      // Add project title words
      project.title.split(/\s+/).forEach((word) => {
        if (word.length > 2) suggestions.add(word.toLowerCase());
      });

      // Add tags
      project.tags.forEach((tag) => {
        suggestions.add(tag.toLowerCase());
      });

      // Add category
      suggestions.add(project.category.toLowerCase());
    });

    return Array.from(suggestions).sort();
  }

  function showAutocompleteSuggestions(value) {
    if (!value || value.length < 2 || !window.autocompleteSuggestions) {
      autocompleteList.style.display = "none";
      return;
    }

    const filteredSuggestions = window.autocompleteSuggestions
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      )
      .slice(0, 8); // Limit to 8 suggestions

    if (filteredSuggestions.length === 0) {
      autocompleteList.style.display = "none";
      return;
    }

    autocompleteList.innerHTML = filteredSuggestions
      .map(
        (suggestion) =>
          `<div class="autocomplete-suggestion">${suggestion}</div>`,
      )
      .join("");

    autocompleteList.style.display = "block";

    // Add click handlers to suggestions
    autocompleteList
      .querySelectorAll(".autocomplete-suggestion")
      .forEach((item) => {
        item.addEventListener("click", () => {
          searchInput.value = item.textContent;
          autocompleteList.style.display = "none";
          filterProjects();
        });
      });
  }

  // Filter functionality
  function filterProjects() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedStatus = statusSelect.value;
    const selectedCategory = categorySelect.value;

    let visibleCount = 0;
    const currentProjectCards = document.querySelectorAll(".project-card");

    currentProjectCards.forEach((card) => {
      const title = card
        .querySelector(".project-title")
        .textContent.toLowerCase();
      const description = card
        .querySelector(".project-description")
        .textContent.toLowerCase();
      const tags = Array.from(card.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.toLowerCase(),
      );
      const status = card.dataset.status;
      const category = card.dataset.category;

      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));

      const matchesStatus = selectedStatus === "" || status === selectedStatus;
      const matchesCategory =
        selectedCategory === "" || category === selectedCategory;

      const isVisible = matchesSearch && matchesStatus && matchesCategory;

      card.style.display = isVisible ? "block" : "none";

      if (isVisible) {
        visibleCount++;
      }
    });

    // Update results display
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = `Showing ${visibleCount} of ${currentProjectCards.length} projects`;

    // Update stats
    updateStats(visibleCount);
  }

  function updateStats(visibleCount) {
    const statsNumbers = document.querySelectorAll(".stat-number");
    if (statsNumbers.length >= 4) {
      statsNumbers[3].textContent = visibleCount; // Currently Showing
    }
  }

  function clearFilters() {
    searchInput.value = "";
    statusSelect.value = "";
    categorySelect.value = "";
    autocompleteList.style.display = "none";

    const currentProjectCards = document.querySelectorAll(".project-card");
    currentProjectCards.forEach((card) => {
      card.style.display = "block";
    });

    updateStats(currentProjectCards.length);

    // Update results display
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = `Showing ${currentProjectCards.length} of ${currentProjectCards.length} projects`;
  }

  console.log("Projects page functionality loaded");
});
