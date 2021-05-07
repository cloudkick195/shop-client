var timeOut_modalCart;
var viewout = true;
var check_show_modal = true;
// Add a product and show modal cart
var add_item_show_modalCart = function(id, combinationId) {
	if( check_show_modal ) {
		check_show_modal = false;
		timeOut_modalCart = setTimeout(function(){ 
			check_show_modal = true;
		}, 1000);
		
		if ( $('.addtocart-modal').hasClass('clicked_buy') ) {
			var quantity = $('#quantity').val();
		} else {
			var quantity = 1;
		}
		
		$.ajax({
            method: 'POST',
            url: '/cart/add',
            data: {
                productId: id,
				productQuantity: quantity,
				combinationId: combinationId
            },
        })
        .done(function(data){
            //	if ( jQuery(window).width() >= 768 ) {
				getCartModal(data.totalCartItems);					
				jQuery('#myCart').modal('show');				
				jQuery('.modal-backdrop').css({'height':jQuery(document).height(),'z-index':'99'});
				//	} else {
				//		window.location = '/cart';
				//	}
				$('.addtocart-modal').removeClass('clicked_buy');
        })
        .fail(function(msg){
            alert(msg.responseJSON.message);
        });
	}
}
// Plus number quantiy product detail 
var plusQuantity = function() {
	if ( jQuery('input[name="quantity"]').val() != undefined ) {
		var currentVal = parseInt(jQuery('input[name="quantity"]').val());
		if (!isNaN(currentVal)) {
			jQuery('input[name="quantity"]').val(currentVal + 1);
		} else {
			jQuery('input[name="quantity"]').val(1);
		}
	}else {
		console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
	}
}
// Minus number quantiy product detail 
var minusQuantity = function() {
	if ( jQuery('input[name="quantity"]').val() != undefined ) {
		var currentVal = parseInt(jQuery('input[name="quantity"]').val());
		if (!isNaN(currentVal) && currentVal > 1) {
			jQuery('input[name="quantity"]').val(currentVal - 1);
		}
	}else {
		console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
	}
}
//Modal Cart
function getCartModalold(){
	var cart = null;
	jQuery('#cartform').hide();
	jQuery('#myCart #exampleModalLabel').text("Gi");
	jQuery.getJSON('/cart.js', function(cart, textStatus) {
		if(cart) {
			jQuery('#cartform').show();
			jQuery('.line-item:not(.original)').remove();
			jQuery.each(cart.items,function(i,item){
				var total_line = 0;
				var total_line = item.quantity * item.price;
				tr = jQuery('.original').clone().removeClass('original').appendTo('table#cart-table tbody');
				if(item.image != null)
					tr.find('.item-image').html("<img src=" + Haravan.resizeImage(item.image,'small') + ">");
				else
					tr.find('.item-image').html("<img src='//theme.hstatic.net/1000253775/1000529442/14/no_image.jpg?v=101'>");
				vt = item.variant_options;
				if(vt.indexOf('Default Title') != -1)
					vt = '';
				tr.find('.item-title').children('a').html(item.product_title + '<br><span>' + vt + '</span>').attr('href', item.url);
				tr.find('.item-quantity').html("<input id='quantity1' name='updates[]' min='1' type='number' value=" + item.quantity + " class='' />");
				if ( typeof(formatMoney) != 'undefined' ){
					tr.find('.item-price').html(Haravan.formatMoney(total_line, formatMoney));
				}else {
					tr.find('.item-price').html(Haravan.formatMoney(total_line, ''));
				}
				tr.find('.item-delete').html("<a href='javascript:void(0);' onclick='deleteCart(" + (i+1) + ")' ><i class='fa fa-times'></i></a>");
			});
			jQuery('.item-total').html(Haravan.formatMoney(cart.total_price, formatMoney));
			jQuery('.modal-title').children('b').html(cart.item_count);
			jQuery('.count-holder .count').html(cart.item_count );
			if(cart.item_count == 0){				
				jQuery('#exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
				jQuery('#cart-view').html('<tr><td>Hiện chưa có sản phẩm</td></tr>');
				jQuery('#cartform').hide();
			}
			else{			
				jQuery('#exampleModalLabel').html('Bạn có ' + cart.item_count + ' sản phẩm trong giỏ hàng');
				jQuery('#cartform').removeClass('hidden');
				jQuery('#cart-view').html('');
			}
			if ( jQuery('#cart-pos-product').length > 0 ) {
				jQuery('#cart-pos-product span').html(cart.item_count + ' sản phẩm');
			}
			// Get product for cart view

			jQuery.each(cart.items,function(i,item){
				clone_item(item,i);
			});
			jQuery('#total-view-cart').html(Haravan.formatMoney(cart.total_price, formatMoney));
		} else{
			jQuery('#exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
			if ( jQuery('#cart-pos-product').length > 0 ) {
				jQuery('#cart-pos-product span').html(cart.item_count + ' sản phẩm');
			}
			jQuery('#cart-view').html('<tr><td>Hiện chưa có sản phẩm</td></tr>');
			jQuery('#cartform').hide();
		}
	});

	$('#site-overlay').addClass("active");
	$('.main-body').addClass("sidebar-move");
	$('#site-nav--mobile').addClass("active");
	$('#site-nav--mobile').removeClass("show-filters").removeClass("show-search").addClass("show-cart");
}

const formatWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
}

function getCartModal(cart){
	let getTrTable = '';

	if(!cart.items || !Object.keys(cart.items)[0])
	{
		jQuery('.count-holder .count').html('0');
		jQuery('.total-cart').html('0đ');
		jQuery('#cart-view tbody').html('<tr class="item_2"><td>Hiện chưa có sản phẩm</td></tr>');
		return
	}

	jQuery.each(cart.items,function(i,item){
		const slug = "/san-pham/" + item.slug + ".html";
		getTrTable += `
			<tr class="item_2 ${i}">
				<td class="img"><a href=${slug} title="${item.name} link">
				`;
					if(item.avatar){
						getTrTable += `<img src=${item.avatar} alt="${item.name} Image"  />`
					}
					else{
						getTrTable +=`<img src="/images/product-no-image.jpg" alt="${item.name} Image" />`
					}
				getTrTable +=
				`
				</td>
				</a>
				<td>
					<a class="pro-title-view" href="${slug}" title="${item.name} link">${item.name}</a>
					<span class="variant">${item.options}</span>
					<span class="pro-quantity-view">
						<div class="qty quantity-partent qty-click clearfix"><button class="qtyminus qty-btn" type="button">-</button>
						<input class="tc line-item-qty item-quantity" 
								data-id="${i}"
								combination-id="${item.combinationId}"
								type="text" 
								size="4" 
								name="updates[]" 
								min="1" 
								value="${item.qty}">
						<button class="qtyplus qty-btn" type="button">+</button></div>
					</span>
					<span class="pro-price-view">${formatWithCommas(item.price)}</span>
					<span class="remove_link remove-cart">
						<a href="javascript:void(0);" onclick="removeCartItem('${i}', '${item.combinationId}')">
							<i class="fa fa-trash" aria-hidden="true"></i>
						</a>
					</span>
				</td>
			</tr>
		`
	});
	
	jQuery('.count-holder .count').html(cart.total_qty);
	jQuery('.total-cart').html(formatWithCommas(cart.total_price));
	jQuery('#cart-view tbody').html(getTrTable);	

	$('#site-overlay').addClass("active");
	$('.main-body').addClass("sidebar-move");
	$('#site-nav--mobile').addClass("active");
	$('#site-nav--mobile').removeClass("show-filters").removeClass("show-search").addClass("show-cart");
}
//clone item cart
function clone_item(product,i){
	var item_product = jQuery('#clone-item-cart').find('.item_2');
	if ( product.image == null ) {
		item_product.find('img').attr('src','//theme.hstatic.net/1000253775/1000529442/14/no_image.jpg?v=101').attr('alt', product.url);
	} else {
		item_product.find('img').attr('src',Haravan.resizeImage(product.image,'small')).attr('alt', product.url);
	}
	item_product.find('a:not(.remove-cart)').attr('href', product.url).attr('title', product.url);
	item_product.find('.pro-title-view').html(product.title);
	item_product.find('span.pro-quantity-view').html('<div class="qty quantity-partent qty-click clearfix"><button type="button" class="qtyminus qty-btn">-</button><input type="text"  size="4" name="updates[]" min="1" id="updates_'+product.variant_id+'" data-id="'+product.variant_id+'" data-price="'+product.price+'" value="'+product.quantity+'"  class="tc line-item-qty item-quantity" /><button type="button" class="qtyplus qty-btn">+</button></div>');
	item_product.find('.pro-price-view').html(Haravan.formatMoney(product.price,formatMoney));
	item_product.find('.remove-cart').html("<a href='javascript:void(0);' onclick='deleteCart(" + (i+1) + ")' >"+'<svg enable-background="new 0 0 438.529 438.529" version="1.1" viewBox="0 0 438.53 438.53" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m417.69 75.654c-1.711-1.709-3.901-2.568-6.563-2.568h-88.224l-19.985-47.676c-2.854-7.044-7.994-13.04-15.413-17.989-7.426-4.948-14.948-7.421-22.559-7.421h-91.363c-7.611 0-15.131 2.473-22.554 7.421-7.424 4.949-12.563 10.944-15.419 17.989l-19.985 47.676h-88.22c-2.667 0-4.853 0.859-6.567 2.568-1.709 1.713-2.568 3.903-2.568 6.567v18.274c0 2.664 0.855 4.854 2.568 6.564 1.714 1.712 3.904 2.568 6.567 2.568h27.406v271.8c0 15.803 4.473 29.266 13.418 40.398 8.947 11.139 19.701 16.703 32.264 16.703h237.54c12.566 0 23.319-5.756 32.265-17.268 8.945-11.52 13.415-25.174 13.415-40.971v-270.66h27.411c2.662 0 4.853-0.856 6.563-2.568 1.708-1.709 2.57-3.9 2.57-6.564v-18.274c2e-3 -2.664-0.861-4.854-2.569-6.567zm-248.39-35.976c1.331-1.712 2.95-2.762 4.853-3.14h90.504c1.903 0.381 3.525 1.43 4.854 3.14l13.709 33.404h-127.91l13.99-33.404zm177.87 340.61c0 4.186-0.664 8.042-1.999 11.561-1.334 3.518-2.717 6.088-4.141 7.706-1.431 1.622-2.423 2.427-2.998 2.427h-237.54c-0.571 0-1.565-0.805-2.996-2.427-1.429-1.618-2.81-4.188-4.143-7.706-1.331-3.519-1.997-7.379-1.997-11.561v-270.66h255.82v270.66z"/><path d="m137.04 347.17h18.271c2.667 0 4.858-0.855 6.567-2.567 1.709-1.718 2.568-3.901 2.568-6.57v-164.45c0-2.663-0.859-4.853-2.568-6.567-1.714-1.709-3.899-2.565-6.567-2.565h-18.271c-2.667 0-4.854 0.855-6.567 2.565-1.711 1.714-2.568 3.904-2.568 6.567v164.45c0 2.669 0.854 4.853 2.568 6.57 1.713 1.711 3.9 2.567 6.567 2.567z"/><path d="m210.13 347.17h18.271c2.666 0 4.856-0.855 6.564-2.567 1.718-1.718 2.569-3.901 2.569-6.57v-164.45c0-2.663-0.852-4.853-2.569-6.567-1.708-1.709-3.898-2.565-6.564-2.565h-18.271c-2.664 0-4.854 0.855-6.567 2.565-1.714 1.714-2.568 3.904-2.568 6.567v164.45c0 2.669 0.854 4.853 2.568 6.57 1.712 1.711 3.903 2.567 6.567 2.567z"/><path d="m283.22 347.17h18.268c2.669 0 4.859-0.855 6.57-2.567 1.711-1.718 2.562-3.901 2.562-6.57v-164.45c0-2.663-0.852-4.853-2.562-6.567-1.711-1.709-3.901-2.565-6.57-2.565h-18.268c-2.67 0-4.853 0.855-6.571 2.565-1.711 1.714-2.566 3.904-2.566 6.567v164.45c0 2.669 0.855 4.853 2.566 6.57 1.718 1.711 3.901 2.567 6.571 2.567z"/></svg>'+"</a>");
	var title = '';
	if(product.variant_options.indexOf('Default Title') == -1){
		$.each(product.variant_options,function(i,v){
			title = title + v + ' / ';
		});
		title = title + '@@';
		title = title.replace(' / @@','')
		item_product.find('.variant').html(title);
	}else {
		item_product.find('.variant').html('');
	}
	item_product.clone().removeClass('hidden').prependTo('#cart-view');
}
// Delete variant in modalCart
function deleteCart(line){
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data: 'quantity=0&line=' + line,
		dataType: 'json',
		success: function(cart) {
			// getCartModal();
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}
// Update product in modalCart
jQuery(document).on("click","#update-cart-modal",function(event){
	event.preventDefault();
	if (jQuery('#cartform').serialize().length <= 5) return;
	jQuery(this).html('Đang cập nhật');
	var params = {
		type: 'POST',
		url: '/cart/update.js',
		data: jQuery('#cartform').serialize(),
		dataType: 'json',
		success: function(cart) {
			if ((typeof callback) === 'function') {
				callback(cart);
			} else {
				// getCartModal();
			}
			jQuery('#update-cart-modal').html('Cập nhật');
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
});

jQuery(document).on("click",".btn-checkout",function(event){
	event.preventDefault();
	
	$.ajax({
		method: 'POST',
		url: '/checkout'
	})
	.done(function(data){
		if(data.token)
			window.location = '/checkout/'+ data.token;
	})
	.fail(function(msg){
		window.location = '/cart';
	});
	
});
/* fixHeightProduct */
function fixHeightProduct(data_parent, data_target, data_image) {
	var box_height = 0;
	var box_image = 0;
	var boxtarget = data_parent + ' ' + data_target;
	var boximg = data_parent + ' ' + data_target + ' ' + data_image;
	jQuery(boximg).css('height', 'auto');
	jQuery($(boxtarget)).css('height', 'auto');
	jQuery($(boxtarget)).removeClass('fixheight');
	jQuery($(boxtarget)).each(function() {
		if (jQuery(this).find($(data_image)).height() > box_image) {
			box_image = jQuery(this).find($(data_image)).height();
		}
	});
	if (box_image > 0) {
		jQuery(boximg).height(box_image);
	}
	jQuery($(boxtarget)).each(function() {
		if (jQuery(this).height() > box_height) {
			box_height = jQuery(this).height();
		}
	});
	jQuery($(boxtarget)).addClass('fixheight');
	if (box_height > 0) {
		jQuery($(boxtarget)).height(box_height);
	}
	try {
		fixheightcallback();
	} catch (ex) {}
}
jQuery(document).ready(function(){
	jQuery(".footer-title, .toggle-dropdown").click(function(){
		var get_child = $(this).next();
		if(get_child.is(':hidden')){
			jQuery(this).addClass("active");
			get_child.slideDown();
		}else{
			jQuery(this).removeClass("active");
			get_child.slideUp();
		}
	});


	// Get number item for cart header
	// $.get('/cart.js').done(function(cart){
	// 	$('.cart-menu .count').html(cart.item_count);
	// });
	// Image Product Loaded fix height
	jQuery('.wrapper-collection-1 .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('.wrapper-collection-1 .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.wrapper-collection-1 .content-product-list', '.product-resize', '.image-resize');
		});
	});
	jQuery('.wrapper-collection-2 .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('.wrapper-collection-2 .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.wrapper-collection-2 .content-product-list', '.product-resize', '.image-resize');
		});
	});
	jQuery('#collection-body .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('#collection-body .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('#collection-body .content-product-list', '.product-resize', '.image-resize');
		});
	});
	jQuery('.list-productRelated .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('.list-productRelated .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.list-productRelated .content-product-list', '.product-resize', '.image-resize');
		});
	});
	jQuery('.list-slider-banner .image-resize').imagesLoaded(function() {
		fixHeightProduct('.list-slider-banner', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.list-slider-banner', '.product-resize', '.image-resize');
		});
	});
	jQuery('.search-list-results .image-resize').imagesLoaded(function() {
		fixHeightProduct('.search-list-results', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.search-list-results', '.product-resize', '.image-resize');
		});
	});
});
// Footer 
$(document).ready(function() {
	if (jQuery(window).width() < 768) {

		// icon Footer
		$('a.btn-fter').click(function(e){
			if ( $(this).attr('aria-expanded') == 'false' ) {
				e.preventDefault();
				$(this).attr('aria-expanded','true');
				$('.main-footer').addClass('bg-active');
			} else {
				$(this).attr('aria-expanded','false');
				$('.main-footer').removeClass('bg-active');
			}
		});
	}
});
// Mainmenu sidebar
$(document).on("click", "span.icon-subnav", function(){
	if ($(this).parent().hasClass('active')) {
		$(this).parent().removeClass('active');
		$(this).siblings('ul').slideUp();
	} else {
		if( $(this).parent().hasClass("level0") || $(this).parent().hasClass("level1")){
			$(this).parent().siblings().find("ul").slideUp();
			$(this).parent().siblings().removeClass("active");
		}
		$(this).parent().addClass('active');
		$(this).siblings('ul').slideDown();
	}
});
//Click event to scroll to top
jQuery(document).on("click", ".back-to-top", function(){
	jQuery(this).removeClass('show');
	jQuery('html, body').animate({
		scrollTop: 0			
	}, 800);
});
jQuery(document).on("click", ".nav-sanpham-button", function(){
	jQuery("#site-nav--mobile").removeClass('active-child');
});
jQuery(document).on("click", ".menu-sanpham", function(e){
	e.preventDefault();
	jQuery("#site-nav--mobile").addClass('active-child');
});

