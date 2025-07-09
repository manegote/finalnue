// Website Manager - Admin Panel JavaScript
// Comprehensive static website management system

// Global state
let projects = {};
let gallery = {};
let websiteSettings = {
  siteName: "Rasil's Projects",
  siteDescription:
    "Designing and building lithium-ion battery packs, PCBs, custom tools, and electronics projects. Documenting the journey from concept to creation.",
  authorName: "Rasil",
  footerText: "Built for showcasing hardware projects.",
  logoText: "RP",
  copyrightYear: "2024",
  metaKeywords: "electronics, battery, PCB, engineering, projects",
  colors: {
    primary: "#0070f0",
    accent: "#00ccc5",
    background: "#0d1117",
    cardBackground: "#161b22",
  },
};
let categories = [];
let imageCategories = [];
let allTags = [];
let allImageTags = [];
let projectTags = [];
let imageTags = [];
let editingProjectId = null;
let editingImageId = null;

// Change tracking
let hasChanges = false;
let changedSections = new Set();

// Initialize the admin panel
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin panel initializing...");
  try {
    loadInitialData();
    setupEventListeners();
    updateAllStats();
    populateDropdowns();
    loadWebsiteSettings();
    setupChangeTracking();
    console.log("Admin panel initialized successfully!");
  } catch (error) {
    console.error("Error initializing admin panel:", error);
  }
});

// Load initial data from the static website
function loadInitialData() {
  // Reset all data to empty state initially
  projects = {};
  gallery = {};
  categories = [];
  imageCategories = [];
  allTags = [];
  allImageTags = [];

  refreshProjectsList();
  refreshImagesList();
  markAllSectionsChanged();
}

// Read existing files from website
async function readExistingFiles() {
  try {
    showMessage("Reading existing website files...", "success");

    // Try to extract data from existing project-detail.js
    const response = await fetch("project-detail.js");
    if (response.ok) {
      const jsContent = await response.text();

      // Extract projects data from the JavaScript file
      const projectsMatch = jsContent.match(/const projectsData = ({[^;]+});/s);
      if (projectsMatch) {
        try {
          const projectsData = eval("(" + projectsMatch[1] + ")");
          projects = projectsData;

          // Extract categories and tags from projects
          categories = [
            ...new Set(Object.values(projects).map((p) => p.category)),
          ];
          allTags = [
            ...new Set(Object.values(projects).flatMap((p) => p.tags || [])),
          ];

          showMessage(
            "Successfully loaded projects from existing files!",
            "success",
          );
        } catch (e) {
          console.error("Error parsing project data:", e);
        }
      }
    }

    // Try to extract gallery data from gallery.js
    const galleryResponse = await fetch("gallery.js");
    if (galleryResponse.ok) {
      const galleryContent = await galleryResponse.text();

      const galleryMatch = galleryContent.match(
        /const galleryData = ({[^;]+});/s,
      );
      if (galleryMatch) {
        try {
          const galleryData = eval("(" + galleryMatch[1] + ")");
          gallery = galleryData;

          // Extract image categories and tags
          imageCategories = [
            ...new Set(Object.values(gallery).map((i) => i.category)),
          ];
          allImageTags = [
            ...new Set(Object.values(gallery).flatMap((i) => i.tags || [])),
          ];

          showMessage(
            "Successfully loaded gallery from existing files!",
            "success",
          );
        } catch (e) {
          console.error("Error parsing gallery data:", e);
        }
      }
    }

    refreshProjectsList();
    refreshImagesList();
    updateAllStats();
    populateDropdowns();
    clearChangeTracking();
  } catch (error) {
    console.error("Error reading files:", error);
    showMessage(
      "Error reading existing files. Make sure the files exist and are accessible.",
      "error",
    );
  }
}

