export default function initIosFallback() {
  // Create the <model-viewer> element
  const mv = document.createElement('model-viewer');

  // Point it at your GLB (for Android fallback) and USDZ (for iOS Quick Look)
  mv.src = 'assets/models/tile-plane.glb';
  mv.iosSrc = 'assets/models/tile-plane.usdz';

  // Enable AR modes (Scene Viewer for Android, Quick Look for iOS)
  mv.setAttribute('ar', '');
  mv.setAttribute('ar-modes', 'scene-viewer quick-look');
  mv.setAttribute('ar-placement', 'floor wall');
  mv.setAttribute('reveal', 'interaction');

  // Make <model-viewer> fill the entire viewport
  mv.style.position = 'absolute';
  mv.style.top = '0';
  mv.style.left = '0';
  mv.style.width = '100vw';
  mv.style.height = '100vh';
  mv.style.margin = '0';
  mv.style.padding = '0';

  // Append to <body>, so Safari will show the Quick Look button
  document.body.appendChild(mv);
}
