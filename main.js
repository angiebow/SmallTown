import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, raycaster, mouse;

function init() {
    console.log('Initializing scene...');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    console.log('Scene created.');

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    console.log('Camera created.');

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    console.log('Renderer created and added to DOM.');

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    console.log('Lighting added.');

    // Raycaster and Mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    console.log('Raycaster and mouse initialized.');

    // Load 3D Models
    const loader = new GLTFLoader();
    loader.load('path/to/your/model.glb', function (gltf) {
        scene.add(gltf.scene);
        console.log('Model loaded and added to scene.');
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);
    });

    // Add Basic Geometry for Testing
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    console.log('Test cube added to scene.');

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('click', onDocumentMouseClick, false);
    console.log('Event listeners added.');

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        console.log('Object clicked:', intersects[0].object);
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    console.log('Rendering scene...');
}

init();