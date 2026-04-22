// Initialize AOS animations
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    once: true,
    duration: 600,
    easing: 'ease-out-cubic'
  });

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar-glass');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Auto dismiss alerts after 5s
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }, 5000);
  });

  // Image upload preview
  var imageInput = document.getElementById('imageInput');
  var uploadZone = document.getElementById('uploadZone');
  var uploadPlaceholder = document.getElementById('uploadPlaceholder');
  var uploadPreview = document.getElementById('uploadPreview');
  var previewImg = document.getElementById('previewImg');
  var removeImage = document.getElementById('removeImage');

  if (imageInput && uploadZone) {
    // Click to upload
    uploadZone.addEventListener('click', function (e) {
      if (e.target === removeImage || removeImage.contains(e.target)) return;
      imageInput.click();
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        imageInput.files = e.dataTransfer.files;
        showPreview(e.dataTransfer.files[0]);
      }
    });

    // File selected
    imageInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        showPreview(this.files[0]);
      }
    });

    // Remove image
    if (removeImage) {
      removeImage.addEventListener('click', function (e) {
        e.stopPropagation();
        imageInput.value = '';
        uploadPlaceholder.classList.remove('d-none');
        uploadPreview.classList.add('d-none');
      });
    }

    function showPreview(file) {
      if (!file.type.match(/^image\//)) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        uploadPlaceholder.classList.add('d-none');
        uploadPreview.classList.remove('d-none');
      };
      reader.readAsDataURL(file);
    }
  }

  // Set min dates for ad form
  var startDateInput = document.querySelector('input[name="startDate"]');
  var endDateInput = document.querySelector('input[name="endDate"]');
  if (startDateInput && !startDateInput.value) {
    var today = new Date().toISOString().split('T')[0];
    startDateInput.setAttribute('min', today);
    startDateInput.addEventListener('change', function () {
      endDateInput.setAttribute('min', this.value);
    });
  }

  // ── Hero Search Bar: cascade state → city ────────────────────────────────
  document.querySelectorAll('.hero-search-bar').forEach(function (form) {
    var stateSelect = form.querySelector('.hsb-state-select');
    var citySelect  = form.querySelector('.hsb-city-select');
    if (!stateSelect || !citySelect) return;

    var allOptions = Array.from(citySelect.options).map(function (opt) {
      return { value: opt.value, text: opt.text, state: opt.dataset.state || '' };
    });

    function filterCities() {
      var selectedState = stateSelect.value;
      var currentCity = citySelect.value;
      citySelect.innerHTML = '<option value="">Select City</option>';
      allOptions.forEach(function (opt) {
        if (!opt.value) return;
        if (!selectedState || opt.state === selectedState) {
          var el = document.createElement('option');
          el.value = opt.value;
          el.textContent = opt.text;
          el.dataset.state = opt.state;
          if (opt.value === currentCity) el.selected = true;
          citySelect.appendChild(el);
        }
      });
    }

    stateSelect.addEventListener('change', filterCities);

    // On page load, if a city is pre-selected filter its state dropdown too
    if (citySelect.value) {
      var currentCity = citySelect.value;
      var preSelectedOpt = allOptions.find(function (o) { return o.value === citySelect.value; });
      if (preSelectedOpt && preSelectedOpt.state && !stateSelect.value) {
        stateSelect.value = preSelectedOpt.state;
        filterCities();
        citySelect.value = preSelectedOpt.value;
      } else if (stateSelect.value) {
        filterCities();
        citySelect.value = currentCity;
      }
    } else if (stateSelect.value) {
      filterCities();
    }

    // When city is chosen directly, sync state dropdown
    citySelect.addEventListener('change', function () {
      var chosen = allOptions.find(function (o) { return o.value === citySelect.value; });
      if (chosen && chosen.state && stateSelect.value !== chosen.state) {
        stateSelect.value = chosen.state;
        filterCities();
        citySelect.value = chosen.value;
      }
    });

    // If only city selected (no category), redirect to city page directly
    form.addEventListener('submit', function (e) {
      var cityVal = citySelect.value;
      var catVal  = (form.querySelector('.hsb-category-select') || {}).value || '';
      var stateVal = stateSelect.value;
      if (cityVal && !catVal && !stateVal) {
        e.preventDefault();
        window.location.href = '/escorts-service/' + cityVal + '/';
      }
    });
  });
});
