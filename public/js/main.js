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
});
