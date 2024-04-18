let products;
let currentPage = 0;
let selectedCategories = [];
let selectedGender = [];
let pathimg= "assets/img/";

$(document).ready(async function() {
    try {
        const navMenu = await ajaxPromise("assets/data/navMenu.json", "get");
        printNav(navMenu);

        const footer = await ajaxPromise("assets/data/footer.json", "get");
        printFooter(footer);

        const categories = await ajaxPromise("assets/data/categories.json", "get");
        printFilter(categories, "#categories");

        const gender = await ajaxPromise("assets/data/gender.json", "get");
        printFilter(gender, "#gender");

        products = await ajaxPromise("assets/data/products.json", "get");
        printProducts(products);
        topRatedProducts(products);
        setToLS("products", products);

        const sort= await ajaxPromise("assets/data/sort.json","get");
        ddlForSorting(sort);

    } catch (error) {
        console.error("an error occurred while loading", error);
    }

    $(document).on('change', '#categories input[type="checkbox"]', filterProducts);
    $(document).on('change', '#gender input[type="checkbox"]', filterProducts);
   
    $(document).on('change', "#ddlSort", function(){
        filterProducts();
    });
    $(document).on('click', '#trash', function(event) {
        event.preventDefault();
        let productId = $(this).data("product-id");
        removeProductFromCart(productId);
    });
    $("#btn-make-purchase").click(function() {
        $(".Reg").fadeIn();
    });

    $(".Reg .overlay-bg").click(function() {
        $(".Reg").fadeOut();
    });
    $("#btnClose").click(function() {
        $(".Reg").fadeOut();
    });
    $("#brnOrder").click(function() {
        validateRegistration();
    });
    updateCartItemCount();

    $("#search").on('keyup', function(){
        filterProducts();
    });
});


function filterProducts(){
    selectedCategories = [];
    $('#categories input[type="checkbox"]:checked').each(function() {
        selectedCategories.push($(this).val());
    });

    selectedGender = []; 
    $('#gender input[type="checkbox"]:checked').each(function() {
        selectedGender.push($(this).val());
    });

    let filteredProducts = products.filter(function(product) {
        let categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId.toString());
        let genderMatch = selectedGender.length === 0 || selectedGender.includes(product.genderId.toString());
        return categoryMatch && genderMatch;
    });

    let value=$("#ddlSort").val();
    filteredProducts = sort(value, filteredProducts);
    let keyword= $("#search").val().toLowerCase();
    filteredProducts= search(keyword, filteredProducts);
    printProducts(filteredProducts);
};

function search(keyword, filteredProducts){
    return filteredProducts.filter(function(el){
        return el.name.toLowerCase().includes(keyword);
    })
}


function sort(value, filteredProducts){
    if(value=="asc"){
        filteredProducts.sort(function(a,b){
            if(a.name<b.name){
                return -1;
            }
            else if(a.name > b.name){
                return 1;
            }
            else{
                return 0;
            }
        });
    }
    if(value=="desc"){
        filteredProducts.sort(function(a,b){
            if(a.name >b.name){
                return -1;
            }
            else if(a.name < b.name){
                return 1;
            }
            else{
                return 0;
            }
        });
    }
    if(value=="low"){
        filteredProducts.sort(function(a,b){
            return a.price.new - b.price.new;
        });
    }
    if(value=="high"){
        filteredProducts.sort(function(a,b){
            return b.price.new - a.price.new;
        });
    }

    return filteredProducts;
};


function ddlForSorting(data){
    let html =`
    <select id="ddlSort" class="form-control custom-input">
        <option value="0">Default sort</option>`;
    for(let d of data){
        html+=`<option value="${d.value}">${d.name}</option>`;
    }
    html+=`</select>`;
    $("#sort").html(html);
}


function printProducts(productsToShow){
    let html="";
    for(let d of productsToShow){
        html+=` <div class=" col-md-3 border">
        <div class="product-image mt-4 mx-auto ">
            <img src="${pathimg}${d.img.src}" alt="${d.img.src}" class="img-fluid" class=".product-image" />
            <div class="quick-shop-button">
                <a href="#" class="btn btn-danger btn-quick-shop" data-product-id="${d.id}"> <i class="fa fa-cart-plus"></i> Quick Shop</a>
            </div>
        </div>
        <div class="text">
            <p  class="text-center pt-3">${d.name}</p>
            <p class="text-center">${printPrice(d.price)}</p>
            <p class="text-center">${stars(d.stars)}</p>
        </div>
    </div>`
    }

    $("#showProducts").html(html);
    $(".btn-quick-shop").click(addToCart);
}


