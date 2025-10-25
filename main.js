// ✅ MAIN.JS – General UI Logic
document.addEventListener("DOMContentLoaded", function () {
    // ----- MENU TOGGLE -----
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll("section");
    const offset = document.querySelector("header").offsetHeight - 10;

    // Toggle mobile nav
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                e.preventDefault();
                targetSection.scrollIntoView({ behavior: "smooth" });
                navMenu.classList.remove("active");
            }
        });
    });

    // Highlight active nav
    function highlightNav() {
        const scrollPosition = window.scrollY;
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - offset;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
                });
            }
        });
    }
    window.addEventListener("scroll", highlightNav);

    // ----- GALLERY CARDS INTERACTION -----
    const galleryOptions = document.querySelectorAll('.gallery-cards .option');

    if (galleryOptions.length > 0) {
        let currentActive = 0;

        function activateCard(index) {
            // Remove active class from all options
            galleryOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to selected option
            galleryOptions[index].classList.add('active');
            currentActive = index;
        }

        function handleCardClick(index) {
            activateCard(index);
        }

        // Add click events
        galleryOptions.forEach((option, index) => {
            option.addEventListener('click', () => handleCardClick(index));
        });

        // Initialize
        activateCard(0);
    }

    // ----- FORTUNE TEXT -----
    const fortunes = [
        "Elegance is timeless, sustainability is priceless.",
        "Carry the culture, wear the legacy.",
        "Your bag, your story, your statement.",
        "Sustainability never goes out of style.",
        "Crafted with heart, carried with pride."
    ];

    const fortuneText = document.getElementById("fortune-text");

    function updateFortune() {
        if (fortuneText) {
            fortuneText.innerText = fortunes[Math.floor(Math.random() * fortunes.length)];
        }
    }

    if (fortuneText) {
        updateFortune();
        setInterval(updateFortune, 10000);
    }

    // ----- SCROLL TO TOP -----
    const scrollBtn = document.getElementById("scrollToTopBtn");
    if (scrollBtn) {
        window.addEventListener("scroll", () => {
            scrollBtn.classList.toggle("show", window.scrollY > 300);
        });
        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});