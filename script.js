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
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                event.preventDefault();
                targetSection.scrollIntoView({ behavior: "smooth" });
                navMenu.classList.remove("active");
            }
            
        });
    });

    // 🌐 Highlight active nav link when scrolling
    function highlightNav() {
        const scrollPosition = window.scrollY;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - offset;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {
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

    // 🍔 Mobile Navigation Toggle and Scroll
    const hamburger = document.querySelector(".hamburger");
    const mobileNavLinks = document.querySelector(".nav-links");
    const links = document.querySelectorAll(".nav-links a");

    // 🍔 Open/close menu on hamburger click
    hamburger.addEventListener("click", function () {
        mobileNavLinks.classList.toggle("active");
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
                mobileNavLinks.classList.remove("active");
                document.body.classList.remove("nav-open");
            }
        });
    });

    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.hero-nav.prev');
    const nextBtn = document.querySelector('.hero-nav.next');

    let current = 0;
    let interval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    function prevSlide() {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    }

    function goToSlide(index) {
        current = index;
        showSlide(current);
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
        });
    });

    // Autoplay every 6 seconds
    function startInterval() {
        interval = setInterval(nextSlide, 6000);
    }

    function resetInterval() {
        clearInterval(interval);
        startInterval();
    }

    // Init
    showSlide(current);
    startInterval();
    

    // ✨ Fortune Text Updater
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

// 🖼️ Gallery Carousel Logic
let galleryIndex = 1;
const gallerySlides = document.querySelectorAll(".gallery-item");
const galleryTotal = gallerySlides.length;
const galleryGrid = document.querySelector(".gallery-grid");
const galleryContainer = document.querySelector(".gallery-container");
const galleryDotsContainer = document.querySelector(".gallery-dots");

// Clones
const firstClone = gallerySlides[0].cloneNode(true);
const lastClone = gallerySlides[galleryTotal - 1].cloneNode(true);
galleryGrid.appendChild(firstClone);
galleryGrid.insertBefore(lastClone, gallerySlides[0]);

const updatedGallerySlides = document.querySelectorAll(".gallery-item");
const updatedGalleryTotal = updatedGallerySlides.length;

galleryGrid.style.transform = `translateX(-100%)`;

// Create gallery dots
gallerySlides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("gallery-dot");
    dot.dataset.index = i;
    galleryDotsContainer.appendChild(dot);
});

const galleryDots = document.querySelectorAll(".gallery-dot");
galleryDots[0].classList.add("active");

// Update gallery position
function updateGalleryPosition() {
    galleryGrid.style.transition = "transform 0.5s ease-in-out";
    const offset = -galleryIndex * 100;
    galleryGrid.style.transform = `translateX(${offset}%)`;

    galleryDots.forEach((dot, index) => {
        dot.classList.toggle("active", index === galleryIndex - 1);
    });

    setTimeout(() => {
        if (galleryIndex === updatedGalleryTotal - 1) {
            galleryGrid.style.transition = "none";
            galleryIndex = 1;
            galleryGrid.style.transform = `translateX(-100%)`;
        } else if (galleryIndex === 0) {
            galleryGrid.style.transition = "none";
            galleryIndex = galleryTotal;
            galleryGrid.style.transform = `translateX(-${galleryIndex * 100}%)`;
        }
    }, 500);
}

// Gallery navigation
function nextGallerySlide() {
    if (galleryIndex >= updatedGalleryTotal - 1) return;
    galleryIndex++;
    updateGalleryPosition();
}

function prevGallerySlide() {
    if (galleryIndex <= 0) return;
    galleryIndex--;
    updateGalleryPosition();
}

// Touch/swipe
let touchStartX = 0;
let touchEndX = 0;
galleryContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});
galleryContainer.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0].clientX;
});
galleryContainer.addEventListener("touchend", () => {
    const swipeDistance = touchStartX - touchEndX;
    if (swipeDistance > 50) {
        nextGallerySlide();
    } else if (swipeDistance < -50) {
        prevGallerySlide();
    }
});

// Dots
galleryDots.forEach((dot) => {
    dot.addEventListener("click", () => {
        galleryIndex = parseInt(dot.dataset.index) + 1;
        updateGalleryPosition();
    });
});

// Buttons
const galleryPrevBtn = document.querySelector(".gallery-nav.prev");
const galleryNextBtn = document.querySelector(".gallery-nav.next");

if (galleryPrevBtn && galleryNextBtn) {
    galleryPrevBtn.addEventListener("click", prevGallerySlide);
    galleryNextBtn.addEventListener("click", nextGallerySlide);
}



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
