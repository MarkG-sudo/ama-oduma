// 🔁 Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // 🔗 Get references for menu toggle, navigation links, and page sections
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll("section");

    // 📏 Get height of header for offset
    const offset = document.querySelector("header").offsetHeight - 10;

    // 🍔 Toggle mobile menu when hamburger is clicked
    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });

    // 🧭 Smooth scroll to section and close menu on link click
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

    // 🌐 Highlight active nav link when scrolling
    function highlightNav() {
        let scrollPosition = window.scrollY + offset;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - offset;
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

    // 📡 Run highlight function on scroll
    window.addEventListener("scroll", highlightNav);
});

// 🍔 Mobile Navigation Toggle and Scroll
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const links = document.querySelectorAll(".nav-links a");

    // 🍔 Open/close menu on hamburger click
    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        document.body.classList.toggle("nav-open");
    });

    // 📍 Smooth scroll and close nav (on mobile)
    links.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }

            if (window.innerWidth <= 768) {
                navLinks.classList.remove("active");
                document.body.classList.remove("nav-open");
            }
        });
    });
});

// 🖼️ Gallery Carousel Logic
let currentIndex = 1;
const slides = document.querySelectorAll(".gallery-item");
const totalSlides = slides.length;
const galleryGrid = document.querySelector(".gallery-grid");
const galleryContainer = document.querySelector(".gallery-container");
const dotsContainer = document.querySelector(".gallery-dots");

// 🔁 Clone slides for seamless infinite loop
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[totalSlides - 1].cloneNode(true);
galleryGrid.appendChild(firstClone);
galleryGrid.insertBefore(lastClone, slides[0]);

const updatedSlides = document.querySelectorAll(".gallery-item");
const newTotalSlides = updatedSlides.length;

// 📏 Initial slide position
galleryGrid.style.transform = `translateX(-100%)`;

// ⚫ Create navigation dots
slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("gallery-dot");
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".gallery-dot");
dots[0].classList.add("active");

// 🚀 Update slide position and dot
function updateSlidePosition() {
    galleryGrid.style.transition = "transform 0.5s ease-in-out";
    const offset = -currentIndex * 100;
    galleryGrid.style.transform = `translateX(${offset}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex - 1);
    });

    // 🔁 Loop back if at cloned slide
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

// 👆 Touch swipe for mobile navigation
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

// 🔘 Dot navigation
dots.forEach((dot) => {
    dot.addEventListener("click", () => {
        currentIndex = parseInt(dot.dataset.index) + 1;
        updateSlidePosition();
    });
});

// ⬅️➡️ Prev/Next Buttons
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
}

// ⏩ Slide functions
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

// ✨ Fortune Text Updater
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

    // 🎉 First fortune
    updateFortune();

    // 🔄 Change every 10 seconds
    setInterval(updateFortune, 10000);
});

// 🔝 Scroll to Top Button
const scrollBtn = document.getElementById("scrollToTopBtn");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollBtn.classList.add("show");
    } else {
        scrollBtn.classList.remove("show");
    }
});

scrollBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
