(function () {
  var config = window.BAKERY_CONFIG;
  var products = window.BAKERY_PRODUCTS;
  var cart = [];
  var activeProduct = null;
  var activeQuantity = 1;
  var visibleCount = 9;

  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var modal = document.querySelector("[data-modal]");
  var cartDrawer = document.querySelector("[data-cart-drawer]");
  var cartButton = document.querySelector("[data-cart-button]");
  var category = document.body.dataset.category || "";

  var collections = {
    signature: {
      name: "Signature Collection",
      href: "signature/",
      description:
        "Our signature handcrafted creations featuring artistic designs, elegant finishes and premium craftsmanship for extraordinary celebrations.",
      tags: "Designer Cakes, Luxury Cakes, Floral Cakes, Creative Cakes, Premium Theme Cakes, Modern Cakes, Custom Cakes"
    },
    birthday: {
      name: "Birthday Collection",
      href: "birthday/",
      description:
        "Thoughtfully handcrafted birthday cakes designed to make every celebration unforgettable.",
      tags: "Kids Themes, Cartoon Cakes, Birthday Toppers, Birthday Decorations, Birthday Special Cakes"
    },
    "wedding-anniversary": {
      name: "Wedding & Anniversary",
      href: "wedding-anniversary/",
      description:
        "Elegant handcrafted cakes designed for weddings, anniversaries, engagements and romantic celebrations.",
      tags: "Wedding Cakes, Heart Cakes, Couple Cakes, Anniversary Cakes, Romantic Cakes, Engagement Cakes"
    }
  };

  function imageUrl(path) {
    return encodeURI(path).replace(/'/g, "%27");
  }

  function whatsappUrl(message) {
    return "https://wa.me/" + config.whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  function productImagePath(product) {
    var depth = document.body.dataset.assetDepth || "";
    return depth + product.image;
  }

  function createProductImage(product) {
    var image = document.createElement("div");
    image.className = "product-image";
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", product.name);
    image.style.backgroundImage = 'url("' + imageUrl(productImagePath(product)) + '")';
    image.style.backgroundSize = "cover";
    image.style.backgroundPosition = "center";
    return image;
  }

  function customizeMessage(product, weight) {
    return [
      "Hello The Baking Studio,",
      "",
      "I'd like to customize this cake.",
      "",
      "Cake Name: " + product.name,
      "Weight: " + weight,
      "Occasion:",
      "",
      "Please let me know the available customization options."
    ].join("\n");
  }

  function productCard(product) {
    var card = document.createElement("article");
    card.className = "product-card reveal";
    card.appendChild(createProductImage(product));
    card.insertAdjacentHTML(
      "beforeend",
      '<div class="card-body"><h3>' +
        product.name +
        '</h3><p class="price">' +
        product.price +
        '</p><div class="tags"><span>Eggless</span><span>Made To Order</span><span>Freshly Baked</span></div><div class="card-actions"><button class="btn btn-secondary" type="button" data-view-product="' +
        product.id +
        '">View Details</button><a class="btn btn-primary" href="' +
        whatsappUrl(customizeMessage(product, product.weights[0])) +
        '" target="_blank" rel="noreferrer">Customize Cake</a></div></div>'
    );
    return card;
  }

  function renderFeatured() {
    var target = document.querySelector("[data-featured-products]");
    if (!target) return;
    products.filter(function (product) { return product.featured; }).slice(0, 3).forEach(function (product) {
      var card = document.createElement("article");
      card.className = "featured-card";
      card.appendChild(createProductImage(product));
      card.insertAdjacentHTML(
        "beforeend",
        '<span class="best-seller-badge">Best Seller</span><div class="card-body"><h3>' +
          product.name +
          '</h3><p>' +
          product.themeLine +
          "</p></div>"
      );
      target.appendChild(card);
    });
  }

  function renderBestSellers() {
    var target = document.querySelector("[data-best-sellers]");
    if (!target) return;
    products.filter(function (product) { return product.bestSeller; }).slice(0, 3).forEach(function (product) {
      target.appendChild(productCard(product));
    });
  }

  function renderCollections() {
    var target = document.querySelector("[data-collections]");
    if (!target) return;
    Object.keys(collections).forEach(function (key) {
      var data = collections[key];
      var cover = products.find(function (product) {
        if (Array.isArray(product.category)) {
          return product.category.indexOf(key) !== -1;
        }
        return product.category === key;
      }) || products[0];
      var card = document.createElement("article");
      card.className = "collection-card reveal";
      card.appendChild(createProductImage(cover));
      card.insertAdjacentHTML(
        "beforeend",
        '<div class="card-body"><p class="eyebrow">' +
          data.tags +
          "</p><h3>" +
          data.name +
          "</h3><p>" +
          data.description +
          '</p><a class="btn btn-primary" href="' +
          data.href +
          '">Explore Collection</a></div>'
      );
      target.appendChild(card);
    });
  }

  function currentCategoryProducts() {
    return products.filter(function (product) {
      if (!category) return true;
      if (Array.isArray(product.category)) {
        return product.category.indexOf(category) !== -1;
      }
      return product.category === category;
    });
  }

  function sortProducts(list, sort) {
    var sorted = list.slice();
    if (sort === "name") {
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
    if (sort === "price-low") {
      sorted.sort(function (a, b) { return priceNumber(a.price) - priceNumber(b.price); });
    }
    return sorted;
  }

  function priceNumber(price) {
    var match = price.match(/\d+/);
    return match ? Number(match[0]) : 999999;
  }

  function renderCategoryProducts() {
    var target = document.querySelector("[data-category-products]");
    if (!target) return;
    var search = (document.querySelector("[data-product-search]")?.value || "").toLowerCase();
    var sort = document.querySelector("[data-product-sort]")?.value || "featured";
    var filtered = currentCategoryProducts().filter(function (product) {
      return product.name.toLowerCase().indexOf(search) !== -1;
    });
    filtered = sortProducts(filtered, sort);
    target.innerHTML = "";
    filtered.slice(0, visibleCount).forEach(function (product) {
      target.appendChild(productCard(product));
    });
    var loadMore = document.querySelector("[data-load-more]");
    if (loadMore) loadMore.hidden = visibleCount >= filtered.length;
    setupReveal();
  }

  function openModal(productId) {
    if (!modal) return;
    activeProduct = products.find(function (product) { return product.id === productId; });
    activeQuantity = 1;
    if (!activeProduct) return;

    document.querySelector("[data-modal-title]").textContent = activeProduct.name;
    document.querySelector("[data-modal-description]").textContent = activeProduct.description;
    document.querySelector("[data-modal-price]").textContent = activeProduct.price;
    document.querySelector("[data-modal-weights]").textContent = activeProduct.weights.join(", ");
    document.querySelector("[data-modal-features]").textContent = "Eggless, Made To Order, Freshly Baked";
    document.querySelector("[data-modal-time]").textContent = activeProduct.preparation;
    document.querySelector("[data-modal-servings]").textContent = activeProduct.servings;
    document.querySelector("[data-modal-occasion]").textContent = activeProduct.occasion;
    document.querySelector("[data-modal-best-for]").textContent = activeProduct.bestFor;
    document.querySelector("[data-modal-quantity]").textContent = activeQuantity;

    var modalImage = document.querySelector("[data-modal-image]");
    modalImage.setAttribute("aria-label", activeProduct.name);
    modalImage.style.backgroundImage = 'url("' + imageUrl(productImagePath(activeProduct)) + '")';
    modalImage.style.backgroundSize = "cover";
    modalImage.style.backgroundPosition = "center";

    var field = document.querySelector("[data-weight-field]");
    var fixed = document.querySelector("[data-fixed-weight]");
    var weightSelect = document.querySelector("[data-modal-weight]");
    weightSelect.innerHTML = "";
    activeProduct.weights.forEach(function (weight) {
      var option = document.createElement("option");
      option.value = weight;
      option.textContent = weight;
      weightSelect.appendChild(option);
    });
    if (activeProduct.weights.length === 1) {
      field.hidden = true;
      fixed.hidden = false;
      fixed.innerHTML = "Available Size<br>" + activeProduct.weights[0];
    } else {
      field.hidden = false;
      fixed.hidden = true;
    }

    document.querySelector("[data-customize-cake]").href = whatsappUrl(customizeMessage(activeProduct, activeProduct.weights[0]));
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function selectedWeight() {
    if (!activeProduct) return "";
    if (activeProduct.weights.length === 1) return activeProduct.weights[0];
    return document.querySelector("[data-modal-weight]").value;
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!cartDrawer?.classList.contains("open")) document.body.classList.remove("no-scroll");
  }

  function addToCart() {
    var weight = selectedWeight();
    var existing = cart.find(function (item) {
      return item.product.id === activeProduct.id && item.weight === weight;
    });
    if (existing) existing.quantity += activeQuantity;
    else cart.push({ product: activeProduct, weight: weight, quantity: activeQuantity });
    renderCart();
    closeModal();
    openCart();
  }

  function cartCount() {
    return cart.reduce(function (total, item) { return total + item.quantity; }, 0);
  }

  function renderCart() {
    if (!cartButton) return;
    var count = cartCount();
    var cartItems = document.querySelector("[data-cart-items]");
    var empty = document.querySelector("[data-cart-empty]");
    cartButton.hidden = count === 0;
    cartButton.textContent = "Your Order (" + count + ")";
    empty.hidden = count > 0;
    cartItems.innerHTML = "";
    cart.forEach(function (item, index) {
      var node = document.createElement("article");
      node.className = "cart-item";
      node.innerHTML =
        "<h3>" + item.product.name + "</h3><p>Weight: " + item.weight + "</p>" +
        '<div class="cart-actions"><div class="quantity-control"><button type="button" data-cart-minus="' +
        index +
        '">-</button><span>' +
        item.quantity +
        '</span><button type="button" data-cart-plus="' +
        index +
        '">+</button></div><button class="remove-item" type="button" data-cart-remove="' +
        index +
        '">Remove Item</button></div>';
      cartItems.appendChild(node);
    });
    document.querySelector("[data-send-order]").href = whatsappUrl(buildOrderMessage());
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    if (!modal?.classList.contains("open")) document.body.classList.remove("no-scroll");
  }

  function buildOrderMessage() {
    if (!cart.length) {
      return "Hello The Baking Studio,\n\nI'd like to place an order.\n\nPlease share today's cake options.\n\nThank you.";
    }
    var lines = ["Hello The Baking Studio,", "", "I'd like to place the following order.", ""];
    cart.forEach(function (item, index) {
      lines.push(String(index + 1) + ".");
      lines.push("Cake Name: " + item.product.name);
      lines.push("Weight: " + item.weight);
      lines.push("Quantity: " + item.quantity);
      lines.push("");
    });
    lines.push("Please let me know the final price and the earliest available pickup or delivery slot.");
    lines.push("");
    lines.push("Thank you.");
    return lines.join("\n");
  }

  function setupLinks() {
    document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
      link.href = whatsappUrl("Hello The Baking Studio,\n\nI'd like to place an order.\n\nPlease share today's cake options.\n\nThank you.");
    });
    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });
  }

  function setupReveal() {
    var elements = document.querySelectorAll(".reveal:not(.visible)");
    if (!elements.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function bindEvents() {
    if (header) {
      window.addEventListener("scroll", function () {
        header.classList.toggle("scrolled", window.scrollY > 24);
      });
    }
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var isOpen = header.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }
    if (nav) {
      nav.addEventListener("click", function () {
        header.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
      });
    }

    document.addEventListener("click", function (event) {
      var productButton = event.target.closest("[data-view-product]");
      if (productButton) openModal(productButton.dataset.viewProduct);

      var minus = event.target.closest("[data-qty-minus]");
      var plus = event.target.closest("[data-qty-plus]");
      if (minus) activeQuantity = Math.max(1, activeQuantity - 1);
      if (plus) activeQuantity += 1;
      if (minus || plus) document.querySelector("[data-modal-quantity]").textContent = activeQuantity;

      var cartMinus = event.target.closest("[data-cart-minus]");
      var cartPlus = event.target.closest("[data-cart-plus]");
      var cartRemove = event.target.closest("[data-cart-remove]");
      if (cartMinus) {
        cart[Number(cartMinus.dataset.cartMinus)].quantity = Math.max(1, cart[Number(cartMinus.dataset.cartMinus)].quantity - 1);
        renderCart();
      }
      if (cartPlus) {
        cart[Number(cartPlus.dataset.cartPlus)].quantity += 1;
        renderCart();
      }
      if (cartRemove) {
        cart.splice(Number(cartRemove.dataset.cartRemove), 1);
        renderCart();
        if (!cart.length) closeCart();
      }
    });

    document.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);
    document.querySelector("[data-add-order]")?.addEventListener("click", addToCart);
    document.querySelector("[data-modal-weight]")?.addEventListener("change", function (event) {
      document.querySelector("[data-customize-cake]").href = whatsappUrl(customizeMessage(activeProduct, event.target.value));
    });
    document.querySelector("[data-close-cart]")?.addEventListener("click", closeCart);
    cartButton?.addEventListener("click", openCart);
    document.querySelector("[data-load-more]")?.addEventListener("click", function () {
      visibleCount += 6;
      renderCategoryProducts();
    });
    document.querySelector("[data-product-search]")?.addEventListener("input", function () {
      visibleCount = 9;
      renderCategoryProducts();
    });
    document.querySelector("[data-product-sort]")?.addEventListener("change", function () {
      visibleCount = 9;
      renderCategoryProducts();
    });
    modal?.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    cartDrawer?.addEventListener("click", function (event) {
      if (event.target === cartDrawer) closeCart();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal();
        closeCart();
      }
    });
  }

  renderFeatured();
  renderBestSellers();
  renderCollections();
  renderCategoryProducts();
  setupLinks();
  bindEvents();
  setupReveal();
  renderCart();
})();
