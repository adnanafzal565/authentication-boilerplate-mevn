(function ($) {
	"use strict";
	
	/*----------------------------
    Responsive menu Active
    ------------------------------ */
	$(".mainmenu ul#primary-menu").slicknav({
		allowParentLinks: true,
		prependTo: '.responsive-menu',
	});
	
	/*----------------------------
    START - Scroll to Top
    ------------------------------ */
	$(window).on('scroll', function() {
		if ($(this).scrollTop() > 600) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});
	$('.scrollToTop').on('click', function () {
		$('html, body').animate({scrollTop : 0},2000);
		return false;
	});
	// $('.menu-area ul > li > .theme-btn').on('click', function () {
    $('.show-tickets').on('click', function () {    
		$('.buy-ticket').show();
		return false;
	});
	$('.buy-ticket .buy-ticket-area > a').on('click', function () {
		$('.buy-ticket').hide();
		return false;
	});
	$('.login-popup').on('click', function () {
		$('.login-area').show();
        $('.signup-area').hide();
        $('.forgot-password-area').hide();
		return false;
	});
	$('.login-box > a').on('click', function () {
		$('.login-area').hide();
        $('.signup-area').hide();
        $('.forgot-password-area').hide();
		return false;
	});

    $('.login-signup').on('click', function () {
        $('.login-area').hide();
        $('.signup-area').show();
        $('.forgot-password-area').hide();
        return false;
    });
    $('.signup-signup > a').on('click', function () {
        $('.login-area').hide();
        $('.signup-area').hide();
        $('.forgot-password-area').hide();
        return false;
    });

    $('.forgot-password').on('click', function () {
        $('.login-area').hide();
        $('.signup-area').hide();
        $('.forgot-password-area').show();
        return false;
    });
    $('.forgot-password-area > a').on('click', function () {
        $('.login-area').hide();
        $('.signup-area').hide();
        $('.forgot-password-area').hide();
        return false;
    });
	
	/*----------------------------
    START - Slider activation
    ------------------------------ */
	window.heroSlider = $('.hero-area-slider');
	heroSlider.owlCarousel({
        loop: false,
		dots: false,
		autoplay: false,
		autoplayTimeout:4000,
		nav: false,
		items: 1,
        mouseDrag: false,
        touchDrag: false
	});
	heroSlider.on('changed.owl.carousel', function(property) {
		var current = property.item.index;
		var prevRating = $(property.target).find(".owl-item").eq(current).prev().find('.hero-area-slide').html();
		var nextRating = $(property.target).find(".owl-item").eq(current).next().find('.hero-area-slide').html();
		$('.thumb-prev .hero-area-slide').html(prevRating);
		$('.thumb-next .hero-area-slide').html(nextRating);
	});
	$('.thumb-next').on('click', function() {
		heroSlider.trigger('next.owl.carousel', [300]);
		return false;
	});
	$('.thumb-prev').on('click', function() {
		heroSlider.trigger('prev.owl.carousel', [300]);
		return false;
	});
	var newsSlider = $('.news-slider');
	newsSlider.owlCarousel({
		loop:true,
		dots: true,
		autoplay: false,
		autoplayTimeout:4000,
		nav: false,
		items: 1,
		responsive:{
			992:{
				dots: false,
			}
		}
	});
	newsSlider.on('changed.owl.carousel', function(property) {
		var current = property.item.index;
		var prevRating = $(property.target).find(".owl-item").eq(current).prev().find('.single-news').html();
		var nextRating = $(property.target).find(".owl-item").eq(current).next().find('.single-news').html();
		$('.news-prev .single-news').html(prevRating);
		$('.news-next .single-news').html(nextRating);
	});
	$('.news-next').on('click', function() {
		newsSlider.trigger('next.owl.carousel', [300]);
		return false;
	});
	$('.news-prev').on('click', function() {
		newsSlider.trigger('prev.owl.carousel', [300]);
		return false;
	});
	var videoSlider = $('.video-slider');
	videoSlider.owlCarousel({
		loop:true,
		dots: true,
		autoplay: false,
		autoplayTimeout:4000,
		nav: false,
		responsive:{
			0:{
				items: 1,
				margin: 0
			},
			576:{
				items: 2,
				margin: 30
			},
			768:{
				items: 3,
				margin: 30
			},
			992:{
				items: 4,
				margin: 30
			}
		}
	});
	
	/*----------------------------
	START - videos popup
	------------------------------ */
	$('.popup-youtube').magnificPopup({type:'inline'});
	//iframe scripts
	$.extend(true, $.magnificPopup.defaults, {  
		iframe: {
			patterns: {
				//youtube videos
				youtube: {
					index: 'youtube.com/', 
					id: 'v=', 
					src: 'https://www.youtube.com/embed/%id%?autoplay=1'
				}
			}
		},

        callbacks: {
            close: function() {
                $('video').each(function() {
                    $(this).get(0).pause();
                });
            }
        }
	});
	
	/*----------------------------
    START - Isotope
    ------------------------------ */
    jQuery(".portfolio-item").isotope();
    $(".portfolio-menu li").on("click", function(){
      $(".portfolio-menu li").removeClass("active");
      $(this).addClass("active");
      var selector = $(this).attr('data-filter');
      $(".portfolio-item").isotope({
        filter: selector
      })
    });
	
	/*----------------------------
    START - Preloader
    ------------------------------ */
	jQuery(window).load(function(){
		jQuery("#preloader").fadeOut(500);
	});
	

}(jQuery));