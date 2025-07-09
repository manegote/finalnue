// Project detail page functionality

let projectsData = {};

document.addEventListener("DOMContentLoaded", function () {
  // Load projects data first, then initialize
  loadProjectsData().then(() => {
    initializeProjectDetail();
  });
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

function initializeProjectDetail() {
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
}

function populateProjectDetail(project) {
  // Update page title
  document.title = `${project.title} - Electronics Engineering Portfolio`;

  // Update breadcrumb
  document.getElementById("project-breadcrumb").textContent = project.title;

  // Update header content
  document.getElementById("project-cover").src = project.coverImage;
  document.getElementById("project-cover").alt = project.title;
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-description").textContent =
    project.description;

  // Update status with appropriate badge class and icon
  const statusElement = document.getElementById("project-status");
  statusElement.innerHTML =
    getStatusIcon(project.status) +
    project.status.replace("-", " ").toUpperCase();
  statusElement.className = `badge badge-${getStatusClass(project.status)}`;

  // Update category
  document.getElementById("project-category").textContent = project.category;

  // Update dates
  document.getElementById("project-start-date").textContent = formatDate(
    project.startDate,
  );

  if (project.completedDate) {
    document.getElementById("completed-date-container").style.display = "block";
    document.getElementById("project-completed-date").textContent = formatDate(
      project.completedDate,
    );
  }

  // Update reading time
  document.getElementById("project-reading-time").textContent =
    `${project.readingTime} min read`;

  // Update tags
  const tagsContainer = document.getElementById("project-tags");
  tagsContainer.innerHTML = "";
  project.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = `#${tag}`;
    tagsContainer.appendChild(tagElement);
  });

  // Update main content - convert markdown-like content to HTML and inject images
  const detailsContainer = document.getElementById("project-details");
  detailsContainer.innerHTML = convertMarkdownToHTMLWithImages(
    project.details,
    project.images,
  );

  // Update sidebar lists
  updateSidebarList("project-technologies", project.technologies);
  updateSidebarList("project-challenges", project.challenges);
  updateSidebarList("project-outcomes", project.outcomes);

  // Gallery section is now integrated into the content, so we hide the separate gallery
  const gallerySection = document.getElementById("project-gallery-section");
  if (gallerySection) {
    gallerySection.style.display = "none";
  }

  // Show related projects if they exist
  if (project.subprojects || project.parentProject) {
    showRelatedProjects(project);
  }
}

function getStatusClass(status) {
  switch (status) {
    case "completed":
      return "success";
    case "in-progress":
      return "accent";
    case "planning":
      return "warning";
    case "paused":
      return "muted";
    default:
      return "muted";
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
    .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^\s*$/gm, "");

  // Wrap paragraphs
  html = "<p>" + html + "</p>";

  // Fix list formatting
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>\s*(<h[1-6]>)/g, "$1");
  html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)\s*<\/p>/g, "$1");

  return html;
}

function convertMarkdownToHTMLWithImages(markdown, images) {
  let html = convertMarkdownToHTML(markdown);

  // If we have multiple images, inject them into the content
  if (images && images.length > 1) {
    // Find major section breaks (h2 elements) and inject images
    const sections = html.split(/(<h2>.*?<\/h2>)/);
    let imageIndex = 1; // Skip first image (cover image)

    let result = "";
    for (let i = 0; i < sections.length; i++) {
      result += sections[i];

      // After every 2nd section, add an image if available
      if (i > 0 && i % 4 === 0 && imageIndex < images.length) {
        result += `
          <div style="margin: 2rem 0; text-align: center; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background-color: var(--card);">
            <img src="${images[imageIndex]}" alt="Project Image ${imageIndex + 1}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover;" />
            <div style="padding: 1rem; font-size: 0.875rem; color: var(--muted-foreground); text-align: center;">
              Project progress and detailed view
            </div>
          </div>
        `;
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
    parentSection.innerHTML = `
            <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem;">Parent Project</h4>
        `;
    relatedContainer.appendChild(parentSection);

    addRelatedProject(relatedContainer, parentProject);
  }

  // Add section for subprojects
  if (project.subprojects && project.subprojects.length > 0) {
    const subprojectsSection = document.createElement("div");
    subprojectsSection.innerHTML = `
            <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem; margin-top: 1.5rem;">Required Infrastructure</h4>
        `;
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
  projectElement.href = `project-detail.html?id=${project.id}`;
  projectElement.className = "related-project-item";

  // Get status icon
  let statusIcon = "";
  let statusClass = "";
  switch (project.status) {
    case "completed":
      statusIcon =
        '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-success";
      break;
    case "in-progress":
      statusIcon =
        '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-accent";
      break;
    default:
      statusIcon =
        '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      statusClass = "badge-muted";
  }

  projectElement.innerHTML = `
        <div class="related-project-title">${project.title}</div>
        <div class="related-project-description">${project.description}</div>
        <div style="margin-top: 0.75rem;">
            <span class="badge ${statusClass}" style="font-size: 0.625rem; padding: 0.125rem 0.375rem;">
                ${statusIcon}${project.status.replace("-", " ").toUpperCase()}
            </span>
        </div>
    `;

  container.appendChild(projectElement);
}

console.log("Project detail page functionality loaded");