function topRatedProducts(products){
    
    products.sort((a, b) => b.stars - a.stars);
    const topProducts = products.slice(0, 4);
    let html="";
    for(let d of topProducts){
        html+=` <div class="col-12 col-md-3 text-center">
        <div class="product-image mt-4 mx-auto ">
            <img src="${pathimg}${d.img.src}" alt="${d.img.src}" class="img-fluid" class=".product-image" />
            <div class="quick-shop-button">
                <a href="shop.html" class="btn btn-danger btn-quick-shop" >Shop</a>
            </div>
        </div>
        <div class="text">
            <p  class="text-center pt-3">${d.name}</p>
            <p class="text-center">${printPrice(d.price)}$</p>
            <p class="text-center">${stars(d.stars)}</p>
        </div>
    </div>`
    }

    $("#topRatedProducts").html(html);
    
}


function printPrice(price){
    let html="";
        if(price.old !=null){
            html+=`<del class="text-danger">${price.old}$</del> ${price.new}$`;
        }
        else{
            html+=`${price.new}$`
        }
    return html;
}

function stars(number){
    let html="";
    for(let i=0; i<5; i++){
        if(i < number){
            html+=`<i class="fas fa-star text-danger"></i>`;
           }
           else{
            html+=`<i class="far fa-star"></i>`;
           }
    }

    return html;
};

function printFilter(data, dviId){
    let html="";
    for(let d of data){
        html+=`
        <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${d.id}" id="${d.id}">
        <label class="form-check-label" for="${d.id}">${d.name}</label>
        </div>`
    }

    $(dviId).html(html);
};


function printFooter(data) {
    let html = `<div class="row">`;
    Object.keys(data).forEach(key => {
        if (key !== "social") {
            html += `<div class="col-12 col-lg-4 col-md-6 text-center">
                        <h5 class="text-light py-3">${key}</h5>
                        <ul>`;
            data[key].forEach(item => {
                html += `<li><a href="#">${item}</a></li>`;
            });
            html += `</ul></div>`;
        }
    });
    html+=`</div>
    <div class="row py-5">
    <div class="col  text-center">
        <ul class="dil">`;
    data.social.forEach((rd, index) => {
        const className = index === 0 ? "" : "ml";
        html += `<li class="${className} dil"><a href="${rd.href}"><i class="${rd.icon}"></i></a></li>`;
    });
        
    html+=`</ul></div></div>`;
    $("#footer").html(html);
}


function printNav(data){
    let html="";
    for(let d of data){
       html+=` <li class="mln"><a class="text-uppercase fw text-dark" href="${d.href}">${d.text}</a></li>`;
    }
    $("#navMenu").html(html);
};


function ajaxPromise(url, method) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: method,
            dataType: "json",
            success: resolve,
            error: reject
        });
    });
}


function getFromLS(itemKey){
    return JSON.parse(localStorage.getItem(itemKey));
}


function setToLS(itemKey, itemValue){
    localStorage.setItem(itemKey, JSON.stringify(itemValue));  
};

function addToCart(){
    let clickedId = $(this).data("product-id");
    let productsFromCart = getFromLS("productsInCart");

    if(productsFromCart){
        if(productAlreadyExists()){
            quantity();
        }
        else{
            addOtherItemsToCart();
        }
    }
    else{
        addItemToCart();
    }

    function quantity(){
        for(let i = 0; i < productsFromCart.length; i++){
            if(productsFromCart[i].id == clickedId){
                productsFromCart[i].qu++;
                break;
            }
        }
        setToLS("productsInCart", productsFromCart);
    };

    function productAlreadyExists(){
        return productsFromCart.some(el => el.id == clickedId);
    };

    function addOtherItemsToCart(){
        productsFromCart.push({
            id: clickedId,
            qu: 1
        });
        setToLS("productsInCart", productsFromCart);
        updateCartItemCount();
    };

    function addItemToCart(){
        let productsInCart = [{
            id: clickedId,
            qu: 1
        }];
        setToLS("productsInCart", productsInCart);
        updateCartItemCount();
    };
};

function updateCartItemCount() {
    let productsInCart = getFromLS("productsInCart");
    let itemCount = 0;

    if (productsInCart) {
        itemCount = productsInCart.length; 
    }

    $("#cartItemCount").text(itemCount);
};


