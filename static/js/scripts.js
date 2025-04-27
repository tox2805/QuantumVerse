import { showInstructionsPopup } from "./popups.js";
import { createTextSprite } from "./textsprite.js";

window.markersClickable = false; // Initially false, to disable clicking on markers

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
    controls.enablePan = false; 
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;       // Prevent camera flipping below the model
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Load HDRI environment
    const hdrLoader = new THREE.RGBELoader();
    hdrLoader.load('/static/textures/lonely_road_afternoon_puresky_2k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture; // comment out to remove HDRI as background
        console.log("HDRI Loaded!");
    });

    let originalControlsTarget = new THREE.Vector3().copy(controls.target);

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
            originalControlsTarget.copy(bottomPoint);

            scene.add(model);
        },
        undefined,
        function (error) {
            console.error("Error loading model:", error);
        }
    );

    //Show inital instructions
    showInstructionsPopup(controls, window.markersClickable);
    
    // Set inital camera position
    if (window.innerWidth <= 768) {
        camera.position.set(0, 2, -20);
    } else {
        camera.position.set(0, 2, -18);
    }
    //camera.position.set(0, 2, -18);
    const originalCameraPosition = new THREE.Vector3().copy(camera.position);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // const axesHelper = new THREE.AxesHelper(5); // 5 is the length of each axis
    // scene.add(axesHelper);

    //Setting up lights
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // marker data for clickable coordinates
    console.log(annotationsData);
    const markers = [
        { 
            position: new THREE.Vector3(0, -12, -6), 
            annotation: annotationsData[0].annotation,
            number: 1, 
            targetpos: new THREE.Vector3(0.1, -8.9, -2.8),
            title: "Quantum Processor",
            cameraTargetPosition: new THREE.Vector3(-5, -9, -2.8)
        },
        { 
            position: new THREE.Vector3(5, -9, -3), 
            annotation: annotationsData[1].annotation,
            number: 2, 
            targetpos: new THREE.Vector3(1.5, -9.5, -4),
            title: "Quantum Amplifiers",
            cameraTargetPosition: new THREE.Vector3(5.76, -8.55, -6.4)
        },
        { 
            position: new THREE.Vector3(-4.5, -2, -7), 
            annotation: annotationsData[4].annotation,
            number: 5, 
            targetpos: new THREE.Vector3(-1, -1, -5),
            title: "Input Microwave Lines",
            cameraTargetPosition: new THREE.Vector3(-3.26, -0.25, -9.4)
        },
        { 
            position: new THREE.Vector3(6, 0, -3), 
            annotation: annotationsData[2].annotation,
            number: 3, 
            targetpos: new THREE.Vector3(3, 0, -3),
            title: "Qubit Signal Amplifiers",
            cameraTargetPosition: new THREE.Vector3(7.4, 0.4, -0.65)
        },
        { 
            position: new THREE.Vector3(6, -3, -1), 
            annotation: annotationsData[3].annotation,
            number: 4, 
            targetpos: new THREE.Vector3(1, -3.5, -1),
            title: "Superconducting Coaxial Lines",
            cameraTargetPosition: new THREE.Vector3(1.08, -2.46, 3.9)
        },
        { 
            position: new THREE.Vector3(-4.5, -6, -4), 
            annotation: annotationsData[5].annotation,
            number: 6, 
            targetpos: new THREE.Vector3(0, -8, -3),
            title: "Mixing Chamber",
            cameraTargetPosition: new THREE.Vector3(-3.49, -6, -6)
        },
        { 
            position: new THREE.Vector3(0, 2, -2), 
            annotation: annotationsData[6].annotation,
            number: 7, 
            targetpos: new THREE.Vector3(0, 1, -3),
            title: "External Components",
            cameraTargetPosition: new THREE.Vector3(0, 2, -8)
        }
    ];

    const markerObjects = [];
    markers.forEach((marker, index) => {
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x522b99,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(marker.position);
        sphere.userData.annotation = marker.annotation;
        sphere.userData.title = marker.title;
        sphere.userData.targetpos = marker.targetpos;
        sphere.userData.isMarker = true;
        sphere.userData.cameraTargetPosition = marker.cameraTargetPosition;
        sphere.userData.number = marker.number;


        const textSprite = createTextSprite(marker.number.toString(), "white", 0.6);
        textSprite.position.copy(marker.position);
        textSprite.position.y += 0.5;

        scene.add(sphere);
        scene.add(textSprite);
        markerObjects.push(sphere);

        const points = [marker.position, marker.targetpos];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.2,
            gapSize: 0.1
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.computeLineDistances();
        scene.add(line);
    });

    function onPointerClick(event) {
        event.preventDefault();

        if (!window.markersClickable) return;  // Return early if markers can't be clicked right now
    
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
                const title = object.userData.title;
                const targetpos = object.userData.targetpos;
                const cameraTargetPosition = object.userData.cameraTargetPosition
                const number = object.userData.number

                focusOnMarker(targetpos, cameraTargetPosition, x, y, title, annotation, number);
            }
        }
    }

    function focusOnMarker(targetpos, cameraTargetPosition, x, y, title, annotation, number) {
        const existingPopup = document.querySelector(".annotation-popup");
        if (existingPopup) {
            existingPopup.remove();
        }
        // Animate the camera to the specific position
        new TWEEN.Tween(camera.position)
            .to(cameraTargetPosition, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                // Adjust zoom limits after animation is complete
                showPopup(x, y, title, annotation, number);
                controls.minDistance = 2;
                controls.maxDistance = 10;
            })
            .start();
    
        new TWEEN.Tween(controls.target)
            .to(targetpos, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }
    
    function zoomOut() {
        controls.minDistance = 2;
        controls.maxDistance = 20;

        new TWEEN.Tween(camera.position)
            .to(originalCameraPosition, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    
        new TWEEN.Tween(controls.target)
            .to(originalControlsTarget, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    function showPopup(x, y, title, annotation, number) {
        const popup = document.createElement("div");
        popup.className = "annotation-popup";
        popup.style.position = "absolute";
        popup.style.background = "linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(123, 31, 162, 0.9))";
        popup.style.padding = "15px";
        popup.style.border = "1px solid #ccc";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
        popup.style.fontFamily = "Arial, sans-serif";
        popup.style.color = "#fff";
        popup.style.opacity = "0";
        popup.style.transition = "opacity 0.2s ease";
        popup.style.zIndex = "9999";
        popup.style.maxWidth = "300px";
        popup.style.wordWrap = "break-word";

        const titleElement = document.createElement("div");
        titleElement.innerText = title;
        titleElement.style.fontSize = "18px";
        titleElement.style.fontWeight = "bold";
        titleElement.style.textAlign = "center";
        titleElement.style.marginBottom = "10px";
        popup.appendChild(titleElement);

        const annotationList = document.createElement("ul");
        annotationList.style.paddingLeft = "20px";
        annotationList.style.fontSize = "14px";
        annotationList.style.textAlign = "left";

        annotation.replace(/\\n/g, '\n').split("\n").forEach(point => {
            const listItem = document.createElement("li");
            listItem.innerHTML = point.replace("• ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            listItem.style.marginBottom = "8px";
            annotationList.appendChild(listItem);
        });

        popup.appendChild(annotationList);
    
        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.style.display = "block";
        closeButton.style.margin = "15px auto 0";
        closeButton.style.padding = "5px 10px";
        closeButton.style.background = "transparent";
        closeButton.style.color = "#fff";
        closeButton.style.border = "3px solid #fff";
        closeButton.style.borderRadius = "8px";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "16px";
        closeButton.style.fontWeight = "bold";
        closeButton.style.transition = "background 0.3s ease, color 0.3s ease";
    
        closeButton.addEventListener("mouseenter", () => {
            closeButton.style.background = "#fff";
            closeButton.style.color = "#512da8";
        });
    
        closeButton.addEventListener("mouseleave", () => {
            closeButton.style.background = "transparent";
            closeButton.style.color = "#fff";
        });
    
        closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            window.markersClickable = true;
            popup.remove();
            zoomOut();
        });
    
        closeButton.addEventListener("touchstart", (event) => {
            event.stopPropagation();
            window.markersClickable = true;
            event.preventDefault();
            popup.remove();
            zoomOut();
        }, { passive: false });
    
        popup.appendChild(closeButton);
        document.body.appendChild(popup);
    
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupRect = popup.getBoundingClientRect();
        const offset = 10;
    
        // Ensure popup stays within viewport bounds
        let left = x + offset;
        let top = y + offset;
    
        if (left + popupRect.width > viewportWidth) {
            left = viewportWidth - popupRect.width - offset;
        }
        if (top + popupRect.height > viewportHeight) {
            top = viewportHeight - popupRect.height - offset;
        }
        if (left < offset) left = offset;
        if (top < offset) top = offset;
                
        if (window.innerWidth > 768) { 
            if (number === 4 || number === 5) {
                const rightMargin = 200;
                popup.style.left = `${viewportWidth - popupRect.width - rightMargin}px`;
                popup.style.top = `${(viewportHeight - popupRect.height) / 2}px`; // vertically center
            } 
            else if (number === 3) {
                // Place on the left side with a margin
                const leftMargin = 200;
                popup.style.left = `${leftMargin}px`;
                popup.style.top = `${(viewportHeight - popupRect.height) / 2}px`;
            } 
            else {
                popup.style.left = `${left}px`;
                popup.style.top = `${top}px`;
            }
        } else {
            // Mobile positioning: stick near the bottom with a small margin
            const smallMargin = 10;
            const popupHeight = popupRect.height;
            popup.style.left = `${left}px`;
            popup.style.top = `${viewportHeight - popupHeight - smallMargin}px`;
        }
        setTimeout(() => {
            popup.style.opacity = "1";
        }, 10);
    }

    window.addEventListener("click", onPointerClick, false);
    window.addEventListener("touchstart", onPointerClick, { passive: false });

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
        TWEEN.update();
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
};