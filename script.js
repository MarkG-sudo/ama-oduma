document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    // Toggle menu when clicking the hamburger
    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("open"); // For animation if needed
    });

    // Close menu when a link is clicked (only on mobile)
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) { 
                navLinks.classList.remove("active");
                hamburger.classList.remove("open"); // Ensure it closes
            }
        });
    });
});


let currentIndex = 1; // Start at the first real image (since we added clones)
const slides = document.querySelectorAll(".gallery-item");
const totalSlides = slides.length;
const galleryGrid = document.querySelector(".gallery-grid");
const galleryContainer = document.querySelector(".gallery-container");
const dotsContainer = document.querySelector(".gallery-dots");

// Clone first and last slides for seamless looping
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[totalSlides - 1].cloneNode(true);

galleryGrid.appendChild(firstClone);
galleryGrid.insertBefore(lastClone, slides[0]);

const updatedSlides = document.querySelectorAll(".gallery-item"); // Update slides count
const newTotalSlides = updatedSlides.length;

// Adjust initial position
galleryGrid.style.transform = `translateX(-100%)`;

// Create dots dynamically
slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("gallery-dot");
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".gallery-dot");
dots[0].classList.add("active"); // First dot active

function updateSlidePosition() {
    galleryGrid.style.transition = "transform 0.5s ease-in-out";
    const offset = -currentIndex * 100; 
    galleryGrid.style.transform = `translateX(${offset}%)`;

    // Update dots (ignore clones)
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex - 1);
    });

    setTimeout(() => {
        if (currentIndex === newTotalSlides - 1) {
            galleryGrid.style.transition = "none";
            currentIndex = 1;
            galleryGrid.style.transform = `translateX(-100%)`;
        } else if (currentIndex === 0) {
            galleryGrid.style.transition = "none";
            currentIndex = totalSlides;
            galleryGrid.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }, 500);
}

// Swipe gestures for mobile
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

galleryContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});

galleryContainer.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0].clientX;
});

galleryContainer.addEventListener("touchend", () => {
    const swipeDistance = touchStartX - touchEndX;

    if (swipeDistance > swipeThreshold) {
        nextSlide();
    } else if (swipeDistance < -swipeThreshold) {
        prevSlide();
    }
});

// Click event for dots
dots.forEach((dot) => {
    dot.addEventListener("click", () => {
        currentIndex = parseInt(dot.dataset.index) + 1;
        updateSlidePosition();
    });
});

// Arrows (ensure buttons exist)
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
}

function nextSlide() {
    if (currentIndex >= newTotalSlides - 1) return;
    currentIndex++;
    updateSlidePosition();
}

function prevSlide() {
    if (currentIndex <= 0) return;
    currentIndex--;
    updateSlidePosition();
}
