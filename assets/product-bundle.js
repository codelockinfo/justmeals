

$(document).on("click", ".productsimage .card__image", function(e) {
	$bkpQty = $(this).closest(".productsimage").find(".product-quantity.show .product-quantity__selector").val();
	var thisObj = $(this).closest(".productsimage").find("quick-view-product a");
	
	e.preventDefault();
	if (!thisObj.quickViewModal) {
		const target = e.currentTarget;
		target.classList.add('working');
		fetch(`${target.getAttribute('href')}${ target.getAttribute('href').includes('?') ? '&' : '?' }view=quick-view`)
			.then(response => response.text())
			.then(text => {

				const quickViewHTML = new DOMParser().parseFromString(text, 'text/html').querySelector('#product-quick-view');
				const quickViewContainer = document.createElement('div');
				quickViewContainer.innerHTML = `<modal-box id="modal-${target.dataset.id}"	
              class="modal modal--product" 
              data-options='{
                "enabled": false,
                "showOnce": false,
                "blockTabNavigation": true
              }'
              tabindex="-1" role="dialog" aria-modal="true" 
            >
              <div class="container--medium">
                <div class="modal-content">
                  <button class="modal-close" data-js-close data-js-first-focus style="position:absolute;margin:0;top:0;right:0">${window.KROWN.settings.symbols.close}</button>
                </div>
              </div>
              <span class="modal-background" data-js-close></span>
            </modal-box>`;

				thisObj.quickViewModal = quickViewContainer.querySelector('modal-box');
				document.body.appendChild(thisObj.quickViewModal);
				thisObj.quickViewModal.querySelector('.modal-content').innerHTML = quickViewHTML.innerHTML;
				if (!window.productPageScripts) {
					const scripts = thisObj.quickViewModal.querySelectorAll('script');
					scripts.forEach(elm => {
						const script = document.createElement('script');
						script.src = elm.src;
						document.body.append(script);
						window.productPageScripts = true;
					})
				}

				thisObj.quickViewModal.querySelector('.product-quick-view__close').addEventListener('click', () => {
					thisObj.quickViewModal.hide();
				});

				if (thisObj.quickViewModal.querySelector('[data-js-product-form]')) {
					thisObj.quickViewModal.querySelector('[data-js-product-form]').addEventListener('add-to-cart', () => {
						thisObj.quickViewModal.hide();
					});
				}
				setTimeout(() => {
					thisObj.quickViewModal.show();
					console.log($bkpQty);
					if($bkpQty != undefined){
						var innnHtml = thisObj.quickViewModal.querySelector('.modal-content');
						console.log(innnHtml);
						innnHtml.querySelector(".popupaddbtn").classList.remove('show');
						innnHtml.querySelector(".productQty").classList.add('show');
						innnHtml.querySelector(".productQty .product-quantity__minus").classList.remove('disabled');
						innnHtml.querySelector(".product-quantity__selector").value = $bkpQty;
					}
					target.classList.remove('working');
				}, 250);
			});
	} else {
		thisObj.quickViewModal.show();
	}
});

