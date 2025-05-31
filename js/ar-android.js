import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

export default async function initAndroidAR() {
  // === 1) Basic Three.js Setup ===
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // enable WebXR on the renderer
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  scene.add(camera);

  // A simple HemisphereLight so that our textured planes are visible
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(hemiLight);

  // === 2) Load the Tile Texture ===
  const loader = new THREE.TextureLoader();
  const tileTexture = loader.load('assets/textures/tile.jpg', () => {
    tileTexture.wrapS = tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(10, 10); // adjust as needed for how many tiles per plane
  });

  // Keep track of plane meshes we’ve created (Map from XRPlane → THREE.Mesh)
  const planeMeshes = new Map();

  // === 3) Start the AR Session with Plane Detection ===
  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test', 'plane-detection']
  });
  renderer.xr.setSession(session);

  // We need a reference space to update poses later
  const referenceSpace = await renderer.xr.getReferenceSpace();

  // === 4) Render loop: update detected planes each frame ===
  renderer.setAnimationLoop((time, frame) => {
    // frame.worldInformation.detectedPlanes is a Set<XRPlane>
    const detectedPlanes = frame.worldInformation.detectedPlanes;
    if (detectedPlanes) {
      detectedPlanes.forEach(xrPlane => {
        let mesh = planeMeshes.get(xrPlane);

        if (!mesh) {
          // Build a simple BufferGeometry from the XRPlane’s polygon (flat quad)
          const polygon = xrPlane.polygon; // a flat Float32Array [x0, y0, z0, x1, y1, z1, ...]
          const verts = [];
          for (let i = 0; i < polygon.length; i += 3) {
            verts.push(polygon[i], polygon[i + 1], polygon[i + 2]);
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
          geometry.computeVertexNormals();

          const material = new THREE.MeshStandardMaterial({
            map: tileTexture,
            side: THREE.DoubleSide
          });

          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          planeMeshes.set(xrPlane, mesh);
        }

        // Update the mesh’s world position/orientation each frame
        const pose = frame.getPose(xrPlane.planeSpace, referenceSpace);
        if (pose) {
          mesh.position.copy(pose.transform.position);
          mesh.quaternion.copy(pose.transform.orientation);
        }
      });
    }

    renderer.render(scene, camera);
  });
}
