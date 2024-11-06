const SOUTH = 2;
const LEAP = 240;

let isPlanting = false;
let treeStages = [];
let growthSpeed = 1; 
let growthStage = 0; 

var camera,
  scene,
  controls,
  renderer,
  stats,
  loader,
  pmremGenerator,
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster(),
  carList = [],
  manager = new THREE.LoadingManager(),
  loader = new THREE.GLTFLoader(manager),
  isPlaying = true;

var directionalLight, hemisphereLight; 
let isDay = true;

var clusterNames = [
  'factory',
  'house2',
  'shoparea',
  'house',
  'apartments',
  'shops',
  'fastfood',
  'house3',
  'stadium',
  'gas',
  'supermarket',
  'coffeeshop',
  'residence',
  'bus',
  'park',
  'supermarket',
];

const cluster = [
  { x: 1, z: 0, cluster: 'road' },

  { x: 2, z: 2, cluster: clusterNames[0], direction: SOUTH },
  { x: 2, z: 1, cluster: clusterNames[1], direction: SOUTH },
  { x: 2, z: 0, cluster: clusterNames[2], direction: SOUTH },
  { x: 2, z: -1, cluster: clusterNames[3], direction: SOUTH },
  { x: 2, z: -2, cluster: clusterNames[0], direction: SOUTH },
  { x: 2, z: -3, cluster: clusterNames[1], direction: SOUTH },
  { x: 2, z: -4, cluster: clusterNames[2], direction: SOUTH },
  { x: 2, z: -5, cluster: clusterNames[3], direction: SOUTH },

  { x: 1, z: 2, cluster: clusterNames[4], direction: SOUTH },
  { x: 1, z: 1, cluster: clusterNames[7], direction: SOUTH },
  { x: 1, z: 0, cluster: clusterNames[8], direction: SOUTH },
  { x: 1, z: -1, cluster: clusterNames[9], direction: SOUTH },
  { x: 1, z: -2, cluster: clusterNames[4], direction: SOUTH },
  { x: 1, z: -3, cluster: clusterNames[7], direction: SOUTH },
  { x: 1, z: -4, cluster: clusterNames[8], direction: SOUTH },
  { x: 1, z: -5, cluster: clusterNames[9], direction: SOUTH },

  { x: 0, z: 2, cluster: clusterNames[5], direction: SOUTH },
  { x: 0, z: 1, cluster: clusterNames[10], direction: SOUTH },
  { x: 0, z: 0, cluster: clusterNames[12], direction: SOUTH },
  { x: 0, z: -1, cluster: clusterNames[13], direction: SOUTH },
  { x: 0, z: -2, cluster: clusterNames[5], direction: SOUTH },
  { x: 0, z: -3, cluster: clusterNames[10], direction: SOUTH },
  { x: 0, z: -4, cluster: clusterNames[12], direction: SOUTH },
  { x: 0, z: -5, cluster: clusterNames[13], direction: SOUTH },

  { x: -1, z: 2, cluster: clusterNames[6], direction: SOUTH },
  { x: -1, z: 1, cluster: clusterNames[11], direction: SOUTH },
  { x: -1, z: 0, cluster: clusterNames[14], direction: SOUTH },
  { x: -1, z: -1, cluster: clusterNames[15], direction: SOUTH },
  { x: -1, z: -2, cluster: clusterNames[6], direction: SOUTH },
  { x: -1, z: -3, cluster: clusterNames[11], direction: SOUTH },
  { x: -1, z: -4, cluster: clusterNames[14], direction: SOUTH },
  { x: -1, z: -5, cluster: clusterNames[15], direction: SOUTH },

  { x: -2, z: 2, cluster: clusterNames[0], direction: SOUTH },
  { x: -2, z: 1, cluster: clusterNames[1], direction: SOUTH },
  { x: -2, z: 0, cluster: clusterNames[2], direction: SOUTH },
  { x: -2, z: -1, cluster: clusterNames[3], direction: SOUTH },
  { x: -2, z: -2, cluster: clusterNames[0], direction: SOUTH },
  { x: -2, z: -3, cluster: clusterNames[1], direction: SOUTH },
  { x: -2, z: -4, cluster: clusterNames[2], direction: SOUTH },
  { x: -2, z: -5, cluster: clusterNames[3], direction: SOUTH },

  { x: -3, z: 2, cluster: clusterNames[4], direction: SOUTH },
  { x: -3, z: 1, cluster: clusterNames[7], direction: SOUTH },
  { x: -3, z: 0, cluster: clusterNames[8], direction: SOUTH },
  { x: -3, z: -1, cluster: clusterNames[9], direction: SOUTH },
  { x: -3, z: -2, cluster: clusterNames[4], direction: SOUTH },
  { x: -3, z: -3, cluster: clusterNames[7], direction: SOUTH },
  { x: -3, z: -4, cluster: clusterNames[8], direction: SOUTH },
  { x: -3, z: -5, cluster: clusterNames[9], direction: SOUTH },

  { x: -4, z: 2, cluster: clusterNames[5], direction: SOUTH },
  { x: -4, z: 1, cluster: clusterNames[10], direction: SOUTH },
  { x: -4, z: 0, cluster: clusterNames[12], direction: SOUTH },
  { x: -4, z: -1, cluster: clusterNames[13], direction: SOUTH },
  { x: -4, z: -2, cluster: clusterNames[5], direction: SOUTH },
  { x: -4, z: -3, cluster: clusterNames[10], direction: SOUTH },
  { x: -4, z: -4, cluster: clusterNames[12], direction: SOUTH },
  { x: -4, z: -5, cluster: clusterNames[13], direction: SOUTH },

  { x: -5, z: 2, cluster: clusterNames[6], direction: SOUTH },
  { x: -5, z: 1, cluster: clusterNames[11], direction: SOUTH },
  { x: -5, z: 0, cluster: clusterNames[14], direction: SOUTH },
  { x: -5, z: -1, cluster: clusterNames[15], direction: SOUTH },
  { x: -5, z: -2, cluster: clusterNames[6], direction: SOUTH },
  { x: -5, z: -3, cluster: clusterNames[11], direction: SOUTH },
  { x: -5, z: -4, cluster: clusterNames[14], direction: SOUTH },
  { x: -5, z: -5, cluster: clusterNames[8], direction: SOUTH },
];