/* scroll */
jQuery(window).scroll(function() {
	/* scroll top */
	if ( jQuery('.back-to-top').length > 0 && jQuery(window).scrollTop() > 500 ) {
		jQuery('.back-to-top').addClass('show');
	} else {
		jQuery('.back-to-top').removeClass('show');
	}


	/* scroll header */
	if (jQuery(window).width() < 769) {
		var scroll = $(window).scrollTop();
		if (scroll < 320) {
				$(".main-header").removeClass("scroll-menu");	
		} else {
			$(".main-header").addClass("scroll-menu");		
		}

		if($(".viewed-product").length > 0)
			if(scroll > $(".viewed-product").offset().top ){
				$(".product-action-bottom").addClass("e-hidden");
			}else{
				$(".product-action-bottom").removeClass("e-hidden");
			}
	} else {
		var height_header =	$('.main-header').height();
		if( jQuery(window).scrollTop() >= height_header ) {			
			jQuery('.main-header').addClass('affix-mobile');
		}	else {
			jQuery('.main-header').removeClass('affix-mobile');
		}
	}
});
$('a[data-spy=scroll]').click(function(){
	event.preventDefault() ;
	$('body').animate({scrollTop: ($($(this).attr('href')).offset().top - 20) + 'px'}, 500);
})
function smoothScroll(a, b){
	$('body,html').animate({
		scrollTop : a
	}, b);
}
// Buynow
var buy_now = function(id) {
	var quantity = 1;
	var params = {
		type: 'POST',
		url: '/cart/add.js',
		data: 'quantity=' + quantity + '&id=' + id,
		dataType: 'json',
		success: function(line_item) {
			window.location = '/checkout';
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}

// Menu sidebar
$(document).on('click','.tree-menu .tree-menu-lv1',function(){
	$this = $(this).find('.tree-menu-sub');
	$('.tree-menu .has-child .tree-menu-sub').not($this).slideUp('fast');
	$(this).find('.tree-menu-sub').slideToggle('fast');
	$(this).toggleClass('menu-collapsed');
	$(this).toggleClass('menu-uncollapsed');
	var $this1 = $(this);
	$('.tree-menu .has-child').not($this1).removeClass('menu-uncollapsed');
});

// Slide
jQuery(document).ready(function(){

	function center(number){
		var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
		var num = number;
		var found = false;
		for(var i in sync2visible){
			if(num === sync2visible[i]){
				var found = true;
			}
		}

		if(found===false){
			if(num>sync2visible[sync2visible.length-1]){
				sync2.trigger("owl.goTo", num - sync2visible.length+2)
			}else{
				if(num - 1 === -1){
					num = 0;
				}
				sync2.trigger("owl.goTo", num);
			}
		} else if(num === sync2visible[sync2visible.length-1]){
			sync2.trigger("owl.goTo", sync2visible[1])
		} else if(num === sync2visible[0]){
			sync2.trigger("owl.goTo", num-1)
		}

	}
	$('[data-fancybox="images"]').fancybox({
		margin : [44,0,22,0]

	})


	$('#home-slider .owl-carousel').owlCarousel({
		items:1,
		nav: true,
		navText: ['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
		dots: false,
		lazyLoad:true,
		touchDrag: true,
		responsive:{
			0:{
				items:1
			},
			768:{
				items:1
			},
			1024:{
				items:1
			}
		}
		
	});
	$('.menu-slider.owl-carousel').owlCarousel({
		items:1,
		nav: false,
		dots: true,
		lazyLoad:true,
		touchDrag: true,
		responsive:{
			0:{
				items:1
			},
			768:{
				items:1
			},
			1024:{
				items:1
			}
		}

	});
	$('.owl-new-product').owlCarousel({
		items: 5,
		nav: false,
		navText: ['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
		dots: false,
		margin: 15,
		lazyLoad:true,
		touchDrag: true,
		responsive:{
			0:{
				items: 2
			},
			768:{
				items: 2
			},
			1024:{
				items: 3
			},1199:{
				items: 5
			}
		}
	});
	$('.owl-gallery').owlCarousel({
		items: 5,
		nav: true,
		navText: ['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
		dots: false,
		margin: 15,
		lazyLoad:true,
		touchDrag: true,
		responsive:{
			0:{
				items: 2
			},
			768:{
				items: 2
			},
			1024:{
				items: 3
			},1199:{
				items: 5
			}
		}
	});

	$('.category-carousel .owl-carousel').owlCarousel({
		items: 5,
		nav: false,
		dots: false,
		margin: 15,
		lazyLoad:true,
		touchDrag: true,
		autoplay: true,
		itemsDesktop : false,
		itemsDesktopSmall : false,
		autoplayTimeout: 2000,
		responsive:{
			0:{
				items: 2
			},
			768:{
				items: 3
			},
			1024:{
				items: 4
			},1100:{
				items: 5
			}
		}
	});
	$('.products-related-carousel.owl-carousel').owlCarousel({
		items: 5,
		nav: true,
		navText: ['<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 21 41" enable-background="new 0 0 21 41"><polygon points="20.3,40.8 0,20.5 20.3,0.2 21,0.9 1.3,20.5 21,40.1 "></polygon></svg>','<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 21 41" enable-background="new 0 0 21 41"><polygon points="20.3,40.8 0,20.5 20.3,0.2 21,0.9 1.3,20.5 21,40.1 "></polygon></svg>'],
		dots: false,
		margin: 15,
		lazyLoad:true,
		touchDrag: true,
		autoplay: true,
		itemsDesktop : false,
		itemsDesktopSmall : false,
		autoplayTimeout: 2000,
		responsive:{
			0:{
				items: 2
			},
			768:{
				items: 3
			},
			1024:{
				items: 4
			},1100:{
				items: 5
			}
		}
	});
	$('.slide-product.owl-carousel').owlCarousel({
		items: 1,
		nav: true,
		navText: ['<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 21 41" enable-background="new 0 0 21 41"><polygon points="20.3,40.8 0,20.5 20.3,0.2 21,0.9 1.3,20.5 21,40.1 "></polygon></svg>','<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 21 41" enable-background="new 0 0 21 41"><polygon points="20.3,40.8 0,20.5 20.3,0.2 21,0.9 1.3,20.5 21,40.1 "></polygon></svg>'],
		dots: true,
		lazyLoad:true,
		touchDrag: true,
		autoplay: true,
		autoplayTimeout: 2000,
		responsive: {
			0: {
				items: 1
			}
		}
	});

	$('.list-slider-banner').slick({
		centerMode: true,
		centerPadding: '60px',
		slidesToShow: 3,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					arrows: true,
					centerMode: true,
					centerPadding: '40px',
					slidesToShow: 3
				}
			},
			{
				breakpoint: 480,
				settings: {
					arrows: true,
					centerMode: true,
					centerPadding: '40px',
					slidesToShow: 1
				}
			}
		]
	});
});

// Dropdown Title
jQuery('.title_block').click(function(){
	$(this).next().slideToggle('medium');
});    
$(document).on("click",".dropdown-filter", function(){
	if ( $(this).parent().attr('aria-expanded') == 'false' ) {
		$(this).parent().attr('aria-expanded','true');
	} else {
		$(this).parent().attr('aria-expanded','false');
	}
});

/* Search ultimate destop -mobile*/
$('.ultimate-search').submit(function(e) {
	e.preventDefault();
	var q = $(this).find('input[name=q]').val();
	var query = encodeURIComponent(q);
	window.location = '/search?s='+ query ;
	return;
});
function renderNewsletter(type, msg){
	$('.newsletter-report').html(
		` <div class="alert alert-${type}" role="alert">
			<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">×</span>
			</button>
			${msg}
		</div>`)
}

var checkSpam = false
$('.form-newsletter').submit(function(e) {
	e.preventDefault();
	if(checkSpam){
		renderNewsletter('danger','Vui lòng đợi 5 giây rồi tiếp tục')
		return;
	}
	if(checkSpam){
		return renderNewsletter('danger','Email không được bỏ trống')
	}
	checkSpam = true
	var email = $(this).find('input[name=email]').val();

	$.ajax({
		url: '/newsletter',
		type: 'POST',
		data: {
			email: email
		},
		success: function (data) {
			$(this).find('input[name=email]').val('');
			if(data.status){
				renderNewsletter('success', data.msg)
			}else{
				renderNewsletter('danger', data.msg)
			}
			setTimeout(function () {
				location.reload();
			}, 5000)
		}
	});
});
/******************/
var _reqAnimationSearch = window.requestAnimationFrame    ||
window.mozRequestAnimationFrame     ||
window.webkitRequestAnimationFrame  ||
window.msRequestAnimationFrame      ||
window.oRequestAnimationFrame       ;

var _cancelAnimationFrameSearch = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

var start;
var myReq;
var searchElement;
var strSearch;


function delayRequestAnimationFrameSearch( timestamp ) {
	if (!start) start = timestamp;
	
	var progress = timestamp - start;

	if (progress < 500) {
		// it's important to update the requestId each time you're calling requestAnimationFrame
		myReq = _reqAnimationSearch(delayRequestAnimationFrameSearch);
	}else{
		searchKey(strSearch,searchElement);
	}

}

function delaySetimeOutSearch(element) {
	clearTimeout(start);
	start = setTimeout(function(){
		searchKey(strSearch, searchElement);
	}, 500);
}

function searchKey(str, $results){
	$.ajax({
		url: '/search',
		type: 'POST',
		data: str,
		success: function(data){
			var htmlProduct = `<p class="dataEmpty">
				Không có sản phẩm nào...
			</p>`;
			if(data.count > 0){
				htmlProduct = ``
				jQuery.each(data.products,function(i,item){
					htmlProduct += `<div class="item-ult">
					<div class="thumbs">
						<a href="${item.slug}" title="${item.name}">
							<img alt="${item.name}" src="${item.avatar}">
						</a>
					</div>
					<div class="title">
						<a title="${item.name}" href="${item.slug}">${item.name}</a>
						<p class="f-initial">${item.price} <del>${item.oldPrice}</del></p>
						<del class="f-initial"></del>
					</div>
				</div>`
				});
				htmlProduct += `<div class="resultsMore">
				<a href="${data.currentUrl}">Xem thêm ${data.count} sản phẩm</a>
			</div>`
			}
			
			$results.find('.resultsContent').html(htmlProduct);
		}
	})
}

var $input = $('.ultimate-search input[type="text"]');
$input.bind('keyup change paste propertychange', function() {
	var key = $(this).val(),
			$parent = $(this).parents('.wpo-wrapper-search');
	searchElement = $(this).parents('.wpo-wrapper-search').find('.smart-search-wrapper');

	if(key.length > 0 ){
		$(this).attr('data-history', key);
		var q_follow = 'product',
				str = '';
				strSearch = `s=${key}`;

		if(_reqAnimationSearch){
            start = null;
            _cancelAnimationFrameSearch(myReq);
            _reqAnimationSearch(delayRequestAnimationFrameSearch);
        }
        else{
            delaySetimeOutSearch(strSearch, searchElement);
        }
		
		searchElement.fadeIn();
	}else{
		searchElement.fadeOut();
	}
})

$('input[name="follow"]').on('change', function(){
	$('.ultimate-search input[type="text"]').trigger('change');
})
$('input[name="follow_mobile"]').on('change', function(){
	$('.ultimate-search input[type="text"]').trigger('change');
})
$('body').click(function(evt) {
	var target = evt.target;
	if (target.id !== 'ajaxSearchResults' && target.id !== 'inputSearchAuto') {
		$(".ajaxSearchResults").hide();
	}
	if (target.id !== 'ajaxSearchResults-mb' && target.id !== 'inputSearchAuto-mb') {
		$(".ajaxSearchResults").hide();
	}
});
$('body').on('click', '.ultimate-search input[type="text"]', function() {
	if ($(this).is(":focus")) {
		if ($(this).val() != '') {
			$(".ajaxSearchResults").show();
		}
	} else {

	}
})








