document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll("section");
    const offset = document.querySelector("header").offsetHeight - 10; // Adjust offset for sticky header

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked and scroll smoothly
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            navMenu.classList.remove("active");

            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    function highlightNav() {
        let scrollPosition = window.scrollY + offset; // Adjust scroll position

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - offset; // Ensure section aligns correctly
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    window.addEventListener("scroll", highlightNav);
});






document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const links = document.querySelectorAll(".nav-links a");

    // 🟢 Toggle menu on click
    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        document.body.classList.toggle("nav-open"); // Prevent scrolling
    });

    // 🔵 Close menu when a link is clicked (only on mobile)
    links.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default jump
            const targetId = link.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" }); // Smooth scroll
            }

            if (window.innerWidth <= 768) { 
                navLinks.classList.remove("active");
                document.body.classList.remove("nav-open"); // Restore scrolling
            }
        });
    });
});

// body

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



document.addEventListener("DOMContentLoaded", function () {
    const fortunes = [
        "Elegance is timeless, sustainability is priceless.",
        "Carry the culture, wear the legacy.",
        "Your bag, your story, your statement.",
        "Sustainability never goes out of style.",
        "Crafted with heart, carried with pride."
    ];

    const fortuneText = document.getElementById("fortune-text");

    function updateFortune() {
        fortuneText.innerText = fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    // Set initial fortune
    updateFortune();

    // Update fortune every 10 seconds
    setInterval(updateFortune, 10000);
});
