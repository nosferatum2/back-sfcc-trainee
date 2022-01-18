$(document).ready(function () {
    var sidenav = $('.sg-sidenav');

    $('.sg-sidenav-icon').on('click', function () {
        sidenav.toggle();
        $(this).toggleClass('sg-sidenav-icon-border');
    });

    $('.sg-sidenav a[href*=\\#]').on('click', function () {
        if (window.matchMedia('(min-width: 576px)').matches) {
            $('html, body').animate({ scrollTop: $(this.hash).offset().top }, 500);
        } else {
            $('html, body').animate({ scrollTop: $(this.hash).offset().top - sidenav.height() }, 500);
        }
    });
});