if(window.location.href.includes("cart.html")){
    let productsFromCart = getFromLS("productsInCart");
    if(productsFromCart == null){
        emptyCart();
    } else {
        productsInCart();

    }
}

function emptyCart(){
    let html=`
        <div class="text-center"><h3 class="my-4">Cart is empty!</h3>
        </div>
    `;
    let html1= `<a href="shop.html"><input type="button" class="btn btn-danger" value="Shop now"/></a>`;
    $(".table-responsive").html(html);
    $(".card-body").html(html1);
}

function productsInCart() {
    let productsInCart = getFromLS("productsInCart");
    let products = getFromLS("products");
    let productsFromCart = [];
    for (let cartProduct of productsInCart) {
        let product = products.find(p => p.id === cartProduct.id);
        if (product) {
            productsFromCart.push({
                ...product,
                quantity: cartProduct.qu
            });
        }
    }

    let html = `
    <table class="table table-borderless table-shopping-cart">
        <thead class="text-muted">
            <tr class="small text-uppercase">
                <th scope="col" width="120">Product</th>
                <th scope="col" width="120"></th>
                <th scope="col" width="120">Price</th>
                <th scope="col" width="120">Quantity</th>
                <th scope="col" width="120">Total price</th>
                <th scope="col" width="50">Remove</th>
            </tr>
        </thead>
        <tbody class="cart-content">
    `;
    for (let pr of productsFromCart) {
        html += `<tr>
            <td>${pr.name}</td>
            <td><img src="${pathimg}${pr.img.src}" alt="${pr.img.alt}" style="height:100px" class="img-responsive"/></td>
            <td>${pr.price.new}$</td>
            <td>${pr.quantity}</td>
            <td>${pr.price.new*pr.quantity}$</td>
            <td><a href="#" class="icon" data-product-id="${pr.id}" id="trash"><i class="fas fa-trash-alt "></i></a></td> 
        </tr>`;
    }
    html += `</tbody></table>`;

    let totalPrice = productsFromCart.reduce((total, product) => total + (product.price.new * product.quantity), 0);
    let html1= `<div class="card-body">
    <p>Total price: ${totalPrice}$</p>
    <hr> <a href="#" id="btn-make-purchase" class="btn btn-out btn-danger btn-square btn-main" data-abc="true">Make Purchase</a>
    </div>`;
    $(".table-responsive").html(html);
    $(".card-body").html(html1);
}

function removeProductFromCart(productId) {
    let productsInCar = getFromLS("productsInCart");
    let updatedProductsInCart = productsInCar.filter(product => product.id !== productId);
    setToLS("productsInCart", updatedProductsInCart);
    productsInCart();
    updateCartItemCount();
    refreshPage();
}

function removeAllProductsFromCart() {
    localStorage.removeItem("productsInCart");
    productsInCart();
}

function refreshPage() {
    window.location.reload();
}

function validateRegistration() {
    let firstName, lastName, payment, adress, errors;
    firstName = $('#tbRegFName');
    lastName = $('#tbRegLName');
    payment = $('input[name=rbPayment]:checked');
    adress = $('#tbAdress');
    errors = 0;
    
    let reName, reAdress;
    reName = /^[A-Z][a-z]{2,14}$/;
    reAdress=/^[a-zA-Z\s,'-]{3,}\s\d.*/;
/*
    $('.alert').addClass('dn').html('');

    if (!reAdress.test(adress.val())) {
        adress.next().removeClass("dn");
        adress.next().html("Example: Perinska 23");
        adress++;
    }
    else {
        adress.next().addClass("dn").html("");
    }
    if (!reName.test(firstName.val())) {
        firstName.next().removeClass("dn");
        firstName.next().html("Example Eve");
        errors++;
    }
    else {
        firstName.next().addClass("dn").html("");
    }
    if (!reName.test(lastName.val())) {
        lastName.next().removeClass("dn");
        lastName.next().html("Example Polastri");
        errors++;
    }
    else {
        lastName.next().addClass("dn").html("");
    }
    if (payment.length === 0) {
        $('#payment').next().removeClass("dn").html("You must select a payment method");
        errors++;
    } else {
        $('#payment').next().addClass("dn").html("");
    }*/
    if(errors==0){
        $("#successOrder").addClass("scsJoin");
        $("#successOrder").html("Successful purchase");
        removeAllProductsFromCart();
    }
};