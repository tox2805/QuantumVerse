window.onload = function () {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    document.body.appendChild(renderer.domElement);

    // Enable OrbitControls for rotation
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.enablePan = false;           // Disables panning completely
    controls.maxPolarAngle = Math.PI; // Full vertical rotation (no restrictions)
    controls.minPolarAngle = 0;       // Prevent camera flipping below the model
    controls.minDistance = 2;
    controls.maxDistance = 15;

    // Load HDRI environment
    const hdrLoader = new THREE.RGBELoader();
    hdrLoader.load('/static/textures/lonely_road_afternoon_puresky_4k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture; // comment out to remove HDRI as background
        console.log("HDRI Loaded!");
    });

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Ambient Light (soft light to remove total darkness)
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(0, -10, -3);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);
    
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(directionalLightHelper);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // marker data for clickable coordinates
    const markers = [
        { position: new THREE.Vector3(0, -5, 0), annotation: "This is a marker" },
        { position: new THREE.Vector3(2, -5, 0), annotation: "This is another marker" }
    ];

    const markerObjects = [];
    markers.forEach(marker => {
        const sphereGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(marker.position);
        sphere.userData.annotation = marker.annotation;
        sphere.userData.isMarker = true;
        scene.add(sphere);
        markerObjects.push(sphere);
    });

    // Handle mouse click event
    function onPointerClick(event) {
        event.preventDefault();
    
        let x, y;
    
        if (event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
    
        const rect = renderer.domElement.getBoundingClientRect();
    
        // Normalize coordinates to [-1, 1] range relative to the canvas
        mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    
        camera.updateMatrixWorld();
    
        raycaster.setFromCamera(mouse, camera);
    
        scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.updateMatrixWorld();
            }
        });
    
        // Find intersections between the ray and the marker objects
        const intersects = raycaster.intersectObjects(markerObjects, true);
    
        if (intersects.length > 0) {
            const object = intersects[0].object;
    
            // Check if the tapped/clicked object is a marker
            if (object.userData.isMarker) {
                const annotation = object.userData.annotation;
    
                showPopup(x, y, annotation);
            }
        }
    }

    function showPopup(x, y, annotation) {
        const popup = document.createElement("div");
        popup.style.position = "absolute";
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        popup.style.backgroundColor = "white";
        popup.style.padding = "5px";
        popup.style.border = "1px solid #ccc";
        popup.style.borderRadius = "5px";
        popup.innerText = annotation;
        document.body.appendChild(popup);
    }

    window.addEventListener("click", onPointerClick, false);
    window.addEventListener("touchstart", onPointerClick, { passive: false });

    // Load the model
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/static/models/quantum_computer_nobg_textures.glb',
        function (gltf) {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, -15, -3);

            // Enable shadow casting for meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            const bottom = box.min.y + 2.5;
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Focus the OrbitControls target towards the bottom of the model
            const bottomPoint = new THREE.Vector3(center.x, bottom, center.z);
            controls.target.copy(bottomPoint);
            controls.update();

            scene.add(model);
        },
        undefined,
        function (error) {
            console.error("Error loading model:", error);
        }
    );

    camera.position.set(0, 2, 10);

    window.addEventListener("resize", onResize, false);
    function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
};