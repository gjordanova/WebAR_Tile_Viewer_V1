import initAndroidAR from './ar-android.js';
import initIosFallback from './ar-ios-fallback.js';

async function boot() {
  const btn = document.getElementById('enter-ar-btn');

  // 1) Check for WebXR AR support
  let hasWebXR = false;
  if (navigator.xr && navigator.xr.isSessionSupported) {
    try {
      hasWebXR = await navigator.xr.isSessionSupported('immersive-ar');
    } catch (e) {
      hasWebXR = false;
    }
  }

  // 2) Show the button & wire up the correct handler
  if (hasWebXR) {
    btn.innerText = 'Enter AR';
    btn.style.display = 'block';
    btn.addEventListener('click', () => {
      btn.style.display = 'none'; // hide the button
      initAndroidAR();
    });
  } else {
    btn.innerText = 'Place in AR';
    btn.style.display = 'block';
    btn.addEventListener('click', () => {
      btn.style.display = 'none';
      initIosFallback();
    });
  }
}

// Boot only after everything is parsed & model-viewer is loaded
window.addEventListener('load', boot);