// Change tracking system
function setupChangeTracking() {
  const changeBar = document.createElement("div");
  changeBar.id = "changeNotification";
  changeBar.className = "change-notification";
  changeBar.innerHTML = `
    <div class="change-content">
      <span class="change-icon">⚠️</span>
      <span class="change-text">You have unsaved changes. Go to "Generate Files" tab to update your website files.</span>
      <button onclick="switchTab('generate')" class="change-button">Generate Files</button>
    </div>
  `;
  document.body.appendChild(changeBar);

  // Add CSS for change tracking
  const style = document.createElement("style");
  style.textContent = `
    .change-notification {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc3545;
      color: white;
      padding: 12px;
      z-index: 1000;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    }

    .change-notification.show {
      transform: translateY(0);
    }

    .change-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .change-button {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .change-button:hover {
      background: rgba(255,255,255,0.3);
    }

    .section-changed {
      border: 2px solid #dc3545 !important;
      animation: blink 2s infinite;
    }

    .section-generated {
      border: 2px solid #fd7e14 !important;
    }

    @keyframes blink {
      0%, 50% { border-color: #dc3545; }
      51%, 100% { border-color: transparent; }
    }

    .form-group input[type="text"],
    .form-group textarea,
    .form-group select,
    .category-manager input {
      min-width: 200px;
    }

    .gallery-selector {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #30363d;
      padding: 10px;
      border-radius: 6px;
    }

    .gallery-item-selector {
      position: relative;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 4px;
      transition: border-color 0.2s;
    }

    .gallery-item-selector:hover {
      border-color: #58a6ff;
    }

    .gallery-item-selector.selected {
      border-color: #238636;
    }

    .gallery-item-selector img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .gallery-item-selector .gallery-item-title {
      font-size: 10px;
      text-align: center;
      padding: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);
}

function markChanged(section) {
  hasChanges = true;
  changedSections.add(section);

  // Show notification bar
  const notification = document.getElementById("changeNotification");
  if (notification) {
    notification.classList.add("show");
  }

  // Add visual indicator to sections
  updateSectionIndicators();
}

function markAllSectionsChanged() {
  changedSections.add("projects-html");
  changedSections.add("gallery-html");
  changedSections.add("project-detail-js");
  changedSections.add("gallery-js");
  markChanged("all");
}

function clearChangeTracking() {
  hasChanges = false;
  changedSections.clear();

  const notification = document.getElementById("changeNotification");
  if (notification) {
    notification.classList.remove("show");
  }

  updateSectionIndicators();
}

function updateSectionIndicators() {
  // Update section visual indicators
  const sections = {
    "projects-html": "projectsHTMLSection",
    "gallery-html": "galleryHTMLSection",
    "project-detail-js": "projectDetailJSSection",
    "gallery-js": "galleryJSSection",
  };

  Object.entries(sections).forEach(([key, sectionId]) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove("section-changed", "section-generated");

      if (changedSections.has(key)) {
        section.classList.add("section-changed");
      }
    }
  });
}

// Project management functions
function handleProjectSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const projectData = {
    id: formData.get("projectId") || document.getElementById("projectId").value,
    title:
      formData.get("projectTitle") ||
      document.getElementById("projectTitle").value,
    description:
      formData.get("projectDescription") ||
      document.getElementById("projectDescription").value,
    status:
      formData.get("projectStatus") ||
      document.getElementById("projectStatus").value,
    category:
      formData.get("projectCategory") ||
      document.getElementById("projectCategory").value,
    tags: [...projectTags],
    coverImage:
      formData.get("projectCoverImage") ||
      document.getElementById("projectCoverImage").value,
    readingTime:
      parseInt(
        formData.get("projectReadingTime") ||
          document.getElementById("projectReadingTime").value,
      ) || 5,
    images: getSelectedProjectImages(),
    startDate:
      formData.get("projectStartDate") ||
      document.getElementById("projectStartDate").value,
    completedDate:
      formData.get("projectCompletedDate") ||
      document.getElementById("projectCompletedDate").value ||
      null,
    parentProject:
      formData.get("projectParent") ||
      document.getElementById("projectParent").value ||
      null,
    subprojects: getSelectedSubprojects(),
    details:
      formData.get("projectDetails") ||
      document.getElementById("projectDetails").value,
    technologies: (
      formData.get("projectTechnologies") ||
      document.getElementById("projectTechnologies").value
    )
      .split("\\n")
      .filter((t) => t.trim()),
    challenges: (
      formData.get("projectChallenges") ||
      document.getElementById("projectChallenges").value
    )
      .split("\\n")
      .filter((c) => c.trim()),
    outcomes: (
      formData.get("projectOutcomes") ||
      document.getElementById("projectOutcomes").value
    )
      .split("\\n")
      .filter((o) => o.trim()),
  };

  // Clean null/empty values
  Object.keys(projectData).forEach((key) => {
    if (
      projectData[key] === null ||
      projectData[key] === "" ||
      (Array.isArray(projectData[key]) && projectData[key].length === 0)
    ) {
      delete projectData[key];
    }
  });

  projects[projectData.id] = projectData;

  // Update categories and tags
  if (!categories.includes(projectData.category)) {
    categories.push(projectData.category);
  }
  projectData.tags.forEach((tag) => {
    if (!allTags.includes(tag)) {
      allTags.push(tag);
    }
  });

  showMessage("Project saved successfully!", "success");
  refreshProjectsList();
  updateAllStats();
  clearProjectForm();
  populateDropdowns();

  // Mark files as changed
  markChanged("projects-html");
  markChanged("project-detail-js");
}

function getSelectedProjectImages() {
  const images = [];
  const coverImage = document.getElementById("projectCoverImage").value;
  if (coverImage) images.push(coverImage);

  document
    .querySelectorAll(".project-image-selector.selected")
    .forEach((selector) => {
      const imageUrl = selector.dataset.imageUrl;
      if (imageUrl && !images.includes(imageUrl)) {
        images.push(imageUrl);
      }
    });

  return images;
}

function getSelectedSubprojects() {
  const subprojects = [];
  document
    .querySelectorAll('input[name="subproject"]:checked')
    .forEach((checkbox) => {
      subprojects.push(checkbox.value);
    });
  return subprojects;
}

function editProject(id) {
  const project = projects[id];
  if (!project) return;

  editingProjectId = id;
  document.getElementById("projectFormTitle").textContent = "✏️ Edit Project";

  // Populate form
  document.getElementById("projectId").value = project.id;
  document.getElementById("projectTitle").value = project.title;
  document.getElementById("projectDescription").value = project.description;
  document.getElementById("projectStatus").value = project.status;
  document.getElementById("projectCategory").value = project.category;
  document.getElementById("projectStartDate").value = project.startDate;
  document.getElementById("projectCompletedDate").value =
    project.completedDate || "";
  document.getElementById("projectCoverImage").value = project.coverImage || "";
  document.getElementById("projectReadingTime").value =
    project.readingTime || 5;
  document.getElementById("projectDetails").value = project.details || "";
  document.getElementById("projectTechnologies").value = (
    project.technologies || []
  ).join("\\n");
  document.getElementById("projectChallenges").value = (
    project.challenges || []
  ).join("\\n");
  document.getElementById("projectOutcomes").value = (
    project.outcomes || []
  ).join("\\n");
  document.getElementById("projectParent").value = project.parentProject || "";

  // Set tags
  projectTags = [...(project.tags || [])];
  updateTagsDisplay("projectTagsContainer", projectTags);

  // Set selected images
  setupProjectImageSelector();
  if (project.images) {
    project.images.forEach((imageUrl) => {
      const selector = document.querySelector(`[data-image-url="${imageUrl}"]`);
      if (selector) {
        selector.classList.add("selected");
      }
    });
  }

  // Set subprojects
  setupSubprojectsSelector();
  if (project.subprojects) {
    project.subprojects.forEach((subId) => {
      const checkbox = document.querySelector(
        `input[name="subproject"][value="${subId}"]`,
      );
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }
}

function deleteProject(id) {
  if (
    confirm(
      "Are you sure you want to delete this project? This action cannot be undone.",
    )
  ) {
    delete projects[id];

    // Remove from other projects' relationships
    Object.values(projects).forEach((project) => {
      if (project.subprojects) {
        project.subprojects = project.subprojects.filter(
          (subId) => subId !== id,
        );
      }
      if (project.parentProject === id) {
        delete project.parentProject;
      }
    });

    refreshProjectsList();
    updateAllStats();
    populateDropdowns();
    showMessage("Project deleted successfully!", "success");
    markChanged("projects-html");
    markChanged("project-detail-js");
  }
}

function clearProjectForm() {
  document.getElementById("projectForm").reset();
  editingProjectId = null;
  projectTags = [];
  updateTagsDisplay("projectTagsContainer", projectTags);
  document.getElementById("projectFormTitle").textContent =
    "➕ Add New Project";

  // Clear image selections
  document.querySelectorAll(".project-image-selector").forEach((selector) => {
    selector.classList.remove("selected");
  });

  // Clear subproject selections
  document.querySelectorAll('input[name="subproject"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
}

// Gallery management functions
function handleImageSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const imageData = {
    id: formData.get("imageId") || document.getElementById("imageId").value,
    title:
      formData.get("imageTitle") || document.getElementById("imageTitle").value,
    description:
      formData.get("imageDescription") ||
      document.getElementById("imageDescription").value,
    url: formData.get("imageUrl") || document.getElementById("imageUrl").value,
    tags: [...imageTags],
    category:
      formData.get("imageCategory") ||
      document.getElementById("imageCategory").value,
    projectId:
      formData.get("imageProject") ||
      document.getElementById("imageProject").value ||
      undefined,
    uploadDate: new Date().toISOString().split("T")[0],
  };

  // Clean undefined values
  Object.keys(imageData).forEach((key) => {
    if (imageData[key] === undefined || imageData[key] === "") {
      delete imageData[key];
    }
  });

  gallery[imageData.id] = imageData;

  // Update categories and tags
  if (!imageCategories.includes(imageData.category)) {
    imageCategories.push(imageData.category);
  }
  imageData.tags.forEach((tag) => {
    if (!allImageTags.includes(tag)) {
      allImageTags.push(tag);
    }
  });

  showMessage("Image saved successfully!", "success");
  refreshImagesList();
  updateAllStats();
  clearImageForm();
  populateDropdowns();
  setupProjectImageSelector(); // Refresh image selector

  // Mark files as changed
  markChanged("gallery-html");
  markChanged("gallery-js");
}

function editImage(id) {
  const image = gallery[id];
  if (!image) return;

  editingImageId = id;
  document.getElementById("imageFormTitle").textContent = "✏️ Edit Image";

  // Populate form
  document.getElementById("imageId").value = image.id;
  document.getElementById("imageTitle").value = image.title;
  document.getElementById("imageDescription").value = image.description;
  document.getElementById("imageUrl").value = image.url;
  document.getElementById("imageCategory").value = image.category;
  document.getElementById("imageProject").value = image.projectId || "";

  // Set tags
  imageTags = [...(image.tags || [])];
  updateTagsDisplay("imageTagsContainer", imageTags);
}

function deleteImage(id) {
  if (confirm("Are you sure you want to delete this image?")) {
    delete gallery[id];
    refreshImagesList();
    updateAllStats();
    setupProjectImageSelector(); // Refresh image selector
    showMessage("Image deleted successfully!", "success");
    markChanged("gallery-html");
    markChanged("gallery-js");
  }
}

function clearImageForm() {
  document.getElementById("imageForm").reset();
  editingImageId = null;
  imageTags = [];
  updateTagsDisplay("imageTagsContainer", imageTags);
  document.getElementById("imageFormTitle").textContent = "➕ Add New Image";
}

// Setup project image selector
function setupProjectImageSelector() {
  const container = document.getElementById("projectImageSelector");
  if (!container) return;

  container.innerHTML = "";

  Object.values(gallery).forEach((image) => {
    const div = document.createElement("div");
    div.className = "gallery-item-selector project-image-selector";
    div.dataset.imageUrl = image.url;
    div.innerHTML = `
      <img src="${image.url}" alt="${image.title}">
      <div class="gallery-item-title">${image.title}</div>
    `;

    div.addEventListener("click", () => {
      div.classList.toggle("selected");
    });

    container.appendChild(div);
  });
}

// Setup subprojects selector
function setupSubprojectsSelector() {
  const container = document.getElementById("subprojectsSelector");
  if (!container) return;

  container.innerHTML = "";

  Object.values(projects).forEach((project) => {
    if (project.id === editingProjectId) return; // Don't allow self-reference

    const div = document.createElement("div");
    div.innerHTML = `
      <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <input type="checkbox" name="subproject" value="${project.id}">
        <span>${project.title} (${project.category})</span>
      </label>
    `;

    container.appendChild(div);
  });
}

// Website settings management
function loadWebsiteSettings() {
  document.getElementById("siteName").value = websiteSettings.siteName;
  document.getElementById("siteDescription").value =
    websiteSettings.siteDescription;
  document.getElementById("authorName").value = websiteSettings.authorName;
  document.getElementById("footerText").value = websiteSettings.footerText;
  document.getElementById("logoText").value = websiteSettings.logoText;
  document.getElementById("copyrightYear").value =
    websiteSettings.copyrightYear;
  document.getElementById("metaKeywords").value = websiteSettings.metaKeywords;
  document.getElementById("primaryColor").value =
    websiteSettings.colors.primary;
  document.getElementById("accentColor").value = websiteSettings.colors.accent;
}

function handleSettingsSubmit(e) {
  e.preventDefault();

  websiteSettings = {
    siteName: document.getElementById("siteName").value,
    siteDescription: document.getElementById("siteDescription").value,
    authorName: document.getElementById("authorName").value,
    footerText: document.getElementById("footerText").value,
    logoText: document.getElementById("logoText").value,
    copyrightYear: document.getElementById("copyrightYear").value,
    metaKeywords: document.getElementById("metaKeywords").value,
    colors: {
      primary: document.getElementById("primaryColor").value,
      accent: document.getElementById("accentColor").value,
      background: websiteSettings.colors.background,
      cardBackground: websiteSettings.colors.cardBackground,
    },
  };

  showMessage("Website settings saved successfully!", "success");
  markChanged("projects-html");
  markChanged("gallery-html");
}

// Setup event listeners
function setupEventListeners() {
  // Auto-generate IDs from titles
  document
    .getElementById("projectTitle")
    .addEventListener("input", function () {
      if (!editingProjectId) {
        const id = this.value
          .toLowerCase()
          .replace(/[^a-z0-9\\s-]/g, "")
          .replace(/\\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        document.getElementById("projectId").value = id;
      }
    });

  document.getElementById("imageTitle").addEventListener("input", function () {
    if (!editingImageId) {
      const id = this.value
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, "")
        .replace(/\\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      document.getElementById("imageId").value = id;
    }
  });

  // Tag input handlers
  setupTagInput("projectTagInput", "projectTagsContainer", projectTags);
  setupTagInput("imageTagInput", "imageTagsContainer", imageTags);

  // Form submissions
  document
    .getElementById("projectForm")
    .addEventListener("submit", handleProjectSubmit);
  document
    .getElementById("imageForm")
    .addEventListener("submit", handleImageSubmit);
  document
    .getElementById("settingsForm")
    .addEventListener("submit", handleSettingsSubmit);

  // Setup image selector
  setupProjectImageSelector();
}

// Setup tag input functionality
function setupTagInput(inputId, containerId, tagsArray) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = this.value.trim();
      if (tag && !tagsArray.includes(tag)) {
        tagsArray.push(tag);
        updateTagsDisplay(containerId, tagsArray);
        this.value = "";
      }
    }
  });

  // Initial display
  updateTagsDisplay(containerId, tagsArray);
}

// Remove tag function
function removeTag(containerId, index) {
  if (containerId === "projectTagsContainer") {
    projectTags.splice(index, 1);
    updateTagsDisplay("projectTagsContainer", projectTags);
  } else {
    imageTags.splice(index, 1);
    updateTagsDisplay("imageTagsContainer", imageTags);
  }
}

function updateTagsDisplay(containerId, tagsArray) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  tagsArray.forEach((tag, index) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `${tag} <span class="remove" onclick="removeTag('${containerId}', ${index})">×</span>`;
    container.appendChild(tagElement);
  });
}

// Tab switching
function switchTab(tabName) {
  console.log("Switching to tab:", tabName);
  // Remove active class from all tabs and contents
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to selected tab and content
  event.target.classList.add("active");
  document.getElementById(tabName + "-tab").classList.add("active");

  // Setup dynamic content when switching to projects tab
  if (tabName === "projects") {
    setupProjectImageSelector();
    setupSubprojectsSelector();
  }
}

// Refresh lists
function refreshProjectsList() {
  const container = document.getElementById("projectsList");
  container.innerHTML = "";

  Object.values(projects).forEach((project) => {
    const item = document.createElement("div");
    item.className = "item";

    const relationships = [];
    if (project.parentProject)
      relationships.push(
        `Part of ${projects[project.parentProject]?.title || "Unknown"}`,
      );
    if (project.subprojects?.length)
      relationships.push(`${project.subprojects.length} subprojects`);

    item.innerHTML = `
            <div class="item-info">
                <h3>${project.title}</h3>
                <p>Status: ${project.status} | Category: ${project.category} | Started: ${project.startDate}</p>
                ${relationships.length ? `<p style="font-size: 12px; color: #8b949e;">${relationships.join(" • ")}</p>` : ""}
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary" onclick="editProject('${project.id}')">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteProject('${project.id}')">🗑️ Delete</button>
            </div>
        `;
    container.appendChild(item);
  });
}

function refreshImagesList() {
  const container = document.getElementById("imagesList");
  container.innerHTML = "";

  Object.values(gallery).forEach((image) => {
    const item = document.createElement("div");
    item.className = "item";
    const projectName = image.projectId
      ? projects[image.projectId]?.title || "Unknown Project"
      : "No Project";

    item.innerHTML = `
            <div class="item-info">
                <h3>${image.title}</h3>
                <p>Category: ${image.category} | Project: ${projectName}</p>
                <p style="font-size: 12px; color: #8b949e;">Tags: ${(image.tags || []).join(", ")}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary" onclick="editImage('${image.id}')">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteImage('${image.id}')">🗑️ Delete</button>
            </div>
        `;
    container.appendChild(item);
  });
}

// Statistics
function updateAllStats() {
  const projectValues = Object.values(projects);
  const imageValues = Object.values(gallery);

  // Project stats
  document.getElementById("totalProjects").textContent = projectValues.length;
  document.getElementById("completedProjects").textContent =
    projectValues.filter((p) => p.status === "completed").length;
  document.getElementById("activeProjects").textContent = projectValues.filter(
    (p) => p.status === "in-progress",
  ).length;
  document.getElementById("projectCategories").textContent = categories.length;

  // Image stats
  document.getElementById("totalImages").textContent = imageValues.length;
  document.getElementById("imageCategories").textContent =
    imageCategories.length;
  document.getElementById("imageTags").textContent = allImageTags.length;
  document.getElementById("linkedImages").textContent = imageValues.filter(
    (i) => i.projectId,
  ).length;
}

// Category management
function addCategory() {
  console.log("addCategory function called");
  const input = document.getElementById("newCategoryInput");
  const category = input.value.trim();
  if (category && !categories.includes(category)) {
    categories.push(category);
    populateDropdowns();
    input.value = "";
    showMessage("Category added successfully!", "success");
  }
}

function addImageCategory() {
  const input = document.getElementById("newImageCategoryInput");
  const category = input.value.trim();
  if (category && !imageCategories.includes(category)) {
    imageCategories.push(category);
    populateDropdowns();
    input.value = "";
    showMessage("Image category added successfully!", "success");
  }
}

function populateDropdowns() {
  // Project categories
  const projectCategorySelect = document.getElementById("projectCategory");
  projectCategorySelect.innerHTML = '<option value="">Select Category</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    projectCategorySelect.appendChild(option);
  });

  // Image categories
  const imageCategorySelect = document.getElementById("imageCategory");
  imageCategorySelect.innerHTML = '<option value="">Select Category</option>';
  imageCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    imageCategorySelect.appendChild(option);
  });

  // Project associations for images
  const imageProjectSelect = document.getElementById("imageProject");
  imageProjectSelect.innerHTML =
    '<option value="">No Project Association</option>';
  Object.values(projects).forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.title;
    imageProjectSelect.appendChild(option);
  });

  // Parent project selector
  const parentProjectSelect = document.getElementById("projectParent");
  if (parentProjectSelect) {
    parentProjectSelect.innerHTML =
      '<option value="">No Parent Project</option>';
    Object.values(projects).forEach((project) => {
      if (project.id !== editingProjectId) {
        // Don't allow self-reference
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.title;
        parentProjectSelect.appendChild(option);
      }
    });
  }
}

// Enhanced markdown processor with image insertion
function processMarkdownImages(markdown) {
  // Replace [imagename] with actual image URLs from gallery
  return markdown.replace(/\\[([^\\]]+)\\]/g, (match, imageName) => {
    const image = Object.values(gallery).find(
      (img) =>
        img.title.toLowerCase().includes(imageName.toLowerCase()) ||
        img.id.toLowerCase().includes(imageName.toLowerCase()),
    );

    if (image) {
      return `\\n\\n<div style="margin: 2rem 0; text-align: center; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background-color: var(--card);">\\n<img src="${image.url}" alt="${image.title}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover;" />\\n<div style="padding: 1rem; font-size: 0.875rem; color: var(--muted-foreground); text-align: center;">${image.title}</div>\\n</div>\\n\\n`;
    }

    return match; // Return original if image not found
  });
}

// File generation functions (implement all existing ones with the new features)
function generateProjectsHTML() {
  const projectsArray = Object.values(projects);

  const projectCardsHTML = projectsArray
    .map((project) => {
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

      return `
          <a
            href="project-detail.html?id=${project.id}"
            class="project-card"
            data-status="${project.status}"
            data-category="${project.category}"
          >
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
          </a>`;
    })
    .join("\\n");

  const completed = projectsArray.filter(
    (p) => p.status === "completed",
  ).length;
  const inProgress = projectsArray.filter(
    (p) => p.status === "in-progress",
  ).length;

  const projectsHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Projects - ${websiteSettings.siteName}</title>
    <meta name="description" content="${websiteSettings.siteDescription}" />
    <meta name="keywords" content="${websiteSettings.metaKeywords}" />
    <link rel="stylesheet" href="styles.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="header-top">
          <a href="index.html" class="logo">
            <div class="logo-icon">${websiteSettings.logoText}</div>
            <span class="logo-text">${websiteSettings.siteName}</span>
          </a>
          <button class="mobile-menu" aria-label="Menu">
            <svg
              class="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        <nav class="nav">
          <ul class="nav-list">
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li>
              <a href="projects.html" class="nav-link active">Projects</a>
            </li>
            <li><a href="gallery.html" class="nav-link">Gallery</a></li>
            <li><a href="about.html" class="nav-link">About</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a href="index.html">Home</a> / <span>Projects</span>
      </nav>

      <div class="page-content">
        <h1 class="page-title">Engineering Projects</h1>
        <p class="page-description">
          A portfolio of electronics engineering projects including battery systems, PCB designs,
          custom tools, and supporting infrastructure. Some projects are part of larger goals.
        </p>

        <!-- Search and Filters -->
        <div class="filter-section">
          <div class="filter-header">
            <svg
              class="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              ></path>
            </svg>
            <span>Filter Projects</span>
          </div>

          <div class="filter-grid">
            <div class="filter-item">
              <label for="search">Search</label>
              <div class="search-input">
                <svg
                  class="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <input
                  type="search"
                  id="search"
                  placeholder="Search projects..."
                  class="form-input"
                  autocomplete="off"
                />
                <div
                  id="autocomplete-list"
                  class="autocomplete-suggestions"
                ></div>
              </div>
            </div>

            <div class="filter-item">
              <label for="status">Status</label>
              <select id="status" class="form-select">
                <option value="">All Statuses</option>
                <option value="completed">COMPLETED</option>
                <option value="in-progress">IN PROGRESS</option>
                <option value="planning">PLANNING</option>
                <option value="paused">PAUSED</option>
              </select>
            </div>

            <div class="filter-item">
              <label for="category">Category</label>
              <select id="category" class="form-select">
                <option value="">All Categories</option>
                ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="filter-results">
            <span class="results-count">Showing ${projectsArray.length} of ${projectsArray.length} projects</span>
            <button class="btn btn-outline btn-sm" id="clearFilters">
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid">
          ${projectCardsHTML}
        </div>

        <!-- Summary Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">${projectsArray.length}</div>
              <div class="stat-label">Total Projects</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${completed}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${inProgress}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${projectsArray.length}</div>
              <div class="stat-label">Currently Showing</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3 class="footer-title">${websiteSettings.siteName}</h3>
            <p class="footer-description">
              ${websiteSettings.siteDescription}
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="projects.html">Projects</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="about.html">About</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Technologies</h4>
            <ul class="footer-tech">
              <li>Lithium-ion Battery Design</li>
              <li>PCB Design & Manufacturing</li>
              <li>3D Modeling & Printing</li>
              <li>Reflow Oven Construction</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            © ${websiteSettings.copyrightYear} ${websiteSettings.siteName}. ${websiteSettings.footerText}
          </p>
        </div>
      </div>
    </footer>

    <script src="script.js"></script>
    <script src="projects.js"></script>
  </body>
</html>`;

  document.getElementById("projectsHTMLOutput").textContent = projectsHTML;
  document.getElementById("projectsHTMLSection").style.display = "block";
  document
    .getElementById("projectsHTMLSection")
    .classList.remove("section-changed");
  document
    .getElementById("projectsHTMLSection")
    .classList.add("section-generated");
  changedSections.delete("projects-html");
}

