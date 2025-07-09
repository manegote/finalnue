// Gallery page functionality

let galleryData = {};
let galleryItems = [];

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");
  const tagSelect = document.getElementById("tag");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const autocompleteList = document.getElementById("autocomplete-list");

  // Load gallery data and initialize page
  loadGalleryData().then(() => {
    renderGalleryItems();
    setupEventListeners();
  });

  async function loadGalleryData() {
    try {
      const response = await fetch("data/gallery.json");
      galleryData = await response.json();
    } catch (error) {
      console.error("Error loading gallery data:", error);
      galleryData = {};
    }
  }

  function renderGalleryItems() {
    const galleryGrid = document.getElementById("gallery-grid");
    galleryGrid.innerHTML = "";

    const images = Object.values(galleryData);

    images.forEach((image) => {
      const galleryItem = createGalleryItem(image);
      galleryGrid.appendChild(galleryItem);
    });

    // Update the galleryItems reference for filtering
    galleryItems = document.querySelectorAll(".gallery-item");

    // Build autocomplete suggestions from loaded data
    const autocompleteSuggestions = buildAutocompleteSuggestions();
    setupAutocomplete(autocompleteSuggestions);

    // Update filter dropdowns
    populateFilterDropdowns(images);

    // Update initial stats
    updateStats(images.length);
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = `Showing ${images.length} of ${images.length} images`;

    // Update summary stats
    updateSummaryStats(images);
  }

  function createGalleryItem(image) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("data-category", image.category);
    item.setAttribute("data-tags", image.tags.join(","));
    item.setAttribute("data-image-id", image.id);

    const filename = image.title.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";

    item.innerHTML = `
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
    `;

    return item;
  }

  function populateFilterDropdowns(images) {
    // Populate category dropdown
    const categories = [...new Set(images.map((img) => img.category))].sort();
    const categorySelect = document.getElementById("category");
    const currentCategory = categorySelect.value;

    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    categorySelect.value = currentCategory;

    // Populate tag dropdown
    const allTags = [...new Set(images.flatMap((img) => img.tags))].sort();
    const tagSelect = document.getElementById("tag");
    const currentTag = tagSelect.value;

    tagSelect.innerHTML = '<option value="">All Tags</option>';
    allTags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    });
    tagSelect.value = currentTag;
  }

  function updateSummaryStats(images) {
    const categories = new Set(images.map((img) => img.category)).size;
    const uniqueTags = new Set(images.flatMap((img) => img.tags)).size;

    const statsNumbers = document.querySelectorAll(".stat-number");
    if (statsNumbers.length >= 3) {
      statsNumbers[0].textContent = images.length; // Total Images
      statsNumbers[1].textContent = categories; // Categories
      statsNumbers[2].textContent = images.length; // Currently Showing
    }
  }

  function setupEventListeners() {
    searchInput.addEventListener("input", (e) => {
      showAutocompleteSuggestions(e.target.value);
      filterImages();
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        autocompleteList.style.display = "none";
      }, 200);
    });

    categorySelect.addEventListener("change", filterImages);
    tagSelect.addEventListener("change", filterImages);
    clearFiltersBtn.addEventListener("click", clearFilters);

    // Tag click functionality
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("tag")) {
        const tagText = e.target.textContent.replace("#", "");
        tagSelect.value = tagText;
        filterImages();
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

    // Make gallery items clickable to open modal
    document.addEventListener("click", function (e) {
      const galleryItem = e.target.closest(".gallery-item");
      if (galleryItem && !e.target.closest(".overlay-buttons")) {
        const imageId = galleryItem.dataset.imageId;
        if (imageId) {
          openModal(imageId);
        }
      }
    });
  }

  function setupAutocomplete(autocompleteSuggestions) {
    window.autocompleteSuggestions = autocompleteSuggestions;
  }

  function buildAutocompleteSuggestions() {
    const suggestions = new Set();

    Object.values(galleryData).forEach((image) => {
      // Add title words
      image.title.split(/\s+/).forEach((word) => {
        if (word.length > 2) suggestions.add(word.toLowerCase());
      });

      // Add tags
      image.tags.forEach((tag) => {
        suggestions.add(tag.toLowerCase());
      });

      // Add category
      suggestions.add(image.category.toLowerCase());
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
          filterImages();
        });
      });
  }

  function clearFilters() {
    searchInput.value = "";
    categorySelect.value = "";
    tagSelect.value = "";
    autocompleteList.style.display = "none";

    const currentGalleryItems = document.querySelectorAll(".gallery-item");
    currentGalleryItems.forEach((item) => {
      item.style.display = "block";
    });

    updateStats(currentGalleryItems.length);

    // Update results display
    const resultsCount = document.querySelector(".results-count");
    resultsCount.textContent = `Showing ${currentGalleryItems.length} of ${currentGalleryItems.length} images`;
  }

  // Filter functionality
  function filterImages() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const selectedTag = tagSelect.value;

    let visibleCount = 0;
    const currentGalleryItems = document.querySelectorAll(".gallery-item");

    currentGalleryItems.forEach((item) => {
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
    resultsCount.textContent = `Showing ${visibleCount} of ${currentGalleryItems.length} images`;
  }

  function updateStats(visibleCount) {
    const statsNumbers = document.querySelectorAll(".stat-number");
    if (statsNumbers.length >= 3) {
      statsNumbers[2].textContent = visibleCount; // Currently Showing
    }
  }

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
    tagElement.textContent = `#${tag}`;
    modalTags.appendChild(tagElement);
  });

  const filename = imageData.title.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg";
  modalDownload.onclick = () => downloadImage(imageData.url, filename);

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
});
