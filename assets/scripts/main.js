// Changes the navbar color when scrolling
$(function () {
    $(document).scroll(function () {
        var $nav = $(".navbar-expand-md");
        var $nav2 = $('.navbar-toggler');
        var $nav3 = $('.navbar-brand');
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        $nav2.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        $nav3.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
});

// Creates animated scrolling effect
$('a[href*="#"]') // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .on('click', function(event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            // - 70 is the offset/top margin
            $('html, body').animate({
                scrollTop: $(hash).offset().top - 70
            }, 800, function() {
                // Add hash (#) to URL when done scrolling (default click behavior), without jumping to hash
                if (history.pushState) {
                    history.pushState(null, null, hash);
                } else {
                    window.location.hash = hash;
                }
            });
            return false;
        } // End if
    });

// Collapse navbar after link click
$('.js-scroll').on("click", function() {
    $('.navbar-collapse').collapse('hide');
});

// Bio toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Debug log
    const readMoreBtn = document.getElementById('read-more-btn');
    const fullBio = document.getElementById('full-bio');

    if (readMoreBtn && fullBio) {
        readMoreBtn.addEventListener('click', function() {
            console.log('Button clicked'); // Debug log
            const isHidden = fullBio.style.display === 'none' || fullBio.style.display === '';
            
            if (isHidden) {
                // Show bio
                fullBio.style.display = 'block';
                setTimeout(() => {
                    fullBio.classList.add('show');
                    readMoreBtn.textContent = 'Show Less';
                    fullBio.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
            } else {
                // Hide bio
                fullBio.classList.remove('show');
                readMoreBtn.textContent = 'Read Full Bio';
                setTimeout(() => {
                    fullBio.style.display = 'none';
                }, 500);
            }
        });
    } else {
        console.log('Button or bio section not found'); // Debug log
    }
});