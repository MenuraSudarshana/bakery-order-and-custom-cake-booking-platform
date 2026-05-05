'use strict';



/**
 * PRELOAD
 * 
 * loading will be end after document is loaded
 */

const preloader = document.querySelector("[data-preaload]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * NAVBAR
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER & BACK TOP BTN
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const hideHeader = function () {
  const isScrollBottom = lastScrollPos < window.scrollY;
  if (isScrollBottom) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
}

window.addEventListener("scroll", function () {
  if (window.scrollY >= 50) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
    hideHeader();
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



/**
 * HERO SLIDER
 */

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");

let currentSlidePos = 0;
let lastActiveSliderItem = heroSliderItems[0];

const updateSliderPos = function () {
  lastActiveSliderItem.classList.remove("active");
  heroSliderItems[currentSlidePos].classList.add("active");
  lastActiveSliderItem = heroSliderItems[currentSlidePos];
}

const slideNext = function () {
  if (currentSlidePos >= heroSliderItems.length - 1) {
    currentSlidePos = 0;
  } else {
    currentSlidePos++;
  }

  updateSliderPos();
}

heroSliderNextBtn.addEventListener("click", slideNext);

const slidePrev = function () {
  if (currentSlidePos <= 0) {
    currentSlidePos = heroSliderItems.length - 1;
  } else {
    currentSlidePos--;
  }

  updateSliderPos();
}

heroSliderPrevBtn.addEventListener("click", slidePrev);

/**
 * auto slide
 */

let autoSlideInterval;

const autoSlide = function () {
  autoSlideInterval = setInterval(function () {
    slideNext();
  }, 7000);
}

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseover", function () {
  clearInterval(autoSlideInterval);
});

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseout", autoSlide);

window.addEventListener("load", autoSlide);



/**
 * PARALLAX EFFECT
 */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

let x, y;

window.addEventListener("mousemove", function (event) {

  x = (event.clientX / window.innerWidth * 10) - 5;
  y = (event.clientY / window.innerHeight * 10) - 5;

  // reverse the number eg. 20 -> -20, -5 -> 5
  x = x - (x * 2);
  y = y - (y * 2);

  for (let i = 0, len = parallaxItems.length; i < len; i++) {
    x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
    y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
    parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }

});



/**
 * HOME CAKE CAROUSEL
 */

const homeCakeCarousel = document.querySelector("[data-home-cake-carousel]");

if (homeCakeCarousel) {
  const homeCakeTrack = homeCakeCarousel.querySelector("[data-cake-track]");
  const homeCakePrevBtn = homeCakeCarousel.querySelector("[data-cake-prev]");
  const homeCakeNextBtn = homeCakeCarousel.querySelector("[data-cake-next]");

  const homeCakeItems = [
    {
      id: 2,
      name: "Black Forest Gateuax",
      price: "Rs. 5,000.00",
      rating: "4.8 / 5",
      category: "Classic Gateau",
      image: "../../../../../frontend/assets/images/Black-forest-Gateau.png"
    },
    {
      id: 3,
      name: "Red Velvet Cake",
      price: "Rs. 4,000.00",
      rating: "4.7 / 5",
      category: "Velvet Cake",
      image: "../../../../../frontend/assets/images/Red Velvet Cake 2.png"
    },
    {
      id: 4,
      name: "Blueberry Baked Cheesecake",
      price: "Rs. 5,500.00",
      rating: "4.9 / 5",
      category: "Cheesecake",
      image: "../../../../../frontend/assets/images/Blueberry Baked Cheesecake.png"
    },
    {
      id: 5,
      name: "Chocalate Cake",
      price: "Rs. 4,500.00",
      rating: "4.8 / 5",
      category: "Chocolate Cake",
      image: "../../../../../frontend/assets/images/Coffee-Chocolate-Gateau.png"
    },
    {
      id: 1,
      name: "Orange White Choco-Chip Gateau",
      price: "Rs. 2,000.00",
      rating: "4.8 / 5",
      category: "Signature Cake",
      image: "../../../../../frontend/assets/images/product-1.png"
    },
    {
      id: 6,
      name: "Marble Gateau",
      price: "Rs. 3,200.00",
      rating: "4.6 / 5",
      category: "Gateau",
      image: "../../../../../frontend/assets/images/Marble Gateau.png"
    }
  ];

  let homeCakeIndex = 0;
  let homeCakeAutoSlideId;

  const getHomeCakeVisibleCards = function () {
    if (window.innerWidth >= 1200) {
      return 3;
    }

    if (window.innerWidth >= 768) {
      return 2;
    }

    return 1;
  }

  const renderHomeCakeCards = function () {
    homeCakeTrack.innerHTML = homeCakeItems.map(function (item) {
      return `
        <article class="home-cake-card">
          <figure class="home-cake-card-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </figure>

          <div class="home-cake-card-body">
            <h3 class="title-2 home-cake-card-title">
              <a href="product.html?id=${item.id}" class="home-cake-card-title-link">${item.name}</a>
            </h3>

            <div class="home-cake-card-meta">
              <span class="home-cake-card-price">${item.price}</span>
              <span class="home-cake-card-rating">${item.rating}</span>
            </div>

            <p class="body-4 home-cake-card-category">${item.category}</p>

            <a href="product.html?id=${item.id}" class="home-cake-card-link">Add To Cart</a>
          </div>
        </article>
      `;
    }).join("");
  }

  const updateHomeCakeCarousel = function () {
    const homeCakeCards = homeCakeTrack.querySelectorAll(".home-cake-card");

    if (!homeCakeCards.length) {
      return;
    }

    const visibleCards = getHomeCakeVisibleCards();
    const maxIndex = Math.max(0, homeCakeCards.length - visibleCards);
    homeCakeIndex = Math.min(homeCakeIndex, maxIndex);

    const cardWidth = homeCakeCards[0].getBoundingClientRect().width;
    const gap = Number.parseFloat(window.getComputedStyle(homeCakeTrack).gap) || 0;
    const offset = homeCakeIndex * (cardWidth + gap);

    homeCakeTrack.style.transform = `translateX(-${offset}px)`;
  }

  const moveHomeCakeCarousel = function (direction) {
    const visibleCards = getHomeCakeVisibleCards();
    const maxIndex = Math.max(0, homeCakeItems.length - visibleCards);

    if (direction === "next") {
      homeCakeIndex = homeCakeIndex >= maxIndex ? 0 : homeCakeIndex + 1;
    } else {
      homeCakeIndex = homeCakeIndex <= 0 ? maxIndex : homeCakeIndex - 1;
    }

    updateHomeCakeCarousel();
  }

  const startHomeCakeAutoSlide = function () {
    window.clearInterval(homeCakeAutoSlideId);
    homeCakeAutoSlideId = window.setInterval(function () {
      moveHomeCakeCarousel("next");
    }, 5000);
  }

  renderHomeCakeCards();
  updateHomeCakeCarousel();
  startHomeCakeAutoSlide();

  homeCakePrevBtn.addEventListener("click", function () {
    moveHomeCakeCarousel("prev");
    startHomeCakeAutoSlide();
  });

  homeCakeNextBtn.addEventListener("click", function () {
    moveHomeCakeCarousel("next");
    startHomeCakeAutoSlide();
  });

  homeCakeCarousel.addEventListener("mouseenter", function () {
    window.clearInterval(homeCakeAutoSlideId);
  });

  homeCakeCarousel.addEventListener("mouseleave", startHomeCakeAutoSlide);
  window.addEventListener("resize", updateHomeCakeCarousel);
}

// Login

document.addEventListener("DOMContentLoaded", function () {

  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const closeLogin = document.getElementById("closeLogin");

  const navbar = document.querySelector("[data-navbar]");
  const overlay = document.querySelector("[data-overlay]");

  // open modal
  if (loginBtn) {
    loginBtn.addEventListener("click", function(e) {
      e.preventDefault();

      // close navbar (IMPORTANT for your template)
      navbar.classList.remove("active");
      overlay.classList.remove("active");

      loginModal.classList.add("active");
    });
  }

  // close modal (X button)
  if (closeLogin) {
    closeLogin.addEventListener("click", function() {
      loginModal.classList.remove("active");
    });
  }

  // close when clicking outside
  window.addEventListener("click", function(e) {
    if (e.target === loginModal) {
      loginModal.classList.remove("active");
    }
  });

  const showPassword = document.getElementById("showPassword");
  const passwordInput = document.getElementById("password");

  showPassword.addEventListener("change", function () {
    if (this.checked) {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  });

});


document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("loginForm");

  if (!form) {
    console.log("Form not found ❌");
    return;
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loader = document.getElementById("loader");
    const toast = document.getElementById("toast");
    const welcomeBox = document.getElementById("welcomeBox");
    const welcomeText = document.getElementById("welcomeText");

    console.log("Sending:", username, password);

    // SHOW LOADER
    loader.style.display = "flex";

    fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(response => {

      console.log("Response:", response);

      setTimeout(() => {
        loader.style.display = "none";

        if (response === "SUCCESS") {

          document.getElementById("loginModal").classList.remove("active");

          // CLEAR FORM 🔥
          document.getElementById("loginForm").reset();

          toast.innerText = "Login Successful!";
          toast.classList.add("show");


          setTimeout(() => {
            toast.classList.remove("show");
          }, 2000);

          welcomeText.innerText = "Welcome " + username;
          localStorage.setItem("user", username);

          setTimeout(() => {
            welcomeBox.style.display = "none";
            window.open("admin.html", "_blank");
          }, 1000);

        } else {

          toast.innerText = "Invalid username or password!";
          toast.classList.add("show");

          setTimeout(() => {
            toast.classList.remove("show");
          }, 3000);

          document.getElementById("loginForm").reset();

        }

      }, 3000);



    })
    .catch(err => {
      console.error("ERROR:", err);
    });

    document.getElementById("password").value = "";

  });

});

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("reservationForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // ❌ STOP REFRESH

    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const date = document.getElementById("date");
    const time = document.getElementById("time");
    const persons = document.getElementById("persons");
    const message = document.getElementById("message");

    let valid = true;

    // 🔄 RESET ERRORS
    document.querySelectorAll(".error-text").forEach(e => e.remove());
    document.querySelectorAll(".input-field").forEach(f => f.classList.remove("error"));
    [name, phone, date, time, persons].forEach(f => f.classList.remove("error"));

    // 🔴 NAME
    if (name.value.trim() === "") {
      showError(name, "Name is required");
      valid = false;
    }

    // 🔴 PHONE
    if (phone.value.trim() === "") {
      showError(phone, "Phone number is required");
      valid = false;
    } else if (!/^\d{10}$/.test(phone.value)) {
      showError(phone, "Enter exactly 10 digits (numbers only)");
      valid = false;
    }

    // 🔴 PERSONS
    if (persons.value === "" || persons.value === "default") {
      showError(persons, "Please select number of guests");
      valid = false;
    }

    // 🔴 DATE
    if (date.value === "") {
      showError(date, "Please select a date");
      valid = false;
    }

    // 🔴 TIME
    if (time.value === "" || time.value === "default") {
      showError(time, "Please select a time");
      valid = false;
    }

    // 🔴 STOP IF INVALID
    if (!valid) {
      showGlobalMessage("Please complete all required fields", "error");
      return;
    }

    // 🔥 PAST DATE CHECK
    const selectedDateTime = new Date(date.value + " " + time.value);
    if (selectedDateTime < new Date()) {
      showGlobalMessage("Cannot select past date/time", "error");
      return;
    }

    // 🔥 CONFIRM BOX
    const confirmMsg =
      `Confirm Reservation:\n\n` +
      `Name: ${name.value}\nPhone: ${phone.value}\nGuests: ${persons.value}\nDate: ${date.value}\nTime: ${time.value}`;

    if (!confirm(confirmMsg)) return;

    console.log({
      name: name.value,
      phone: phone.value,
      persons: persons.value,
      message: message.value
    });

    // 🚀 SEND TO BACKEND
    fetch("http://localhost:8080/api/reservations", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            name: name.value.trim(),
            phone: phone.value.trim(),

            // 🔥 FORCE NUMBER
            persons: Number(persons.value),

            reservationDate: date.value,
            reservationTime: time.value,

            // 🔥 FORCE STRING (never null)
            message: message.value ? message.value.trim() : ""
          })
    })
    .then(res => res.text())
    .then(response => {

      if (response === "FULL") {
        showGlobalMessage("All tables are booked for this time. Call 0812376718", "error");
      }

      else if (response === "DUPLICATE") {
        if (confirm("You already booked this time. Book again?")) {
          showGlobalMessage("Reservation added again!", "success");
        }
      }

      else if (response === "SUCCESS") {
        showGlobalMessage("Reservation successful! Our team will contact you.", "success");
        form.reset();
      }

    })
    .catch(err => {
      console.error(err);
      showGlobalMessage("Server error! Try again.", "error");
    });

  });

  // 🔥 SHOW ERROR ABOVE FIELD
  function showError(field, message) {
    field.classList.add("error");

    // remove existing error
    const existing = field.parentNode.querySelector(".error-text");
    if (existing) existing.remove();

    const error = document.createElement("div");
    error.className = "error-text";
    error.innerText = message;

    // 🔥 FIX POSITION (always above correct field)
    field.parentNode.insertBefore(error, field);
  }

  // 🔥 GLOBAL MESSAGE BOX
  function showGlobalMessage(msg, type) {
    const box = document.createElement("div");
    box.className = "global-msg " + type;
    box.innerText = msg;

    document.body.appendChild(box);

    setTimeout(() => box.remove(), 3000);
  }

});

function showError(field, message) {
  field.classList.add("error");

  let errorText = field.nextElementSibling;

  if (!errorText || !errorText.classList.contains("error-text")) {
    errorText = document.createElement("small");
    errorText.className = "error-text";
    field.parentNode.appendChild(errorText);
  }

  errorText.innerText = message;
}
