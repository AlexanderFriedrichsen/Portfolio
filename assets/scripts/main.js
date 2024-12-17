$(document).ready(function() {
    // Bio toggle code
    $('#read-more-btn').click(function() {
        var fullBio = $('#full-bio');
        var button = $(this);
        
        if (fullBio.is(':hidden')) {
            // Show bio
            fullBio.slideDown(300); // Use slideDown instead of show
            button.text('Show Less');
            
            // Scroll after showing
            $('html, body').animate({
                scrollTop: fullBio.offset().top - 100
            }, 500);
        } else {
            // Hide bio
            fullBio.slideUp(300); // Use slideUp instead of hide
            button.text('Read Full Bio');
        }
    });

    // Navbar color change
    $(document).scroll(function() {
        var $nav = $(".navbar-expand-md");
        var $nav2 = $('.navbar-toggler');
        var $nav3 = $('.navbar-brand');
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        $nav2.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        $nav3.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    // Animated scrolling effect
    $('a[href*="#"]')
        .not('[href="#"]')
        .not('[href="#0"]')
        .on('click', function(event) {
            if (this.hash !== "") {
                var hash = this.hash;
                
                $('html, body').animate({
                    scrollTop: $(hash).offset().top - 70
                }, 800, function() {
                    if (history.pushState) {
                        history.pushState(null, null, hash);
                    } else {
                        window.location.hash = hash;
                    }
                });
                return false;
            }
        });

    // Collapse navbar
    $('.js-scroll').on("click", function() {
        $('.navbar-collapse').collapse('hide');
    });
});