$(document).ready(function() {
	const filterContainer = $(".mainboxli");
	filterContainer.on("click", function() {
		var collection_id = $(this).data("collection-id");
		const filterUrl = $(this).find(".tablisting").attr('value') // Update with your actual collection URL + filters
		$.get(filterUrl, function(data) {			
			$("#filtered-products .productsimage").css("display", "none");
			$eachProduct = $(data).find("#main-collection-product-grid .product-item.card");
			console.log($eachProduct);
			$($eachProduct).each(function() {
				console.log($(this).attr('data-product'));
				$eachProductId = $(this).attr('data-product');
				$(".productsimage[data-product='" + $eachProductId + "']").attr("data-collection",collection_id);
				$(".productsimage[data-product='" + $eachProductId + "']").css("display", "block");
			});
		}).fail(function(error) {
			console.error("Error fetching products:", error);
		});
	});

	const filterContainerselect = $("#product-filterselect");
	filterContainerselect.on("change", function() {
		$selectValue = $(this).val();
		const filterUrl = $(this).val() // Update with your actual collection URL + filters

		$.get(filterUrl, function(data) {
			$("#filtered-products .productsimage").css("display", "none");
			$eachProduct = $(data).find("#main-collection-product-grid .product-item.card");
			$($eachProduct).each(function(index) {
				$eachProductId = $(this).attr('data-product');
				$(".productsimage[data-product='" + $eachProductId + "']").css("display", "block");
			});
		}).fail(function(error) {
			console.error("Error fetching products:", error);
		});
	});

	$(document).on("click", ".product-quantity__plus", function() {
		$variantQty = $(this).closest(".productQty").find(".product-quantity__selector").val();
		$var_id = $(this).closest(".productsimage").data("variant");
		$html = $(this).closest(".productsimage").html();
		$summeryindex = $(this).closest(".container-box").attr('data-summery-index');
		if ($variantQty == 1) {
			$(".box-summary").append("<div class='productsimage'>" + $html + "</div>");
		} else {
			// $('.box-summary .container-box[data-summery-index="' + $summeryindex + '"] .product-quantity__selector').val($variantQty);
			$('.container-box[data-variant="' + $var_id + '"] .product-quantity__minus').removeClass('disabled');
			$(".main-custombundle div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQty);
			$(".box-summary div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQty);
		}
		getcartTotalQty();
	});

	$(document).on("click", ".product-quantity__minus", function() {
		var selected_item = getCookie("variantids");
		var variant_qty = getCookie("variant_qty");
		var delimiter = ",";
		var itemArray = selected_item.split(delimiter);
		var itemQtyArray = variant_qty.split(delimiter);
		$var_id = $(this).closest(".productsimage").data("variant");
		$variantQtyMinus = $(this).closest(".productQty").find(".product-quantity__selector").val();
		$summeryindex = $(this).closest(".container-box").attr('data-summery-index');
		console.log($variantQtyMinus);

		for (var i = 0; i < itemArray.length; i++) {
			if ($.trim($var_id) == itemArray[i].trim()) {
				console.log(itemQtyArray[i].trim());
				console.log("=============");
				if (itemQtyArray[i].trim() == $variantQtyMinus) {
					itemArray.splice(i, 1);
					itemQtyArray.splice(i, 1);
					setCookie("variantids", itemArray, {path: '/'});
					setCookie("variant_qty", itemQtyArray, {path: '/'});
					$(".box-summary").find('.container-box[data-variant="' + $var_id + '"]').closest(".productsimage").remove();
					$(".main-custombundle .productsimage[data-variant='" + $var_id + "']").find(".productQty").removeClass("show");
					$(".main-custombundle .productsimage[data-variant='" + $var_id + "']").find(".add-button").css("display", "block");
				}
			}
		}
		$(".main-custombundle div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQtyMinus);
		$(".box-summary div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQtyMinus);
		getcartTotalQty();
	});

	$(".productSelect").change(function() {
		$giftVariantid = $(this).find(":selected").val();
		console.log($giftVariantid);
		$(this).attr("data-vid", $giftVariantid);
	});
	
	$('.addToCart').click(function(e) {
		e.preventDefault();
		$(".subscriptionlabel").each( function( i ) {
			if($(this).hasClass('active')){
				$dataValue = $(this).data('value');
				if($dataValue == "subscribe & save"){
					subscriptionAddtocart();
				}else{
					onetimeAddtocart();
				}
			}
		});
	});

	function onetimeAddtocart(){
		$giftVariantid = $(".product-variant-select").val();
		$giftProductid = $(".giftProduct").data("product");

		var PRODUCT_ID = $(".product_variant_id").val();
		
		var bundleObject = {
			externalProductId: '8619519803673',
			externalVariantId: PRODUCT_ID ,
			selections: []
		};

		var selling_plan_id = $( "input[name='selling_plan']").val();
		$getproductPrices = 0;
		$.each($("#cartSummary .productsimage"), function() {

			$price = $(this).find(".product-price--original").data("price");
			$currentVarQty = $(this).find(".product-quantity__selector").val();
			$Dataprice = ($price != undefined) ? $price.split("$") : 0;
			// €
			if ($Dataprice != 0) {
                $getproductPrices += $currentVarQty * parseFloat($Dataprice[1]);
			}


			$currentVarQty = $(this).find(".product-quantity__selector").val();
			var product_id = $(this).data("product");
			var variant_id = $(this).data("variant");
			var collection_id = $(this).data("collection");

			var item_data = {
				collectionId: collection_id,  // Example Shopify Collection
				externalProductId: product_id,  // Dynamic Product ID
				externalVariantId: variant_id,  // Dynamic Variant ID
				quantity: $currentVarQty  // Dynamic Quantity
			}
			bundleObject.selections.push(item_data);
		});
		

			$splitMaxPrice = $(".maxCartprice").val().split("$");
			var inputtotalrangemax = $splitMaxPrice[1];
			
			if(inputtotalrangemax < $getproductPrices){
				console.log("PRICE");
				var plan15 = $('.giftProduct').attr('gift-data-selling15');  
				var plan30 = $('.giftProduct').attr('gift-data-selling30');
				var giftSellingPlanId = (selling_plan_id == '689131815193') ? plan15 : plan30;
	  
				var item_data = {
					collectionId: '459204722969',
				  	externalProductId: $giftProductid,  // GIFT PRODUCT ID
				  	externalVariantId: $giftVariantid,  // THE SELECTED VARIANT
				  	quantity: 1  // Dynamic Quantity
				  	// sellingPlan: giftSellingPlanId // Dynamic Selling Plan ID
			  	}
			  	bundleObject.selections.push(item_data);
				console.log(bundleObject);
			}



		const bundle = bundleObject;
		console.log(bundle);
		const bundleItems = recharge.bundle.getDynamicBundleItems(bundle, 'shopifyProductHandle');
		
        // var get_main_bundle_id = bundleItems[0]['properties']['_rc_bundle'];
        //var get_main_bundle_id = "8619519803673";
		const cartData = { items: bundleItems };
		const asyncGetCall = async () => {
			
			const respons = await fetch(window.Shopify.routes.root + 'cart/add.js', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cartData),
			});
			const data = await respons.json();
			console.log(data);
			if(data !== undefined){
				removeCookie("variantids");
				removeCookie("variant_qty");
				window.location.href = '/checkout';
			}
			// if($giftVariantid !== undefined){
			// addGiftproduct($giftVariantid,get_main_bundle_id);
			// }else{
			// }
		}
		asyncGetCall();
	}

    function buildFreeProductForSubscription($giftVariantid, ){
         // Corrected this part to refer to a known element if 'this' is not clear
      	var plan15 = $('.giftProduct').attr('gift-data-selling15');  
      	var plan30 = $('.giftProduct').attr('gift-data-selling30');
      	var giftSellingPlanId = (selling_plan_id === null) ? plan15 : plan30;

      	var item_data = {
			collectionId: collection_id,  // Example Shopify Collection WE NEED TTO STORE THE COLLECTION IT BELONGS TO. 
			externalProductId: $productid,  // GIFT PRODUCT ID
			externalVariantId: $giftVariantid,  // THE SELECTED VARIANT
			quantity: 1,  // Dynamic Quantity
			sellingPlan: giftSellingPlanId // Dynamic Selling Plan ID
		}
    }
 
	function subscriptionAddtocart(){
		$giftVariantid = $(".product-variant-select").val();
		$giftProductid = $(".giftProduct").data("product");
		var PRODUCT_ID = $(".product_variant_id").val();
        console.log('giftVariantid');
        console.log($giftVariantid);

		var bundleObject = {
			externalProductId: '8619519803673',
  			externalVariantId: PRODUCT_ID,
			selections: []
		};
		var static_frequancy = 15;
		// var selling_plan_id = $("#sellingPlan"+meta.product.id).val();
		var selling_plan_id = $( "input[name='selling_plan']").val();
		console.log(meta.product.id + " MTEA PRODUCT");
		console.log(selling_plan_id + " selling_plan_id");
		
		if(selling_plan_id ==  undefined){
			if(window.Recharge.widgets[meta.product.id] !== undefined){
				var selling_plans = window.Recharge.widgets[meta.product.id].product.selling_plan_groups;
                console.log(selling_plans);
				for(var i = 0; i < selling_plans.length; i++){
					for(var j = 0; j < (selling_plans[i].selling_plans).length; j++ ){
						var selling_plan_details = selling_plans[i].selling_plans[j];
						if(selling_plan_details.order_interval_frequency == static_frequancy){
							selling_plan_id = selling_plan_details.selling_plan_id;
						}
					}
				}
			}
		}

		bundleObject.sellingPlan = selling_plan_id;
		$getproductPrices = 0;
		$.each($("#cartSummary .productsimage"), function() {

			$price = $(this).find(".product-price--original").data("price");
			$currentVarQty = $(this).find(".product-quantity__selector").val();
			$Dataprice = ($price != undefined) ? $price.split("$") : 0;
			// €
			if ($Dataprice != 0) {
                $getproductPrices += $currentVarQty * parseFloat($Dataprice[1]);
			}
			var product_id = parseInt($(this).data("product"));
			var variant_id = parseInt($(this).data("variant"));

			// console.log(variant_id);
			var collection_id = $(this).data("collection");
			var sellingplan_id = (selling_plan_id == '689131815193') ? $(this).data("selling15") : $(this).data("selling30");

			var item_data = {
				collectionId: collection_id,  // Example Shopify Collection
				externalProductId: product_id,  // Dynamic Product ID
				externalVariantId: variant_id,  // Dynamic Variant ID
				quantity: $currentVarQty,  // Dynamic Quantity
				sellingPlan: sellingplan_id // Dynamic Selling Plan ID
			}
			bundleObject.selections.push(item_data);
		});

        // var get_main_bundle_id = bundleItems[0]['properties']['_rc_bundle'];
        // check the price of to see if we need to append the free product to the selections before we get all the recharge values back needed to add to subscription.
		if($giftVariantid !== undefined){
			console.log("INNN");
			$splitMaxPrice = $(".maxCartprice").val().split("$");
			var inputtotalrangemax = $splitMaxPrice[1];
			
			if(inputtotalrangemax < $getproductPrices){
				console.log("PRICE");
				var plan15 = $('.giftProduct').attr('gift-data-selling15');  
				var plan30 = $('.giftProduct').attr('gift-data-selling30');
				var giftSellingPlanId = (selling_plan_id == '689131815193') ? plan15 : plan30;
	  
				var item_data = {
					collectionId: '459204722969',
				  	externalProductId: $giftProductid,  // GIFT PRODUCT ID
				  	externalVariantId: $giftVariantid,  // THE SELECTED VARIANT
				  	quantity: 1,  // Dynamic Quantity
				  	sellingPlan: giftSellingPlanId // Dynamic Selling Plan ID
			  	}
			  	bundleObject.selections.push(item_data);
				console.log(bundleObject);
			}
				// buildFreeProductForSubscription(PRODUCT_ID);
				// @brandon Here I'm trying to append the selection to the other selections. 
				// bundleObject.selections.push(buildFreeProductForSubscription);
				
				const bundle = bundleObject;
				const bundleItems = recharge.bundle.getDynamicBundleItems(bundle, 'shopifyProductHandle');
				// console.log('get_main_bundle_id---'+get_main_bundle_id);
				
				const cartData = { items: bundleItems };
				const asyncGetCall = async () => {
					const respons = await fetch(window.Shopify.routes.root + 'cart/add.js', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(cartData),
					});
					const data = await respons.json();
					console.log(data);
					removeCookie("variantids");
					removeCookie("variant_qty");
					window.location.href = '/checkout';
				}
				asyncGetCall();
		}
	}


// function addGiftproduct(giftVariantid, get_main_bundle_id) {
//     console.log('something here');
//     var data = {
//         quantity: 1, // Adjust the quantity as needed
//         id: giftVariantid,
//     };

//     // if (sellingplan_id) {
//     //     data.properties = {
//     //         "_main_bundle_id": get_main_bundle_id,
//     //         "_rc_bundle": get_main_bundle_id,
//     //         "_rc_bundle_variant": PRODUCT_ID
          
//     //     };
//     // }

//     $.ajax({
//         url: '/cart/add.js',
//         dataType: 'json',
//         type: 'POST',
//         data: data,
//         success: function(response) {
//             console.log('Success----');
//             console.log(response);
//             removeCookie("variantids");
//             removeCookie("variant_qty");
//             window.location.href = '/checkout';
//         },
//         error: function(jqXHR, textStatus, errorThrown) {
//             console.log('Error:', textStatus, errorThrown);
//         }
//     });
// }
  
	set_lineitems_onload();
	$(document).on("click",".addButton",function() {
		console.log("addButton  click");
		$var_id = $(this).closest(".productsimage").data("variant");
		$product_id = $(this).closest(".productsimage").data("product");
		$selling_plan_15id = $(this).closest(".productsimage").data("selling15");
		$selling_plan_30id = $(this).closest(".productsimage").data("selling30");
		$collection_id = $(this).closest(".productsimage").data("collection");
		$(this).css("display", "none");
		$(this).closest(".container-box").find(".product-quantity").addClass("show");
		$html = $(this).closest(".productsimage").html();
		$(".box-summary").append("<div class='productsimage' data-selling30='"+$selling_plan_30id+"' data-selling15='"+$selling_plan_15id+"' data-variant='" + $var_id + "' data-product='"+$product_id+"' collection-id='"+$collection_id+"' data-collection='"+$collection_id+"'>" + $html + "</div>");
		getcartTotalQty();
	});

	function set_lineitems_onload() {
		  $staticGiftProduct = '<div class="freeTurkey">'+
		  '<div class="product-item card container-box" data-summery-index="4">'+
		  '<div class="imageforcart">'+
			  '<img src="https://cdn.shopify.com/s/files/1/0555/1751/1961/files/RoastedTurkeyBreast_b95ca030-1edb-4510-8c8d-f6b03187bffd.png?v=1693605897" alt="">'+
		  '</div>'+
			'<div class="flexdirrow card__text product-item__text gutter--regular spacing--xlarge remove-empty-space text-align--center">'+
			  '<div class="cartfontcontainer"><a class="product-item__title" title="turkey">'+
						'<div class="remove-line-height-space--small marginbottomtitle">'+
						  '<span data-id="46476104368409" class="variant-title  text-size--large text-line-height--small text-weight--bold">Turkey</span>'+
						'</div>'+
					  '</a>'+
		  '<div class="product-item__price text-size--large equalize-white-space">'+
						'<div class="remove-line-height-space">'+
		  '<div class="product-price"><span class="product-price--original " data-js-product-price-original="" data-price="FREE">FREE</span>'+
			  '<del class="product-price--compare" data-js-product-price-compare=""></del><span class="product-price--unit text-size--regular" data-js-product-price-unit=""></span>'+
		  '</div></div>'+
		  '</div>'+
		  '</div>'+
		  '</div><div class="product-item__badges text-size--xsmall"></div></div>'+
		  '</div>';

		$("#cartSummary").append($staticGiftProduct);
		var selected_item = getCookie("variantids");
		var variant_qty = getCookie("variant_qty");
		if (selected_item) {
			var delimiter = ",";
			var itemArray = selected_item.split(delimiter);
			var itemQtyArray = variant_qty.split(delimiter);
			for (var i = 0; i < itemArray.length; i++) {
				var product_item = itemArray[i].trim();
				var product_item_qty = itemQtyArray[i].trim();
				$("div[data-variant='" + product_item + "']").find(".product-quantity").addClass("show");
				$("div[data-variant='" + product_item + "']").find(".productQty .qty-minus").removeClass('disabled');
				$("div[data-variant='" + product_item + "']").find(".addButton").css("display", "none");
				$("div[data-variant='" + product_item + "']").find(".productQty .product-quantity__selector").val(product_item_qty);
				$product_id = $("div[data-variant='" + product_item + "']").data("product");
				$collection_id = $("div[data-variant='" + product_item + "']").data("collection");
				$selling_plan_15id = $("div[data-variant='" + product_item + "']").data("selling15");
				$selling_plan_30id = $("div[data-variant='" + product_item + "']").data("selling30");
				$getHtml = $(".main-custombundle div[data-variant='" + product_item + "']").html();
				$(".box-summary").append("<div class='productsimage' data-selling30='"+$selling_plan_30id+"' data-selling15='"+$selling_plan_15id+"' data-variant='" + product_item + "' data-product='"+$product_id+"' data-collection='"+$collection_id+"'>" + $getHtml + "</div>");
				$(".box-summary div[data-variant='" + product_item + "']").find(".productQty .product-quantity__selector").val(product_item_qty);
				$(".box-summary div[data-variant='" + product_item + "']").find(".productQty .qty-minus").removeClass('disabled');
			}
		}
		getcartTotalQty();
	}

	function getcartTotalQty() {
		var selected_items = [];
		var selected_item_qty = [];
		var cartTotQty = 0;
    	var indicatore = 0;
		$splitMinPrice = $(".minCartprice").val().split("$");
		var inputtotalrange = $splitMinPrice[1];
		$splitMaxPrice = $(".maxCartprice").val().split("$");
		var inputtotalrangemax = $splitMaxPrice[1];
		$.each($(".subscriptionlabel"), function(index) {
			if($(this).hasClass('active')){
				$dataValue = $(this).data('value');
				if($dataValue == "subscribe & save"){
					inputtotalrange = Math.round(inputtotalrangemax - (inputtotalrangemax*31)/100);
					// inputtotalrange = Math.round(inputtotalrangemax - (inputtotalrangemax*35)/100);
				}
				// console.log(inputtotalrange + "inputtotalrange");
				// return false;
			}
		});
		$productPrices = 0;
		$getproductPrices = 0;
		$.each($("#cartSummary .productsimage .product-quantity__selector"), function(index) {

			cartTotQty += parseInt($(this).val());
			$currentVarQty = $(this).val();
			$price = $(this).closest(".productsimage").find(".product-price--original").data("price");
			// console.log($price);
			$Dataprice = ($price != undefined) ? $price.split("$") : 0;
			// €
			if ($Dataprice != 0) {
                $getproductPrices += $currentVarQty * parseFloat($Dataprice[1]);
                $productPrices += $currentVarQty * parseInt($Dataprice[1]);
				// console.log($productPrices + "TP");
			}

			var varId = $(this).closest(".productsimage").find(".variant-title").data("id");
			var checkExistingVal = $.inArray(varId, selected_items);
			if (checkExistingVal !== -1) {
				selected_items[checkExistingVal] = varId;
				selected_item_qty[checkExistingVal] = $currentVarQty;
			} else {
				selected_items.push(varId);
				selected_item_qty.push($currentVarQty);
			}
			setCookie("variantids", selected_items, 7);
			setCookie("variant_qty", selected_item_qty, 7);

		});
		// var productPrice = $("#rangeSlider").attr("step");
		// var pro_price = cartTotQty * parseInt($productPrices);

      
		indicatore = ($productPrices * 100)/inputtotalrange;
      
		if ($getproductPrices <= inputtotalrange) {
			$("#rangeSlider").val($getproductPrices);
			$(".range-slider__indicators .range-slider__value").css("left",indicatore+"%");
      	} else if ($getproductPrices > inputtotalrange) {
            $("#rangeSlider").val($getproductPrices);
			$(".range-slider__indicators .range-slider__value").css("left","100%");
		}
		// do't remove this comment
		// $(".range-slider__indicators .range-slider__value").html("$"+$productPrices);
		// do't remove this comment

		$remain_amount = inputtotalrange - $getproductPrices;
		var $getremainAmount = Math.round($remain_amount * 100) / 100;
		if(inputtotalrangemax < $getproductPrices){
			if (!$(".productsimage").hasClass("giftProduct")) {
				$(".box-giftproduct").addClass("show");
			}
		}else{
			$(".box-giftproduct").removeClass("show");
		}
		if ($remain_amount < 1) {
			console.log("GIFTPRODUCT ADD");
			$remain_amount = '';
			$(".addToCart").prop('disabled', false);
			$(".addToCart").css("cursor", "pointer");
		} else {
			$(".addToCart").attr("disabled", "disabled");
			$(".addToCart").css("cursor", "not-allowed");
			$remain_amount = "$" + $remain_amount + " Left to ";
		}
      
        var $getproductPrices = Math.round($getproductPrices * 100) / 100;
        var $getremain_amount = Math.round($getremainAmount * 100) / 100;

        if($getproductPrices == 0){
          var $getproductPrices = $getproductPrices;          
          var $finalremainamount = $getremain_amount;                    
        }
        else{
          var $getproductPrices = $getproductPrices.toFixed(2);                    
          var $finalremainamount = $getremain_amount.toFixed(2);                    
        }
      
        var $finalremainamount = "$" + $finalremainamount + " Left to ";

		if ($getremainAmount < 1) {
          var $finalremainamount = "";  
        }

          $(".addToCart").find("span").text($finalremainamount + " Checkout ($" + $getproductPrices + ")");
          $(".stickyAddtocart").find("span").text($finalremainamount + " Checkout ($" + $getproductPrices + ")");

		// $(".addToCart").find("span").text($remain_amount + " Checkout ($" + $productPrices + ")");
		// $(".stickyAddtocart").find("span").text($remain_amount + " Checkout ($" + $productPrices + ")");

      return cartTotQty;
	}
	$(document).on("click", ".stickycartbtn", function() {
		console.log("stocky btn click");
		$(".cartcolumn").addClass("active");
	});
	$(document).on("click", ".containerCircle", function() {
		$(".cartcolumn").removeClass("active");
	});
	$(document).on("click",".subscriptionOption",function(){
		console.log("CLICK");
		$(this).closest(".subscriptionlabel").addClass("active");
		$(".onetimeOption").closest(".subscriptionlabel").removeClass("active");
		$(".deliverybox").removeClass("hide");
		$(".rc-selling-plans").removeClass("hide");

		getcartTotalQty();
	});
	$(document).on("click",".onetimeOption",function(){
		console.log("CLICK");
		$(this).closest(".subscriptionlabel").addClass("active");
		$(".subscriptionOption").closest(".subscriptionlabel").removeClass("active");
		$(".deliverybox").addClass("hide");
		$(".rc-selling-plans").addClass("hide");
		getcartTotalQty();
	});
	$(document).on("click",".popupAddbtn",function(){
		console.log("popupAddbtn");
		$(this).css("display", "none");
		$(this).closest(".custom-quickview").find(".product-quantity").addClass("show");
		$productId = $(this).closest(".custom-quickview").data("id");
		// $backupQty = $(".custom-bundle .main-custombundle .productsimage[data-product='"+ $productId +"'] .product-quantity__selector").val();
	
		$(".main-custombundle .productsimage[data-product='"+ $productId +"']").find(".addButton").trigger("click");
	
	});
});

function setCookie(name, value, daysToExpire) {
	var date = new Date();
	date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
	var expires = "expires=" + date.toUTCString();
	document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function removeCookie(cookieName) {
  document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getCookie(name) {
	var cookieName = name + "=";
	var cookieArray = document.cookie.split(';');
	for (var i = 0; i < cookieArray.length; i++) {
		var cookie = cookieArray[i].trim();
		if (cookie.indexOf(cookieName) === 0) {
			return cookie.substring(cookieName.length, cookie.length);
		}
	}
	return null;
}