function generateGalleryHTML() {
  const imagesArray = Object.values(gallery);

  const galleryItemsHTML = imagesArray
    .map((image) => {
      const filename = image.title.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";

      return `
          <div
            class="gallery-item"
            data-category="${image.category}"
            data-tags="${image.tags.join(",")}"
            data-image-id="${image.id}"
          >
            <img
              src="${image.url}"
              alt="${image.title}"
              class="gallery-image"
            />
            <div class="gallery-overlay">
              <div class="overlay-buttons">
                <button
                  class="btn btn-outline btn-sm"
                  onclick="openModal('${image.id}')"
                >
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                  </svg>
                  View
                </button>
                <button
                  class="btn btn-outline btn-sm"
                  onclick="downloadImage('${image.url}', '${filename}')"
                >
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download
                </button>
              </div>
            </div>
            <div class="gallery-info">
              <h3 class="gallery-title">${image.title}</h3>
              <p class="gallery-description">${image.description}</p>
              <div class="gallery-tags">
                ${image.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
              </div>
            </div>
          </div>`;
    })
    .join("\\n");

  const uniqueCategories = [...new Set(imagesArray.map((i) => i.category))];
  const allTags = [...new Set(imagesArray.flatMap((i) => i.tags))];

  const galleryHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gallery - ${websiteSettings.siteName}</title>
    <meta name="description" content="${websiteSettings.siteDescription}" />
    <meta name="keywords" content="${websiteSettings.metaKeywords}" />
    <link rel="stylesheet" href="styles.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="header-top">
          <a href="index.html" class="logo">
            <div class="logo-icon">${websiteSettings.logoText}</div>
            <span class="logo-text">${websiteSettings.siteName}</span>
          </a>
          <button class="mobile-menu" aria-label="Menu">
            <svg
              class="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        <nav class="nav">
          <ul class="nav-list">
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="projects.html" class="nav-link">Projects</a></li>
            <li><a href="gallery.html" class="nav-link active">Gallery</a></li>
            <li><a href="about.html" class="nav-link">About</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a href="index.html">Home</a> / <span>Gallery</span>
      </nav>

      <div class="page-content">
        <h1 class="page-title">Project Gallery</h1>
        <p class="page-description">
          Visual documentation of projects, designs, PCBs, tools, and
          components. Click any image to view fullscreen with download options.
        </p>

        <!-- Search and Filters -->
        <div class="filter-section">
          <div class="filter-header">
            <svg
              class="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              ></path>
            </svg>
            <span>Filter Images</span>
          </div>

          <div class="filter-grid">
            <div class="filter-item">
              <label for="search">Search</label>
              <div class="search-input">
                <svg
                  class="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <input
                  type="search"
                  id="search"
                  placeholder="Search images..."
                  class="form-input"
                  autocomplete="off"
                />
                <div
                  id="autocomplete-list"
                  class="autocomplete-suggestions"
                ></div>
              </div>
            </div>

            <div class="filter-item">
              <label for="category">Category</label>
              <select id="category" class="form-select">
                <option value="">All Categories</option>
                ${uniqueCategories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
              </select>
            </div>

            <div class="filter-item">
              <label for="tag">Tag</label>
              <select id="tag" class="form-select">
                <option value="">All Tags</option>
                ${allTags.map((tag) => `<option value="${tag}">${tag}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="filter-results">
            <span class="results-count">Showing ${imagesArray.length} of ${imagesArray.length} images</span>
            <button class="btn btn-outline btn-sm" id="clearFilters">
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Image Grid -->
        <div class="gallery-grid">
          ${galleryItemsHTML}
        </div>

        <!-- Summary Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">${imagesArray.length}</div>
              <div class="stat-label">Total Images</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${uniqueCategories.length}</div>
              <div class="stat-label">Categories</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${imagesArray.length}</div>
              <div class="stat-label">Currently Showing</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Fullscreen Modal -->
    <div id="imageModal" class="modal" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()" aria-label="Close">
          <svg
            class="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <img id="modalImage" src="" alt="" class="modal-image" />

        <div class="modal-info">
          <h3 id="modalTitle" class="modal-title"></h3>
          <p id="modalDescription" class="modal-description"></p>

          <div class="modal-actions">
            <div id="modalTags" class="modal-tags"></div>
            <button id="modalDownload" class="btn btn-outline btn-sm">
              <svg
                class="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3 class="footer-title">${websiteSettings.siteName}</h3>
            <p class="footer-description">
              ${websiteSettings.siteDescription}
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="projects.html">Projects</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="about.html">About</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Technologies</h4>
            <ul class="footer-tech">
              <li>Lithium-ion Battery Design</li>
              <li>PCB Design & Manufacturing</li>
              <li>3D Modeling & Printing</li>
              <li>Reflow Oven Construction</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            © ${websiteSettings.copyrightYear} ${websiteSettings.siteName}. ${websiteSettings.footerText}
          </p>
        </div>
      </div>
    </footer>

    <script src="script.js"></script>
    <script src="gallery.js"></script>
  </body>
</html>`;

  document.getElementById("galleryHTMLOutput").textContent = galleryHTML;
  document.getElementById("galleryHTMLSection").style.display = "block";
  document
    .getElementById("galleryHTMLSection")
    .classList.remove("section-changed");
  document
    .getElementById("galleryHTMLSection")
    .classList.add("section-generated");
  changedSections.delete("gallery-html");
}

function generateProjectDetailJS() {
  const jsCode = `// Project detail page functionality
// Generated by Website Manager with enhanced relationship support

const projectsData = ${JSON.stringify(projects, null, 2)};

document.addEventListener("DOMContentLoaded", function () {
  // Get project ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  if (!projectId || !projectsData[projectId]) {
    // Redirect to projects page if invalid ID
    window.location.href = "projects.html";
    return;
  }

  const project = projectsData[projectId];

  // Populate page content
  populateProjectDetail(project);
});

function populateProjectDetail(project) {
  // Update page title
  document.title = \`\${project.title} - \${project.category} Project\`;

  // Update breadcrumb
  document.getElementById("project-breadcrumb").textContent = project.title;

  // Update header content
  document.getElementById("project-cover").src = project.coverImage;
  document.getElementById("project-cover").alt = project.title;
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-description").textContent = project.description;

  // Update status with appropriate badge class and icon
  const statusElement = document.getElementById("project-status");
  statusElement.innerHTML = getStatusIcon(project.status) + project.status.replace("-", " ").toUpperCase();
  statusElement.className = \`badge badge-\${getStatusClass(project.status)}\`;

  // Update category
  document.getElementById("project-category").textContent = project.category;

  // Update dates
  document.getElementById("project-start-date").textContent = formatDate(project.startDate);

  if (project.completedDate) {
    document.getElementById("completed-date-container").style.display = "block";
    document.getElementById("project-completed-date").textContent = formatDate(project.completedDate);
  }

  // Update reading time
  document.getElementById("project-reading-time").textContent = \`\${project.readingTime} min read\`;

  // Update tags
  const tagsContainer = document.getElementById("project-tags");
  tagsContainer.innerHTML = "";
  project.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = \`#\${tag}\`;
    tagsContainer.appendChild(tagElement);
  });

  // Update main content - convert markdown-like content to HTML and inject images
  const detailsContainer = document.getElementById("project-details");
  detailsContainer.innerHTML = convertMarkdownToHTMLWithImages(project.details, project.images);

  // Update sidebar lists
  updateSidebarList("project-technologies", project.technologies);
  updateSidebarList("project-challenges", project.challenges);
  updateSidebarList("project-outcomes", project.outcomes);

  // Show related projects if they exist
  if (project.subprojects || project.parentProject) {
    showRelatedProjects(project);
  }
}

function getStatusClass(status) {
  switch (status) {
    case "completed": return "success";
    case "in-progress": return "accent";
    case "planning": return "warning";
    case "paused": return "muted";
    default: return "muted";
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
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function updateSidebarList(containerId, items) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      container.appendChild(li);
    });
  }
}

function convertMarkdownToHTML(markdown) {
  // Simple markdown-to-HTML conversion
  let html = markdown
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/^\\d+\\. (.*$)/gm, "<li>$1</li>")
    .replace(/\\n\\n/g, "</p><p>")
    .replace(/^\\s*$/gm, "");

  // Wrap paragraphs
  html = "<p>" + html + "</p>";

  // Fix list formatting
  html = html.replace(/(<li>.*<\\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/<\\/ul>\\s*<ul>/g, "");

  // Clean up empty paragraphs
  html = html.replace(/<p>\\s*<\\/p>/g, "");
  html = html.replace(/<p>\\s*(<h[1-6]>)/g, "$1");
  html = html.replace(/(<\\/h[1-6]>)\\s*<\\/p>/g, "$1");
  html = html.replace(/<p>\\s*(<ul>)/g, "$1");
  html = html.replace(/(<\\/ul>)\\s*<\\/p>/g, "$1");

  return html;
}

function convertMarkdownToHTMLWithImages(markdown, images) {
  let html = convertMarkdownToHTML(markdown);

  // If we have multiple images, inject them into the content
  if (images && images.length > 1) {
    // Find major section breaks (h2 elements) and inject images
    const sections = html.split(/(<h2>.*?<\\/h2>)/);
    let imageIndex = 1; // Skip first image (cover image)

    let result = "";
    for (let i = 0; i < sections.length; i++) {
      result += sections[i];

      // After every 2nd section, add an image if available
      if (i > 0 && i % 4 === 0 && imageIndex < images.length) {
        result += \`
          <div style="margin: 2rem 0; text-align: center; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background-color: var(--card);">
            <img src="\${images[imageIndex]}" alt="Project Image \${imageIndex + 1}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover;" />
            <div style="padding: 1rem; font-size: 0.875rem; color: var(--muted-foreground); text-align: center;">
              Project progress and detailed view
            </div>
          </div>
        \`;
        imageIndex++;
      }
    }

    return result;
  }

  return html;
}

function showRelatedProjects(project) {
  const relatedSection = document.getElementById("related-projects-section");
  const relatedContainer = document.getElementById("related-projects");

  if (!relatedSection || !relatedContainer) return;

  // Only show if there are actually related projects
  let hasRelated = false;

  // Show parent project if it exists
  if (project.parentProject && projectsData[project.parentProject]) {
    hasRelated = true;
  }

  // Show subprojects if they exist
  if (project.subprojects && project.subprojects.length > 0) {
    hasRelated = true;
  }

  if (!hasRelated) return;

  relatedSection.style.display = "block";
  relatedContainer.innerHTML = "";

  // Add section for parent project
  if (project.parentProject && projectsData[project.parentProject]) {
    const parentProject = projectsData[project.parentProject];

    const parentSection = document.createElement("div");
    parentSection.innerHTML = \`
            <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem;">Parent Project</h4>
        \`;
    relatedContainer.appendChild(parentSection);

    addRelatedProject(relatedContainer, parentProject);
  }

  // Add section for subprojects
  if (project.subprojects && project.subprojects.length > 0) {
    const subprojectsSection = document.createElement("div");
    subprojectsSection.innerHTML = \`
            <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem; margin-top: 1.5rem;">Required Infrastructure</h4>
        \`;
    relatedContainer.appendChild(subprojectsSection);

    project.subprojects.forEach((subprojectId) => {
      if (projectsData[subprojectId]) {
        const subproject = projectsData[subprojectId];
        addRelatedProject(relatedContainer, subproject);
      }
    });
  }
}

function addRelatedProject(container, project) {
  const projectElement = document.createElement("a");
  projectElement.href = \`project-detail.html?id=\${project.id}\`;
  projectElement.className = "related-project-item";

  // Get status icon
  let statusIcon = "";
  let statusClass = "";
  switch (project.status) {
    case "completed":
      statusIcon = '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-success";
      break;
    case "in-progress":
      statusIcon = '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-accent";
      break;
    default:
      statusIcon = '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-muted";
  }

  projectElement.innerHTML = \`
        <div class="related-project-title">\${project.title}</div>
        <div class="related-project-description">\${project.description}</div>
        <div style="margin-top: 0.75rem;">
            <span class="badge \${statusClass}" style="font-size: 0.625rem; padding: 0.125rem 0.375rem;">
                \${statusIcon}\${project.status.replace("-", " ").toUpperCase()}
            </span>
        </div>
    \`;

  container.appendChild(projectElement);
}

console.log("Project detail page functionality loaded");`;

  document.getElementById("projectDetailJSOutput").textContent = jsCode;
  document.getElementById("projectDetailJSSection").style.display = "block";
  document
    .getElementById("projectDetailJSSection")
    .classList.remove("section-changed");
  document
    .getElementById("projectDetailJSSection")
    .classList.add("section-generated");
  changedSections.delete("project-detail-js");
}

function generateGalleryJS() {
  const jsCode = `// Gallery page functionality
// Generated by Website Manager

const galleryData = ${JSON.stringify(gallery, null, 2)};

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");
  const tagSelect = document.getElementById("tag");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const modal = document.getElementById("imageModal");
  const autocompleteList = document.getElementById("autocomplete-list");

  // Build autocomplete suggestions from existing data
  const autocompleteSuggestions = buildAutocompleteSuggestions();

  function buildAutocompleteSuggestions() {
    const suggestions = new Set();

    galleryItems.forEach((item) => {
      // Add title words
      const title = item.querySelector(".gallery-title").textContent;
      title.split(/\\s+/).forEach((word) => {
        if (word.length > 2) suggestions.add(word.toLowerCase());
      });

      // Add tags from data-tags attribute
      const tags = item.dataset.tags.split(",");
      tags.forEach((tag) => {
        suggestions.add(tag.toLowerCase());
      });

      // Add category
      if (item.dataset.category) {
        suggestions.add(item.dataset.category.toLowerCase());
      }
    });

    return Array.from(suggestions).sort();
  }

  function showAutocompleteSuggestions(value) {
    if (!value || value.length < 2) {
      autocompleteList.style.display = "none";
      return;
    }

    const filteredSuggestions = autocompleteSuggestions
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
          \`<div class="autocomplete-suggestion">\${suggestion}</div>\`,
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
          filterImages();
        });
      });
  }

  function clearFilters() {
    searchInput.value = "";
    categorySelect.value = "";
    tagSelect.value = "";
    autocompleteList.style.display = "none";

    galleryItems.forEach((item) => {
      item.style.display = "block";
    });

    updateStats(galleryItems.length);

    // Update results display
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = \`Showing \${galleryItems.length} of \${galleryItems.length} images\`;
  }

  // Filter functionality
  function filterImages() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const selectedTag = tagSelect.value;

    let visibleCount = 0;

    galleryItems.forEach((item) => {
      const title = item
        .querySelector(".gallery-title")
        .textContent.toLowerCase();
      const description = item
        .querySelector(".gallery-description")
        .textContent.toLowerCase();
      const tags = item.dataset.tags.split(",");
      const category = item.dataset.category;

      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      const matchesCategory =
        selectedCategory === "" || category === selectedCategory;
      const matchesTag = selectedTag === "" || tags.includes(selectedTag);

      const isVisible = matchesSearch && matchesCategory && matchesTag;

      item.style.display = isVisible ? "block" : "none";

      if (isVisible) {
        visibleCount++;
      }
    });

    // Update stats and results display
    updateStats(visibleCount);
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = \`Showing \${visibleCount} of \${galleryItems.length} images\`;
  }

  function updateStats(visibleCount) {
    const statsNumbers = document.querySelectorAll(".stat-number");
    if (statsNumbers.length >= 3) {
      statsNumbers[2].textContent = visibleCount; // Currently Showing
    }
  }

  // Event listeners for filtering
  searchInput.addEventListener("input", (e) => {
    showAutocompleteSuggestions(e.target.value);
    filterImages();
  });

  searchInput.addEventListener("blur", () => {
    // Hide autocomplete with delay to allow clicks
    setTimeout(() => {
      autocompleteList.style.display = "none";
    }, 200);
  });

  categorySelect.addEventListener("change", filterImages);
  tagSelect.addEventListener("change", filterImages);
  clearFiltersBtn.addEventListener("click", clearFilters);

  // Hide autocomplete when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target) &&
      !autocompleteList.contains(e.target)
    ) {
      autocompleteList.style.display = "none";
    }
  });

  // Tag click functionality
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("tag") && e.target.dataset.tag) {
      tagSelect.value = e.target.dataset.tag;
      filterImages();
    }
  });

  // Make gallery items clickable to open modal
  document.addEventListener("click", function (e) {
    const galleryItem = e.target.closest(".gallery-item");
    if (galleryItem) {
      const imageId = galleryItem.dataset.imageId;
      if (imageId) {
        openModal(imageId);
      }
    }
  });

  console.log("Gallery page functionality loaded");
});

// Modal functionality - global functions
function openModal(imageId) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalTags = document.getElementById("modalTags");
  const modalDownload = document.getElementById("modalDownload");

  const imageData = galleryData[imageId];
  if (!imageData) return;

  modalImage.src = imageData.url;
  modalImage.alt = imageData.title;
  modalTitle.textContent = imageData.title;
  modalDescription.textContent = imageData.description;

  modalTags.innerHTML = "";
  imageData.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = \`#\${tag}\`;
    modalTags.appendChild(tagElement);
  });

  modalDownload.onclick = () =>
    downloadImage(imageData.url, \`\${imageData.title}.jpg\`);

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

function downloadImage(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Keyboard navigation for modal
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});`;

  document.getElementById("galleryJSOutput").textContent = jsCode;
  document.getElementById("galleryJSSection").style.display = "block";
  document
    .getElementById("galleryJSSection")
    .classList.remove("section-changed");
  document
    .getElementById("galleryJSSection")
    .classList.add("section-generated");
  changedSections.delete("gallery-js");
}

// Helper functions
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

// Utility functions
function showMessage(message, type) {
  const messageEl = document.getElementById(
    type === "success" ? "successMessage" : "errorMessage",
  );
  messageEl.textContent = message;
  messageEl.style.display = "block";
  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showMessage("Code copied to clipboard!", "success");

    // Update section indicator
    const section = element.closest(".section");
    if (section) {
      section.classList.remove("section-generated");
    }

    // Check if all files have been copied
    setTimeout(() => {
      if (changedSections.size === 0) {
        clearChangeTracking();
      }
    }, 100);
  });
}

function backupData() {
  const backup = {
    projects: projects,
    gallery: gallery,
    websiteSettings: websiteSettings,
    categories: categories,
    imageCategories: imageCategories,
    allTags: allTags,
    allImageTags: allImageTags,
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `website-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showMessage("Backup downloaded successfully!", "success");
}

function resetAllData() {
  if (
    confirm(
      "Are you sure you want to reset ALL data? This will delete EVERYTHING including all projects, images, categories, and tags!",
    )
  ) {
    if (
      confirm(
        "This will delete ALL projects, images, categories, tags, and reset to a completely clean slate. Are you absolutely sure?",
      )
    ) {
      // Reset everything to empty state
      projects = {};
      gallery = {};
      categories = [];
      imageCategories = [];
      allTags = [];
      allImageTags = [];
      projectTags = [];
      imageTags = [];
      editingProjectId = null;
      editingImageId = null;

      refreshProjectsList();
      refreshImagesList();
      updateAllStats();
      populateDropdowns();
      setupProjectImageSelector();

      // Mark all sections as changed
      markAllSectionsChanged();

      showMessage("All data has been reset to a clean slate!", "success");
    }
  }
}

console.log("Website Manager loaded successfully!");
