/**
 * LicitaEvolution Landing Page JavaScript
 * Interactive functionality for modern landing page
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Debounce function to limit function calls
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit function calls
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to target element
     */
    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // ========================================
    // LOADING SCREEN
    // ========================================

    const loadingScreen = document.getElementById('loading');

    function hideLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Hide loading screen after page load
    window.addEventListener('load', () => {
        setTimeout(hideLoadingScreen, 1500);
    });

    // ========================================
    // NAVIGATION
    // ========================================

    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    const handleNavbarScroll = throttle(() => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 16);

    window.addEventListener('scroll', handleNavbarScroll);

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
        });
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // ========================================
    // HERO SECTION ANIMATIONS
    // ========================================

    // Animated typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        heroTitle.innerHTML = '';

        setTimeout(() => {
            heroTitle.innerHTML = originalText;
            heroTitle.style.opacity = '1';
        }, 2000);
    }

    // Animated counters for stats
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const increment = target / 100;
        let current = 0;
        const suffix = element.textContent.replace(/[\d]/g, '');

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 20);
    }

    // Observe stats for animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });

    // ========================================
    // DASHBOARD PREVIEW ANIMATION
    // ========================================

    const dashboardPreview = document.querySelector('.dashboard-preview');
    if (dashboardPreview) {
        // Add floating animation
        let floatDirection = 1;

        setInterval(() => {
            const currentTransform = dashboardPreview.style.transform || 'translateY(0px)';
            const currentY = parseInt(currentTransform.match(/translateY\(([-\d]+)px\)/) || [0, 0])[1];

            if (currentY >= 10) floatDirection = -1;
            if (currentY <= -10) floatDirection = 1;

            dashboardPreview.style.transform = `translateY(${currentY + floatDirection}px)`;
        }, 100);
    }

    // Animate chart bars
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.height = bar.style.height || '50%';
        }, index * 200 + 3000);
    });

    // ========================================
    // CLAUDE DEMO ANIMATION
    // ========================================

    const claudeMessages = document.querySelectorAll('.claude-messages .message');

    // Animate messages appearance
    claudeMessages.forEach((message, index) => {
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.animation = 'fadeInMessage 0.5s ease-out forwards';
        }, index * 2000 + 1000);
    });

    // Typing indicator animation
    const typingIndicators = document.querySelectorAll('.typing-indicator span');
    typingIndicators.forEach((dot, index) => {
        dot.style.animationDelay = `${index * 0.16}s`;
    });

    // ========================================
    // PRICING TOGGLE
    // ========================================

    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyAmounts = document.querySelectorAll('.amount.monthly');
    const yearlyAmounts = document.querySelectorAll('.amount.yearly');

    if (pricingToggle) {
        pricingToggle.addEventListener('change', () => {
            const isYearly = pricingToggle.checked;

            monthlyAmounts.forEach(amount => {
                amount.style.display = isYearly ? 'none' : 'block';
            });

            yearlyAmounts.forEach(amount => {
                amount.style.display = isYearly ? 'block' : 'none';
            });

            // Add animation class to pricing cards
            const pricingCards = document.querySelectorAll('.pricing-card');
            pricingCards.forEach(card => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });
    }

    // ========================================
    // FORM HANDLING
    // ========================================

    // Demo form
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = demoForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';
            submitBtn.disabled = true;

            // Simulate form submission
            try {
                const formData = new FormData(demoForm);
                const data = Object.fromEntries(formData);

                // Here you would normally send data to your backend
                console.log('Demo form data:', data);

                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Show success message
                showNotification('Demonstração agendada com sucesso! Entraremos em contato em breve.', 'success');
                demoForm.reset();

            } catch (error) {
                console.error('Error submitting demo form:', error);
                showNotification('Erro ao agendar demonstração. Tente novamente.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);

                // Here you would normally send data to your backend
                console.log('Contact form data:', data);

                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Show success message
                showNotification('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
                contactForm.reset();

            } catch (error) {
                console.error('Error submitting contact form:', error);
                showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Form validation
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            field.classList.remove('error');

            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }

            // Email validation
            if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    field.classList.add('error');
                    isValid = false;
                }
            }

            // Phone validation
            if (field.type === 'tel' && field.value) {
                const phoneRegex = /^[\(\)\s\-\+\d]{10,}$/;
                if (!phoneRegex.test(field.value)) {
                    field.classList.add('error');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Real-time validation
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        input.addEventListener('input', () => {
            input.classList.remove('error');
        });
    });

    // ========================================
    // NOTIFICATIONS
    // ========================================

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: getNotificationColor(type),
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideInFromRight 0.3s ease-out',
            fontSize: '14px'
        });

        // Add CSS for animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutToRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    margin-left: 12px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    function getNotificationColor(type) {
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#2563eb'
        };
        return colors[type] || colors.info;
    }

    // ========================================
    // BACK TO TOP BUTTON
    // ========================================

    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        const handleBackToTopVisibility = throttle(() => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 16);

        window.addEventListener('scroll', handleBackToTopVisibility);

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================

    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100,
            delay: 0
        });
    }

    // Custom scroll animations for specific elements
    const animateOnScrollElements = document.querySelectorAll('.feature-card, .benefit-card, .pricing-card, .testimonial-card');

    const scrollAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateOnScrollElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        scrollAnimationObserver.observe(element);
    });

    // ========================================
    // INTERACTIVE ELEMENTS
    // ========================================

    // Parallax effect for hero background
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const handleParallax = throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            const heroParticles = document.querySelector('.hero-particles');
            if (heroParticles) {
                heroParticles.style.transform = `translateY(${rate}px)`;
            }
        }, 16);

        window.addEventListener('scroll', handleParallax);
    }

    // Interactive cards hover effects
    const interactiveCards = document.querySelectorAll('.feature-card, .benefit-card, .pricing-card');

    interactiveCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // ========================================
    // PERFORMANCE OPTIMIZATIONS
    // ========================================

    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical resources
    function preloadResource(href, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        document.head.appendChild(link);
    }

    // Preload key assets
    preloadResource('assets/images/logo.svg', 'image');

    // ========================================
    // ANALYTICS & TRACKING
    // ========================================

    // Track user interactions
    function trackEvent(category, action, label) {
        // Integration with Google Analytics or other tracking services
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }

        console.log(`Event tracked: ${category} - ${action} - ${label}`);
    }

    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-demo');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('CTA', 'click', button.textContent.trim());
        });
    });

    // Track section views
    const trackingSections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackEvent('Section View', 'scroll', entry.target.id);
            }
        });
    }, { threshold: 0.5 });

    trackingSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ========================================
    // ERROR HANDLING
    // ========================================

    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        // You could send this to an error tracking service
    });

    // ========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }

        // Enter key activates buttons
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#inicio';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        z-index: 10001;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Announce dynamic content changes to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ========================================
    // INITIALIZATION COMPLETE
    // ========================================

    console.log('LicitaEvolution landing page initialized successfully');
    announceToScreenReader('Página carregada e pronta para interação');

    // Dispatch custom event for other scripts
    const initEvent = new CustomEvent('licitaEvolutionReady', {
        detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(initEvent);
});

// ========================================
// EXTERNAL API INTEGRATION EXAMPLE
// ========================================

/**
 * Example function for integrating with external APIs
 * This could be used for lead capture, analytics, etc.
 */
async function submitLeadData(formData) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error submitting lead data:', error);
        throw error;
    }
}

/**
 * Example function for A/B testing
 */
function initializeABTesting() {
    // This would integrate with your A/B testing platform
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    document.body.classList.add(`variant-${variant}`);

    // Track which variant the user sees
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_view', {
            custom_parameter: variant
        });
    }
}

/**
 * Example function for live chat integration
 */
function initializeLiveChat() {
    // This would integrate with your live chat service (Intercom, Zendesk, etc.)
    window.addEventListener('load', () => {
        // Load chat widget after page is fully loaded
        const chatScript = document.createElement('script');
        chatScript.src = 'https://widget.intercom.io/widget/your-app-id';
        chatScript.async = true;
        document.head.appendChild(chatScript);
    });
}

// Call initialization functions if needed
// initializeABTesting();
// initializeLiveChat();