const loadTreeStages = () => {
  const loader = new THREE.GLTFLoader();
  const treeStageFiles = ['tree1.glb'];

  loader.load(`/gltf/${treeStageFiles[0]}`, (gltf) => {
    treeStages[0] = gltf.scene;
    console.log("Full-grown tree loaded:", gltf.scene); // Log the loaded model
  });
};

loadTreeStages();

function main() {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas });

  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(80, 140, 80);
  camera.lookAt(new THREE.Vector3());
  camera.position.y = 200;

  controls = new THREE.MapControls(camera, canvas);
  controls.autoRotate = false;
  controls.autoRotateSpeed = -10;
  controls.screenSpacePanning = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFDAB9'); // Warna PeachPuff

  document.getElementById('seed-button').addEventListener('click', () => {
    isPlanting = true;
    alert("Click on the ground to plant your tree!");
  });

  document.getElementById('growth-slider').addEventListener('input', (event) => {
    growthSpeed = parseInt(event.target.value);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onDocumentMouseDown(event) {
    if (!isPlanting || treeStages.length === 0) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log("Intersections:", intersects); // Log intersections

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const fullGrownTree = treeStages[0].clone();
      fullGrownTree.position.copy(intersect.point);
      scene.add(fullGrownTree);
      isPlanting = false;
      console.log("Tree added at:", intersect.point); // Log tree placement
    } else {
      console.log("No intersections detected"); // Log if no intersections found
    }
  }

  document.addEventListener('mousedown', onDocumentMouseDown, false);

  renderer.shadowMap.enabled = true;
  renderer.gammaInput = renderer.gammaOutput = true;
  renderer.gammaFactor = 2.0;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xcccccc);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Inisialisasi pencahayaan
    directionalLight = new THREE.DirectionalLight(0xfffacd, 1.5); // Warna LemonChiffon
    directionalLight.position.set(-300, 750, -300);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.right = directionalLight.shadow.camera.top = 200;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    hemisphereLight = new THREE.HemisphereLight(0xefefef, 0xffffff, 1);
    scene.add(hemisphereLight);
  }

  const gltfLoader = new THREE.GLTFLoader();

  cluster.forEach((cl) => loadClusters(cl));

  loadCars({ x: 1, z: 0, cluster: 'cars' });

  function render() {
    if (!isPlaying) {
      return;
    }
    controls.update();

    if (camera.position.x > 130) {
      controls.target.x -= LEAP;
      camera.position.x -= LEAP;
      carList.forEach((car) => (car.position.x -= LEAP));
    } else if (camera.position.x < -120) {
      controls.target.x += LEAP;
      camera.position.x += LEAP;
      carList.forEach((car) => (car.position.x += LEAP));
    }
    if (camera.position.z > 130) {
      controls.target.z -= LEAP;
      camera.position.z -= LEAP;
      carList.forEach((car) => (car.position.z -= LEAP));
    } else if (camera.position.z < -120) {
      controls.target.z += LEAP;
      camera.position.z += LEAP;
      carList.forEach((car) => (car.position.z += LEAP));
    }

    raycaster.setFromCamera(mouse, camera);

    carList.forEach((car) => {
      car.r.set(
        new THREE.Vector3(car.position.x + 58, 1, car.position.z),
        new THREE.Vector3(car.userData.x, 0, car.userData.z)
      );
      let _NT = car.r.intersectObjects(carList, true);
      if (_NT.length > 0) {
        car.speed = 0;
        return;
      } else {
        car.speed = car.speed < car.maxSpeed ? car.speed + 0.002 : car.speed;

        if (car.position.x < -380) car.position.x += LEAP * 2;
        else if (car.position.x > 100) car.position.x -= LEAP * 2;
        if (car.position.z < -320) car.position.x += LEAP * 2;
        else if (car.position.z > 160) car.position.x -= LEAP * 2;

        car.position.x += car.userData.x * car.speed;
        car.position.z += car.userData.z * car.speed;
      }
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  function loadClusters({ x, z, cluster, direction }) {
    gltfLoader.load(`/gltf/${cluster}.gltf`, (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      controls.maxDistance = boxSize * 5;
      camera.position.copy(boxCenter);
      camera.position.x += boxSize / 8.0;
      camera.position.y += boxSize / 10.0;
      camera.position.z += boxSize / 5.0;
      camera.lookAt(boxCenter);
      camera.near = boxSize / 100;
      camera.far = boxSize * 200;
      camera.updateProjectionMatrix();
      scene.add(camera);

      controls.target.copy(boxCenter);
      controls.update();

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
          child.material.depthWrite = !child.material.transparent;
        }
      });

      gltf.scene.position.set(x * 60, 0, z * 60);
      if (direction) gltf.scene.rotation.y = Math.PI * direction;

      scene.add(gltf.scene);
    });
  }
  requestAnimationFrame(render);

  {
    document
      .getElementById('about-button')
      .addEventListener('click', function (e) {
        isPlaying = !isPlaying;
        if (isPlaying) {
          requestAnimationFrame(render);
        }
        document.getElementById('about').classList.toggle('visible');
        document.getElementById('c').classList.toggle('blur');
      });
  }
}

