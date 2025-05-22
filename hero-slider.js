// Scroll to top on full page load
window.addEventListener('load', () => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
});

// Main logic on DOM ready
document.addEventListener("DOMContentLoaded", function () {
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

    function startInterval() {
        interval = setInterval(nextSlide, 6000);
    }

    function resetInterval() {
        clearInterval(interval);
        startInterval();
    }

    // Event listeners
    nextBtn?.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
        });
    });

    // Init
    showSlide(current);
    startInterval();
});
