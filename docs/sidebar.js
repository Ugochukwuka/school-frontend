// Sidebar Navigation and Content Loading
document.addEventListener('DOMContentLoaded', function() {
    const contentBody = document.getElementById('contentBody');
    const contentLoading = document.getElementById('contentLoading');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileClose = document.getElementById('mobileClose');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('themeToggle');

    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Theme toggle
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.add('open');
        });
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', function() {
            sidebar.classList.remove('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Load section content
    function loadSection(sectionId) {
        // Show loading
        contentBody.style.display = 'none';
        contentLoading.style.display = 'block';

        // Check if sectionContent is available
        if (typeof window.sectionContent === 'undefined' || !window.sectionContent[sectionId]) {
            setTimeout(() => {
                contentLoading.style.display = 'none';
                contentBody.innerHTML = '<div class="error-message"><h2>Error Loading Content</h2><p>Unable to load the ' + sectionId + ' section. Please try again later.</p></div>';
                contentBody.style.display = 'block';
            }, 300);
            return;
        }

        // Simulate loading delay for smooth transition
        setTimeout(() => {
            const content = window.sectionContent[sectionId];
            contentBody.innerHTML = content;
            contentBody.style.display = 'block';
            contentLoading.style.display = 'none';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Close mobile sidebar
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        }, 200);
    }

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Load section
            loadSection(sectionId);
        });
    });

    // Load initial section (Introduction)
    if (navLinks.length > 0) {
        const firstLink = navLinks[0];
        firstLink.classList.add('active');
        loadSection('introduction');
    }
});