main();

// event listener untuk tombol toggle siang/malam
document.getElementById('day-night-toggle').addEventListener('click', switchDayNight);

// Events
window.addEventListener('resize', onResize, false);
window.addEventListener('mousemove', onMouseMove, false);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function switchDayNight() {
  isDay = !isDay;

  if (isDay) {
    // Mode Siang
    scene.background = new THREE.Color('#FFDAB9'); // Warna PeachPuff
    directionalLight.intensity = 1.5;
    hemisphereLight.intensity = 1;
    directionalLight.color.set(0xfffacd); // Warna LemonChiffon
    hemisphereLight.color.set(0xefefef);
    hemisphereLight.groundColor.set(0xffffff);

    // Ubah ikon tombol menjadi 'night' karena mode saat ini adalah siang
    document.getElementById('day-night-toggle').style.backgroundImage = "url('./assets/night.png')";
  } else {
    // Mode Malam
    scene.background = new THREE.Color('#000033'); // Warna Biru Tua
    directionalLight.intensity = 0.2; // Intensitas lebih rendah
    hemisphereLight.intensity = 0.3; // Intensitas lebih rendah
    directionalLight.color.set(0x666699); // Warna lebih redup
    hemisphereLight.color.set(0x333366);
    hemisphereLight.groundColor.set(0x000000);

    // Ubah ikon tombol menjadi 'day' karena mode saat ini adalah malam
    document.getElementById('day-night-toggle').style.backgroundImage = "url('./assets/day.png')";
  }
}


function loadCars({ x, z, cluster, direction }) {
  loader.load(`/gltf/${cluster}.gltf`, (gltf) => {
    controls.update();

    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        child.material.depthWrite = !child.material.transparent;
      }
    });

    gltf.scene.position.set(x * 60, 0, z * 60);
    if (direction) gltf.scene.rotation.y = Math.PI * direction;

    scene.add(gltf.scene);

    gltf.scene.children.forEach((e) => {
      e.distance = 0;
      e.maxSpeed = 0.3;
      e.speed = e.maxSpeed;
      e.r = new THREE.Raycaster(
        new THREE.Vector3(e.position.x, 2, e.position.z),
        new THREE.Vector3(e.userData.x, 0, e.userData.z),
        5,
        15
      );
      carList.push(e);
    });
  });
}