var SW = window.SW || {};
SW = {
	init: function(){
		this.buildEvents.init();
	}
}
$(document).ready(function(){
	SW.init();
});
SW.buildEvents = {
	settings: {
		productParent: '.productTemplate',
		arrLocation: [],
		variantLocation: [],
		variantIDs: window.idVariantArr
	},
	init: function(){
		var $pdParent = $(this.settings.productParent),
				variantIDs = this.settings.variantIDs;
		this.initGetLocationWebs();
		//this.initGetLocationsInVariant(variantIDs,$pdParent);
		this.settings.variantLocation = spDataNew;
		//	$(document).on('click','.swatch-element:not(.soldoutVariant) .lbSwatch', this.initPickedOptionClickEvent.bind(this));
		$(document).on('click','.swatch input', this.initPickedOptionClickEventv2.bind(this));
		//this.initPickedOptionLoaded($pdParent);
		this.initActionsCartProduct();
		$(document).on('click','.btnOpenQuickview', this.initQuickviewOpen.bind(this));
		if(window.template.indexOf('cart') != -1){
			this.initLimitItemCart();
		}
		this.initChangeQtyAddCart();
	},
	initGetLocationWebs: function(){
		var arrLocation = [];
		// $.ajax({
		// 	type: 'GET',
		// 	url: '/pages/khong-xoa-trang-de-lay-danh-sach-cua-hang',
		// 	async: false,
		// 	success: function(data){
		// 		arrLocation = data.split(',');
		// 	}
		// });
		// window.webLocation = arrLocation;
		// this.settings.arrLocation = arrLocation;
	},
	initGetLocationsInVariant: function(variantArrayID,$parent){ 
		if( typeof variantArrayID != 'object' )
			return false;
		var spData = [], jsonData = '';
		$.each(variantArrayID, function(i,v){
			var url = $parent.find('#pdInfo').val() + '?variant='+ v + '&view=location';
			var promise = $.ajax({
				type: 'GET',
				contentType : 'application/json',
				url: url,
				async: false,
				success: function(data){
					spData.push(data);
				},
				error: function(xhr) {
					console.log('Get variant location error...');
				}
			});
		}); 
		jsonData = JSON.parse('[' + spData.toString() + ']');
		//localStorage.setItem('locations',JSON.stringify(jsonData));
		this.settings.variantLocation = spData;
	},
	initRenderVariantTitle: function(str1,str2,str3){
		if( typeof str1 != 'undefined' && typeof str2 != 'undefined' && typeof str3 != 'undefined' ){
			return str1 + ' / ' + str2 + ' / ' + str3;
		}else if(typeof str1 != 'undefined' && typeof str2 != 'undefined'){
			return str1 + ' / ' + str2;
		}else if(typeof str1 != 'undefined'){
			return str1;
		}else{
			return '';
		}
	},
	initGetAvailableVariant: function(arr,title){
		if(typeof arr != 'object')
			return false;
		var result = {available: false, totalQty: 0 };
		$.each(arr, function(i,item){
			if(item['variantTitle'].trim() == title.trim() && item['variantAvailable'] == 'true'){
				var id = item['variantID'], arrTam = [];
				if(item['variantLocations'].length > 0 ){
					var total = 0;
					$.each(item['variantLocations'],function(i,v){
						if(v['LocationName'] == 'Kho đi đường'){
						}else{
							if (-1 == $.inArray(v['LocationId'], arrTam) && -1 != $.inArray(v['LocationId'].toString(), window.webLocation)) {
								result.available = true;
								total += parseInt(v['Quantity']);
								arrTam.push(v['LocationId']);
								return;
							}
						}
					});
					result.totalQty = total;
					if(total <= 0)
						result.available = false;
				}else{
					result = true;
				}
			}
		});
		return result;
	},
	initPickedOptionClickEvent: function(e){
		e.preventDefault();
		console.log(333);
		var $this = this,
				$that = $(e.currentTarget), // Trả về label đang đứng
				$productPage = $that.parents('.productTemplate'), // Trả về div lơn đang đứng, tránh đụng với quickview
				$swatchColor = $productPage.find('.swatch.color'), // Trả về vị trí của option color
				$swatchGroup = $productPage.find('.swatch.optionSwatch'), // Trả về các option khác color
				$swatchElement = $that.parents('.swatch-element'); // Trả về giá trị của từng option
		var checkOptColor = $that.parents('.swatch-element').hasClass('color'), // Check xem có phải đang click vào option color hay k
				arrayVariants = localStorage.getItem('locations'),
				jsonLocations = JSON.parse(arrayVariants);
		if(checkOptColor){
			//console.log(arrVariant);
			if($swatchElement.hasClass('selected')) // Nếu màu sắc đang selected rồi thì không làm gì nữa
				return;
			$swatchElement.addClass('selected').siblings().removeClass('selected');
			var optOneVal = $swatchElement.attr('data-value'); // Giá trị màu sắc đang selected

			$.each($swatchGroup, function(i,groupEl){ // Duyệt qua tất cả các option ngoài option màu sắc
				if(!$(groupEl).is(':visible'))
					return;
				var $grElSwatch = $(groupEl).find('.swatch-element'); // Trả về đối tượng size
				$grElSwatch.removeClass('selected soldoutVariant');
				var optTwoVal = $(groupEl).attr('data-sex'), // Trả về giá trị giới tính
						firstAvi = '',
						childSize = $grElSwatch.size();
				$.each($grElSwatch, function(j,elSwach){ // Duyệt qua tất cả các size con của từng option
					var optThreeVal = $(elSwach).attr('data-value'); // Giá trị của 1 size cụ thể
					var variantTitle = $this.initRenderVariantTitle(optOneVal,optTwoVal,optThreeVal); // Nối thành 1 tên của variant
					var totalInventory = 0;
					$.each(jsonLocations, function(i,value){
						if(value['variantTitle'].trim() == variantTitle.trim() && value['variantAvailable'] == 'true'){
							//console.log(value['variantTitle'].trim() + ' = ' + variantTitle.trim() + ' --> ' + value['variantAvailable'])
							var id = value['variantID'], arrTam = [];
							if( value['variantLocations'].length > 0 ){
								$.each(value['variantLocations'],function(i,v){
									if(v['LocationName'] == 'Kho trung tâm' || v['LocationName'] == 'Kho đi đường' || v['LocationName'] == 'Kho sỉ Lai' || v['LocationName'] == 'Kho sỉ Phúc'){
									}else{
										if (-1 == $.inArray(v['LocationId'], arrTam) && -1 != $.inArray(v['LocationId'].toString(), window.webLocation) && parseInt(v['Quantity']) > 0) {
											totalInventory += parseInt(v['Quantity']);
											arrTam.push(v['LocationId']);
										}
									}
								})
							};
						};
					});
					if(totalInventory > 0){
						if(firstAvi == ''){ 
							firstAvi = optThreeVal;
						}
					}else{
						$(elSwach).addClass('soldoutVariant'); // Đánh dấu X cho size hết hàng or k tồn tại
					}
					if(firstAvi == ''){
						$(groupEl).addClass('typeSoldout'); // Nguyên option không có size nào còn hàng
					}else{
						$(groupEl).removeClass('typeSoldout');
						$(groupEl).find('.swatch-element:not(.soldoutVariant)').first().addClass('selected');
					}
					//$this.initUpdateButton($that,jsonLocations);
				});
			});
		}else{
			$swatchElement.toggleClass('selected').siblings().removeClass('selected');
			//$this.buildUpdateButton($that,jsonLocations);
		}
		$this.initUpdateButton($that,jsonLocations);
		//$this.initIntersectionLocations(jsonLocations);
	},
	initPickedOptionClickEventv2: function(e){
		e.preventDefault();
		var jsonLocations = this.settings.variantLocation;
		var $this = this,
				$input = $(e.target), // Trả về input đang đứng
				$elParent = $input.parent(), // Trả về cấp cha gần nhất (.swatch-element)
				$swParent = $input.parents('.swatch'), // Trả về cấp cha cao nhất (.swatch)
				$pageParent = $input.parents('.productTemplate'), // Trả về thẻ div cao nhất
				$inpAddCart = $pageParent.find('.inputAddCart'); // Trả về input cần lưu lại giá trị variant
		var isSWFirst = $swParent.hasClass('swFirst'), // Check xem input đang đứng có phải thuộc option variant đầu tiên hay không.
				swSize = $input.parents('.select-swatch').find('.swatch').size(); // Check xem variant có mấy option
		if($elParent.hasClass('checked') || $elParent.hasClass('soldout'))
			return false;
		$pageParent.find('input[name="quantity"]').val(1);
		$elParent.siblings().removeClass('checked');
		$elParent.addClass('checked');
		var optCurrentValue = $input.val();
		if(swSize == 1){
			var	titleVariant = $this.initRenderVariantTitle(optCurrentValue,undefined,undefined);
			$this.initUpdateInfoProduct($pageParent);
			return false;
		}
		var $swFirst = $pageParent.find('.swatch[data-option="option1"]'); // Trả về option varant thứ 3.
		var $swSecond = $pageParent.find('.swatch[data-option="option2"]'); // Trả về option varant thứ 2.
		if(swSize == 2){
			if(!isSWFirst){
				$this.initUpdateInfoProduct($pageParent);
				return false;
			}
			$swSecond.find('.swatch-element').removeClass('checked soldout');
			var optSecondAvai = '';
			$.each($swSecond.find('.swatch-element'), function(i,elSecond){
				var optSecondValue = $(elSecond).attr('data-value');
				var	titleVariant = $this.initRenderVariantTitle(optCurrentValue,optSecondValue,undefined);
				var checkType = $this.initGetAvailableVariant(jsonLocations,titleVariant);
				//console.log(titleVariant + ' - ' + checkType);
				if(checkType.available){
					if(optSecondAvai == ''){
						optSecondAvai = optSecondValue;
					}	
				}else{
					$(elSecond).addClass('soldout');
				}

			});
			if(optSecondAvai != ''){
				$pageParent.find('.swatch-element[data-value="'+ optSecondAvai +'"] input').trigger('click');
			}
		}else{
			var optIndex = parseInt($swParent.attr('data-option-index'));
			var $swThird = $pageParent.find('.swatch[data-option="option3"]'); // Trả về option varant thứ 3.
			if(optIndex == 0){
				$swSecond.find('.swatch-element').removeClass('checked soldout');
				var optSecondAvai = '', optThirdAvai = '';
				$.each($swSecond.find('.swatch-element'), function(i,elSecond){
					let checkOptAvi = false;
					let optSecondValue = $(elSecond).attr('data-value');
					$swThird.find('.swatch-element').removeClass('checked soldout');
					$.each($swThird.find('.swatch-element'), function(i,elThird){
						var optThirdValue = $(elThird).attr('data-value'),
								titleVariant = $this.initRenderVariantTitle(optCurrentValue,optSecondValue,optThirdValue),
								checkType = $this.initGetAvailableVariant(jsonLocations,titleVariant);
						if(checkType.available){
							checkOptAvi = true;
							if(optThirdAvai == ''){
								optSecondAvai = optSecondValue;
								optThirdAvai = optThirdValue;
							}	
						}else{
							$(elThird).addClass('soldout');
						}
					});
					if(!checkOptAvi){
						$(elSecond).addClass('soldout');
					}else{
						$(elSecond).removeClass('soldout');
					}
				});
				if(optSecondAvai != ''){
					$pageParent.find('.swatch-element[data-value="'+ optSecondAvai +'"] input').trigger('click');
					$pageParent.find('.swatch-element[data-value="'+ optThirdAvai +'"] input').trigger('click');
				}
			}else if(optIndex == 1){
				$swThird.find('.swatch-element').removeClass('checked soldout');
				optThirdAvai = '';
				$.each($swThird.find('.swatch-element'), function(i,elThird){
					optCurrentValue = $swFirst.find('.swatch-element.checked').attr('data-value');
					var optThirdValue = $(elThird).attr('data-value'),
							optSecondValue = $elParent.attr('data-value'),
							titleVariant = $this.initRenderVariantTitle(optCurrentValue,optSecondValue,optThirdValue),
							checkType = $this.initGetAvailableVariant(jsonLocations,titleVariant);
					if(checkType.available){
						if(optThirdAvai == ''){
							optThirdAvai = optThirdValue;
						}	
					}else{
						$(elThird).addClass('soldout');
					}
				});
				$pageParent.find('.swatch-element[data-value="'+ optThirdAvai +'"] input').trigger('click');
			}
		}
		$this.initUpdateInfoProduct($pageParent);
	},
	initPickedOptionLoaded: function($page){
		var $this = this;
		var	jsonLocations = $this.settings.variantLocation;
		var sizeOption = $page.find('.swatch').size();
		var $pageParent = $page;
		switch(sizeOption) {
			case 1:
				var optFirstAvai = '';
				var $swFirst = $pageParent.find('.swatch[data-option="option1"]'); // Trả về option varant thứ 1.
				$.each($swFirst.find('.swatch-element'), function(i,elFirst){
					var optValue = $(elFirst).attr('data-value');
					var titleVariant = $this.initRenderVariantTitle(optValue, undefined, undefined);
					var checkType = $this.initGetAvailableVariant(jsonLocations, titleVariant);
					if (checkType.available) {
						if (optFirstAvai == '') {
							optFirstAvai = optValue;
						}
					} else {
						$(elFirst).addClass('soldout');
					}
				});
				if (optFirstAvai != '') {
					$pageParent.find('.swatch-element[data-value="' + optFirstAvai + '"] input').trigger('click');
				}
				break;
			case 2:
				var optFirstAvai = '', optSecondAvai = '';
				var $swFirst = $pageParent.find('.swatch[data-option="option1"]'), // Trả về option varant thứ 1.
						$swSecond = $pageParent.find('.swatch[data-option="option2"]'); // Trả về option varant thứ 2.
				$.each($swFirst.find('.swatch-element'), function(i,elFirst){
					var optValue = $(elFirst).attr('data-value');
					var checkAvi = false;
					$swSecond.find('.swatch-element').removeClass('soldout');
					$.each($swSecond.find('.swatch-element'), function(i,elSecond){
						var optSecondValue = $(elSecond).attr('data-value');
						var titleVariant = $this.initRenderVariantTitle(optValue, optSecondValue, undefined);
						var checkType = $this.initGetAvailableVariant(jsonLocations, titleVariant);
						if (checkType.available) {
							checkAvi = true;
							if (optFirstAvai == '') {
								optFirstAvai = optValue;
								optSecondAvai = optSecondValue;
							}
						} else {
							$(elSecond).addClass('soldout');
						}
					});
					if(!checkAvi){
						$(elFirst).addClass('soldout');
					}
				});
				if (optFirstAvai != '') {
					$pageParent.find('.swatch-element[data-value="' + optFirstAvai + '"] input').trigger('click');
					$pageParent.find('.swatch-element[data-value="' + optSecondAvai + '"] input').trigger('click');
				}
				break;
			case 3:
				var optFirstAvai = '', optSecondAvai = '', optThirdAvai = '';
				var $swFirst = $pageParent.find('.swatch[data-option="option1"]'), // Trả về option varant thứ 1.
						$swSecond = $pageParent.find('.swatch[data-option="option2"]'), // Trả về option varant thứ 2.
						$swThird = $pageParent.find('.swatch[data-option="option3"]'); // Trả về option varant thứ 3.
				var checkAviFirst = false;
				$.each($swFirst.find('.swatch-element'), function(i,elFirst){
					checkAviFirst = false;
					var optValue = $(elFirst).attr('data-value');
					var checkAviSecond = false;
					$.each($swSecond.find('.swatch-element'), function(i,elSecond){
						var optSecondValue = $(elSecond).attr('data-value');
						$swThird.find('.swatch-element').removeClass('soldout');
						$.each($swThird.find('.swatch-element'), function(i,elThird){
							var optThirdValue = $(elThird).attr('data-value');
							var titleVariant = $this.initRenderVariantTitle(optValue, optSecondValue, optThirdValue);
							var checkType = $this.initGetAvailableVariant(jsonLocations, titleVariant);
							if (checkType.available) {
								checkAviSecond = true;
								checkAviFirst = true;
								if (optFirstAvai == '') {
									optFirstAvai = optValue;
									optSecondAvai = optSecondValue;
								}
							} else {
								$(elSecond).addClass('soldout');
							}
						});
						if(!checkAviSecond){
							$(elSecond).addClass('soldout');
						}
					});
					if(!checkAviFirst){
						$(elFirst).addClass('soldout');
					}
				});
				if (optFirstAvai != '') {
					$pageParent.find('.swatch-element[data-value="' + optFirstAvai + '"] input').trigger('click');
					$pageParent.find('.swatch-element[data-value="' + optSecondAvai + '"] input').trigger('click');
				}
				break;
			default:
				return false;
		}
		$page.on('keyup',$page.find('input[name="quantity"]'), function(e){
			e.preventDefault();
			var $input = $(this).find('.js-qty input[name="quantity"]').eq(0);
			if($input.attr('data-limit') == '' || $input.attr('data-limit') == null)
				return false;
			var qty = $input.val(), limit = parseInt($input.attr('data-limit'));
			if(isNaN(limit))
				return false;
			if(qty > limit){
				$input.val(limit);
			}
		})
	},
	initUpdateInfoProduct: function($page){
		var $this = this;
		var arrayVarriants = this.settings.variantLocation;
		var $pageParent = $page,
				$inputCart = $pageParent.find('.inputAddCart'),
				$pdPrice = $pageParent.find('.pdPrice'),
				$pdSKU = $pageParent.find('.sku-number'),
				$pdBtnCart = $pageParent.find('.btnAddToCart'),
				$pdBtnBuy = $pageParent.find('.btnBuyNow'),
				$pdSaving = $pageParent.find('#PriceSaving');
		var options = [];
		if($pageParent.find('.swatch .swatch-element.checked').size() == 0)
			return false;
		$pageParent.find('.swatch .swatch-element.checked').each(function(i,opt){
			var val = $(opt).attr('data-value');
			options.push(val)
		})
		var titleVariant = options.join(' / ');
		var hasVariant = false;
		var pdStyle = $page.attr('data-style');
		$.each(arrayVarriants, function(i,variant){
			if(variant['variantTitle'] == titleVariant){
				hasVariant = true;
				if(variant['variantImage'] && variant['variantImage'].indexOf('noDefaultImage6') == -1){
					$pageParent.find('.product-gallery__thumb img[data-image="'+ variant['variantImage'] +'"] img').trigger('click');
					$pageParent.find('.item a[data-image="'+ variant['variantImage'] +'"] img').trigger('click');
					if ($(window).width()> 991){
						if(pdStyle == 'style_01' || pdStyle == 'style_02'){
							var temp = $("#sliderproduct .product-gallery-item:eq(0) img").attr("src");
							var imgVariant = variant['variantImage'];
							var indexVariant = $(".product-gallery-item img[src='"+ imgVariant +"']").parent().index();
							$(".product-gallery-item:eq(0) img").attr("src",imgVariant);//Thế vị trí hình đầu tiên sau khi change
							$(".product-gallery-item:eq("+indexVariant+") img").attr("src",temp);
							$(".product-thumb:eq(0) img").attr("src",imgVariant);//Thế vị trí hình đầu tiên sau khi change
							$(".product-thumb:eq("+indexVariant+") img").attr("src",temp);
						}else{
							$(".product-gallery__thumb a img[data-image='"+variant['variantImage']+"']").click().parents('.product-gallery__thumb').addClass('active');
						}
					}else{
						setTimeout(function(){
							var indexVariant = $(".product-gallery-item img[src='"+variant['variantImage']+"']").parent().index();
							$('.product-thumb a[data-image="'+ variant['variantImage'] +'"] img').click();
							$("#sliderproduct").flickity('select', indexVariant);
						},500);
					}
				}
				if(variant['variantSKU']){
					$pdSKU.html(variant['variantSKU']);
				}
				if(variant['variantPrice'] < variant['variantCompare']){
					var pro_sold = variant['variantPrice'] ;
					var pro_comp = variant['variantCompare'] / 100;
					var sale = 100 - (pro_sold / pro_comp) ;
					var kq_sale = Math.round(sale);
					$pdPrice.html('<span class="pro-sale">-'+ kq_sale +'%</span><span class="pro-price">'+ Haravan.formatMoney(variant['variantPrice'], formatMoney) +'</span><del>'+ Haravan.formatMoney(variant['variantCompare'], formatMoney) +'</del>');
				}else{
					$pdPrice.html('<span class="pro-price">'+ Haravan.formatMoney(variant['variantPrice'], formatMoney) +'</span>');
				}
				if(variant['variantAvailable'] == 'true'){
					$inputCart.val(variant['variantID']);
					$('#product-select').val(variant['variantID']).trigger('change');
					$pdBtnCart.removeAttr('disabled').html('Đặt hàng');
					$pdBtnBuy.removeAttr('disabled').show();
					$('.quantity-area').show();
				}else{
					$('#product-select').val(variant['variantID']).trigger('change');
					$pdBtnCart.attr('disabled','disabled').html('Hết hàng');
					$pdBtnBuy.attr('disabled','disabled').hide();
					$('.quantity-area').hide();
				}
				return false;
			}else{
				$pdBtnCart.attr('disabled','disabled').html('Không có hàng');
				$pdBtnBuy.attr('disabled','disabled').hide();
			}
		});
		var limitQty = $this.initGetAvailableVariant(arrayVarriants,titleVariant);
		var count = 0;
		var setTimeData = setInterval(function(){
			$page.find('input[name="quantity"]').attr('data-limit',limitQty.totalQty);
			$page.find('.invenAlert').show().find('.invenNumber').html(limitQty.totalQty);
			count ++;
			if($page.find('input[name="quantity"]').attr('data-limit') != '' || count > 10){
				clearInterval(setTimeData);
			}
		},100);
		if(limitQty.totalQty <= 0){
			$('.quantity-area').hide();
			$pdBtnCart.attr('disabled','disabled').html('Hết hàng');
			$pdBtnBuy.attr('disabled','disabled').hide();
			}
			else{
			$pdBtnCart.removeAttr('disabled').html('Đặt hàng');
			$pdBtnBuy.removeAttr('disabled').show();
			$('.quantity-area').show();
		}
	},
	initActionsCartProduct: function(){
		$(document).on('click', '.addCartButton', function(e){
			e.preventDefault();
			var id = $(this).parents('.productTemplate').find('.inputAddCart').val(),
					qty = parseInt($(this).parents('.productTemplate').find('#Quantity').val());
			$.ajax({
				type: 'POST',
				url: '/cart/add.js',
				data: 'quantity=' + qty + '&id=' + id,
				dataType: 'json',
				async: false,
				success: function(line_item) {
					updateCart();
					updateCartModal();
				},
				error: function(XMLHttpRequest, textStatus) {
					Haravan.onError(XMLHttpRequest, textStatus);
				}
			});
		})
		$(document).on('click', '.buyNowButton', function(e){
			e.preventDefault();
			var $el = $(this);
			var id = $(this).parents('.productTemplate').find('.inputAddCart').val(),
					qty = parseInt($(this).parents('.productTemplate').find('#Quantity').val()),
					qtyAdd = -1, checkOut = false;
			$.ajax({
				type: 'get',
				url: '/cart.js',
				async: false,
				success: function(cart){
					//console.log(data);
					$.each(cart.items, function(i,v){
						if(v.variant_id == id){
							let limit = parseInt($el.parents('.productTemplate').find('#Quantity').attr('data-limit')),
									currentQty = v.quantity;
							qtyAdd = limit - currentQty;
							if(qtyAdd <= 0){
								checkOut = true;
								return;
							}
							else if (qtyAdd > qty)
								qtyAdd = qty;
							return;
						}
					})
				}
			});
			if(checkOut){
				window.location = '/checkout';
				return false;
			}
			if(qtyAdd < 0)
				qtyAdd = qty;
			$.ajax({
				type: 'POST',
				url: '/cart/add.js',
				data: 'quantity=' + qtyAdd + '&id=' + id,
				dataType: 'json',
				async: false,
				success: function(line_item) {
					window.location = '/checkout';
				},
				error: function(XMLHttpRequest, textStatus) {
					Haravan.onError(XMLHttpRequest, textStatus);
				}
			});
		})
	},
	initQuickviewOpen: function(e){
		e.preventDefault();
		//console.log(e);
		var $this = this;
		var $target = $(e.currentTarget);

		$.ajax({
			url : '/products/' + $target.data('handle') + '?view=quick-view',
			beforeSend: function() {
				$('.pageLoading').show();
				$('#quickviewTemplate .tempQuickview').remove();
			},
			success: function(data){
				function loadProduct(){
					$('#quickviewTemplate .pdQuickviewInfo').html(data);
					$('#quickviewTemplate .modal-content').css('opacity', '0');
					$('#quickviewTemplate').show();
					$('#quickviewTemplate').css('background-color', 'rgba(0,0,0,0.4)');
				};
				$.when(
					loadProduct()
				).then(function(){
					$this.initPickedOptionQuickView(window['initializeProduct' + $target.data('id')]);
					var owl = $('#quickviewTemplate #p-sliderproduct .owl-carousel');
					owl.owlCarousel({
						items:3,
						navigation : true,
						navigationText :[navRightText, navLeftText]
					});
					$('#p-sliderproduct .owl-carousel .owl-item').first().children('.item').addClass('active');
					var topPQZ =  ($('#quickviewTemplate').height() - $('#quickviewTemplate .modal-content').height())/2;
					$('.pageLoading').hide();
					$('#quickviewTemplate .modal-content').css('opacity', '1');
					$('#quickviewTemplate .modal-content').css('transform', 'translateY(0)');
					$('#quickviewTemplate .modal-content').css('margin-top', topPQZ - 50);
					$('#quickviewTemplate #close').click(function(){
						$('#quickviewTemplate .modal-content').css('opacity', '0');
						$('#quickviewTemplate .modal-content').css('transform', 'translateY(-30px)');
						$('#quickviewTemplate').css('background-color', 'rgba(0,0,0,0)');
						setTimeout(function(){
							$('#quickviewTemplate').hide();
						}, 500)
					})
					window.onclick = function(event) {
						if (event.target == document.getElementById('productQuickView')) {
							$('#quickviewTemplate .modal-content').css('opacity', '0');
							$('#quickviewTemplate .modal-content').css('transform', 'translateY(-30px)');
							$('#quickviewTemplate').css('background-color', 'rgba(0,0,0,0)');
							setTimeout(function(){
								$('#quickviewTemplate').hide();
							}, 500)
						}
					}
					$('#quickviewTemplate .item img').click(function (event) {
						event.preventDefault();
						var modal = $('#quickviewTemplate');
						modal.find('.p-product-image-feature').attr('src', $(this).attr('data-zoom-image'));
						modal.find('.item').removeClass('active');
						$(this).parents('li').addClass('active');
						return false;
					});
				});
			},
			error: function(xhr, text) {
				console.log(xhr.responseText);
			}
		})

	},
	initPickedOptionQuickView: function(settings){
		var $this = this;
		console.log($this.settings);
		console.log('--------- Sau ----------- ');
		$this.settings = $.extend(this.settings, settings);
		console.log($this.settings)
		var $pdParent = $(this.settings.productParent),
				variantIDs = this.settings.variantIDs;
		$this.initGetLocationsInVariant(variantIDs,$pdParent);
		this.initPickedOptionLoaded($pdParent);
	},
	initLimitItemCart: function(){
		var $this = this;
		var arrLocations = $this.settings.arrLocation;
		$('.itemCart').each(function(i,self){
			var url = $(self).data('url'),
					id = $(self).data('id');
			var url = url + '?variant=' + id +'&view=location',
					arrVariant = [];
			$.ajax({
				type: 'GET',
				url: url,
				async: true,
				success: function(data){
					arrVariant = JSON.parse('[' + data + ']');
					$.each(arrVariant, function(i,v){
						if(id == v['variantID']){
							var totalQty = 0;
							$.each(v['variantLocations'], function(j,k){
								var currentLoc = k['LocationId'];
								if(arrLocations.indexOf(currentLoc) != -1){
									totalQty += parseInt(k['Quantity']);
								}
							})
							$(self).find('input[name="updates[]"]').attr('data-limit',totalQty);
							var currentQty = $(self).find('input[name="updates[]"]').val();
							if(currentQty > totalQty){
								$(self).find('input[name="updates[]"]').val(totalQty);
								$.ajax({
									type: 'POST',
									url: '/cart/change.js',
									data: 'quantity='+ totalQty +'&id=' + id,
									dataType: 'json',
									success: function(cart) {
										$('.desktop-cart-wrapper a .hd-cart-count').html(parseInt(cart.item_count));
										$('.desktop-cart-wrapper1 a .hd-cart-count').html(parseInt(cart.item_count));
										$('.mobile-nav-item a .number').html(parseInt(cart.item_count));
									}
								})
							}
							$(self).find('input[name="updates[]"]').on('keyup change', function(){
								var qty = $(this).val();
								if(qty > totalQty)
									$(this).val(totalQty);
							})
						}
					})
				}
			});
		});
	},
	initChangeQtyAddCart: function(){
		$(document).on('click','.qty-btn', function(e){
			e.preventDefault();
			var $this = $(this);
			var $input = $this.parent().find('input[name="quantity"]');
			let currentVal = parseInt($input.val()),
					limit = parseInt($input.attr('data-limit'));
			let isPlus = $this.hasClass('plus');
			if(isPlus){
				let inVal = currentVal + 1;
				if(limit && !isNaN(limit)){
					if(inVal > limit)
						inVal = limit;
				}
				$input.val(inVal);
			}else{
				if(currentVal > 1)
					$input.val(currentVal - 1);
			}
		})
		$(document).on('keyup change','input[name="updates[]"], input[name="quantity"]', function(){
			var $this = $(this);
			let currentVal = parseInt($this.val()),
					limit = parseInt($this.attr('data-limit'));
			if(limit && !isNaN(limit)){
				if(currentVal > limit)
					currentVal = limit;
			}
			$this.val(currentVal);
		})
	}
}



