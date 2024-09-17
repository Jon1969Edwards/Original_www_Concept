document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const footer = document.getElementById('footer');

    hamburger.addEventListener('click', function() {
        footer.classList.toggle('open');
        popup.classList.add('close-pop-up');
    });

// Fullscreen toggle Functionality ===========================================
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', toggleFullScreen);

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            .then(() => {
                fullscreenBtn.textContent = "Exit Fullscreen";
            })
            .catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen()
            .then(() => {
                fullscreenBtn.textContent = "Go Fullscreen";
            })
            .catch(err => {
                console.error(`Error attempting to exit full-screen mode: ${err.message}`);
            });
        }
    };


// Update fullscreen button ===================================================
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.textContent = "Go Fullscreen";
            // fullscreenBtn.style.display = "block"; // Ensure the button is visible
        } else {
            fullscreenBtn.textContent = "Exit Fullscreen";
            // fullscreenBtn.style.display = "block"; // Ensure the button remains visible
        }
    });



// Open / Close / HandleSubmit on Contact Us Modal  ==============================
    const contactModal = document.getElementById('contactModal');
    const openContactModalBtn = document.getElementById('open-modal-btn');
    const closeContactModalBtn = document.getElementById('close-modal-btn');

    openContactModalBtn.addEventListener('click', openContactModal);   
    function openContactModal() {
        contactModal.style.display = 'flex';
        setTimeout(() => {
                contactModal.classList.add('open');
            }, 10);
    };

    closeContactModalBtn.addEventListener('click', closeContactModal);
    function closeContactModal() {
        contactModal.classList.remove('open');
        setTimeout(() => {
            contactModal.style.display = 'none';
        }, 10);
    }


    window.handleSubmit = function(event) {
        event.preventDefault();

        const form = document.getElementById('contactForm');
        const thankYouMessage = document.getElementById('thankYouMessage');
        const modalContent = document.querySelector('.modal-content');
        const closeButton = document.querySelector('.modal-close');

        modalContent.innerHTML = '';
        modalContent.appendChild(closeButton);
        modalContent.appendChild(thankYouMessage);
        thankYouMessage.style.display = 'block';

        setTimeout(() => {
            closeContactModal();
            thankYouMessage.style.display = 'none';
            form.reset();
        }, 3000);
    }




// Privacy Policy Modal ============================================
    window.openPrivacyModal = function() {
        const privacyModal = document.getElementById('privacyModal');
        privacyModal.style.display = 'flex';
        closeHamburgerMenu(); // Close the hamburger menu when the modal opens
    }

    window.closePrivacyModal = function() {
        const privacyModal = document.getElementById('privacyModal');
        privacyModal.style.display = 'none';
    }

    // Terms of Use Modal ==============================================
    window.openTermsModal = function() {
        const termsModal = document.getElementById('termsModal');
        termsModal.style.display = 'flex';
        closeHamburgerMenu(); // Close the hamburger menu when the modal opens
    }

    window.closeTermsModal = function() {
        const termsModal = document.getElementById('termsModal');
        termsModal.style.display = 'none';
    }

    // Close Modals if clicked outside of them
    window.onclick = function(event) {
        const contactModal = document.getElementById('contactModal');
        const privacyModal = document.getElementById('privacyModal');
        const termsModal = document.getElementById('termsModal');
        // const modalOverlay = document.getElementById('modal-overlay');

        if (event.target === privacyModal) {
            closePrivacyModal();
        } else if (event.target === termsModal) {
            closeTermsModal();
        } else if (event.target === contactModal) {
            closeContactModal(); // For the Contact Us modal
        }
    }

// Function to close the hamburger menu (DO WE WANT TO CLOSE footer ON MODAL CLICKS) ============================
// function closeHamburgerMenu() {
//     const footer = document.getElementById('footer');
//     if (footer.classList.contains('open')) {
//         footer.classList.remove('open')
//     }
// }



// Slide In Instructions ============================================
    const popup = document.getElementById('navigationPopup');
    const closeBtn = document.getElementById('closePopup');
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    // const navigationPopup = document.getElementById('navigationPopup');

    // Toggle the popup when button in hamburger menu is clicked
    togglePopupBtn.addEventListener('click', function() {
        popup.classList.toggle('open'); // Add or remove the 'open' class
        if (popup.classList.contains('open')) {
            popup.classList.remove('close-pop-up');
        } else {
            popup.classList.add('close-pop-up');
        }

        // Close hamburger menu when popup is opened
        if (footer.classList.contains('open')) {
            footer.classList.remove('open');
        }
    });

    // Close the popup when the close button is clicked
    closeBtn.addEventListener('click', function() {
        popup.classList.add('close-pop-up');
    });

});