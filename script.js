// Static site JavaScript functionality

document.addEventListener("DOMContentLoaded", function () {
  // Header scroll effect
  const header = document.querySelector(".header");

  function handleScroll() {
    const isScrolled = window.scrollY > 20;
    header.classList.toggle("scrolled", isScrolled);
  }

  window.addEventListener("scroll", handleScroll);

  // Mobile menu toggle
  const mobileMenuButton = document.querySelector(".mobile-menu");
  const nav = document.querySelector(".nav");

  if (mobileMenuButton && nav) {
    mobileMenuButton.addEventListener("click", function () {
      nav.classList.toggle("hidden");
    });
  }

  // Set active navigation link based on current page
  function setActiveNavLink() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (
        href === currentPage ||
        (currentPage === "" && href === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  setActiveNavLink();

  // Add status icons to badges on homepage
  function addStatusIcons() {
    document.querySelectorAll(".badge").forEach((badge) => {
      const text = badge.textContent.trim();
      let icon = "";

      if (text === "COMPLETED") {
        icon =
          '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      } else if (text === "IN PROGRESS") {
        icon =
          '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      } else if (text === "PLANNING") {
        icon =
          '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      } else if (text === "PAUSED") {
        icon =
          '<svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      }

      if (icon) {
        badge.innerHTML = icon + text;
      }
    });
  }

  // Add icons to badges if on homepage
  if (
    window.location.pathname.split("/").pop() === "index.html" ||
    window.location.pathname === "/"
  ) {
    addStatusIcons();
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Add loading animation to buttons
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      // Only add loading state for form submissions or downloads
      if (
        this.type === "submit" ||
        (this.href && this.href.includes("download"))
      ) {
        this.style.opacity = "0.7";
        this.style.pointerEvents = "none";

        setTimeout(() => {
          this.style.opacity = "1";
          this.style.pointerEvents = "auto";
        }, 1000);
      }
    });
  });

  // Image lazy loading fallback for older browsers
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Console message for developers
  console.log("Electronics Engineering Portfolio - Static Version");
  console.log("Original React app converted to static HTML/CSS/JS");
  console.log("All styling and functionality preserved 1:1");
});

// Utility functions for page-specific functionality

// Function to get URL parameters (for detail pages)
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Function to format dates
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to handle form submissions (for contact page)
function handleFormSubmit(
  formElement,
  successMessage = "Thank you for your message!",
) {
  formElement.addEventListener("submit", function (e) {
    e.preventDefault();

    // Simulate form processing
    const submitButton = formElement.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    setTimeout(() => {
      alert(
        successMessage + " This is a demo form - no actual email was sent.",
      );
      formElement.reset();
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }, 1500);
  });
}

// Export functions for use in other scripts
window.PortfolioUtils = {
  getUrlParameter,
  formatDate,
  handleFormSubmit,
};
