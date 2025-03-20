import { finalInstructions } from "./popups.js";
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
    controls.minDistance = 0.06;  
    controls.maxDistance = 4;

    // Load HDRI environment
    const hdrLoader = new THREE.RGBELoader();
    hdrLoader.load('/static/textures/lonely_road_afternoon_puresky_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        //scene.background = texture; // comment out to remove HDRI as background
        console.log("HDRI Loaded!");
    });

    let originalControlsTarget = new THREE.Vector3().copy(controls.target);

    // Load the model
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/static/models/Quantum_Processor_decimated.glb',
        function (gltf) {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, -3);

            // Enable shadow casting for meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            let bottom = 0;
            if (window.innerWidth > 768) {
                bottom = box.min.y + 1;
            } else{
                bottom = box.min.y + 0.5;
            }
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
    
    // Set inital camera position
    if (window.innerWidth > 768) {
        camera.position.set(2, 0.2, -3);
    } else{
        camera.position.set(3.5, 0, -2);
    }

    addScaleIndicator(scene, 2, { x: 0, y: 0, z: -4.2 });

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // const axesHelper = new THREE.AxesHelper(20);
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

    const annotationSequence = [
        {
            title: "Quantum Chip",
            annotation: "This is the superconducting quantum chip within the quantum processor. \n This chip contains the qubits required for performing quantum operations.",
            nextCameraPosition: { x: 0.4, y: 0.9, z: -2.175 },
            nextCameraTargetPosition: { x: 0.2, y: 0.81, z: -2.175 },
            linesArray: [
                { from: new THREE.Vector3(0, 0, 0), to: new THREE.Vector3(0, 0, 0) }
            ]
        },
        {
            title: "1: Qubits",
            annotation: "There are **five qubits** displayed here (labeled 1). \n On this chip, there are 280 total qubits, theoretically capable of 10^84 simultaneous computations. \n For context, the number of atoms in the observable universe is around 10^80.",
            nextCameraPosition: { x: 0.11, y: 0.92, z: -1.98 },
            nextCameraTargetPosition: { x: 0.12, y: 0.88, z: -2.1},
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.875, -2.13) }
            ]

        },
        {
            title: "1: Qubit Materials",
            annotation: "Each qubit consists of two **capacitor pads** connected by a **Josephson Junction**. \n These components are both made from superconducting materials (such as aluminium).",
            nextCameraPosition: { x: 0.4, y: 0.9, z: -2.175 },
            nextCameraTargetPosition: { x: 0.2, y: 0.81, z: -2.175 },
            linesArray: [
                { from: new THREE.Vector3(-0.7, 0.92, -1.1), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        },
        {
            title: "2: Quantum Logic Gates",
            annotation: "These resonators (labeled 2) read out qubit states and apply **quantum logic gates**. \n They interact with qubits via microwave pulses to manipulate and measure quantum states.",
            nextCameraPosition: { x: 0.4, y: 0.9, z: -2.175 },
            nextCameraTargetPosition: { x: 0.2, y: 0.81, z: -2.175 },
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        },
        {
            title: "2: Entanglement",
            annotation: "The resonators labeled here enable quantum coupling between qubits. \n This allows **entanglement**, a key property for quantum computation. \n Resonators facilitate controlled interactions between qubits, enabling **multi-qubit** operations.",
            nextCameraPosition: { x: 3.5, y: -0.5, z: -2 },
            nextCameraTargetPosition: { x: 0, y: -0.5, z: -3 },
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        }
    ];

    if (window.innerWidth > 768) {
        const entanglementStep = annotationSequence.find(a => a.title === "2: Entanglement");
        if (entanglementStep) {
            entanglementStep.nextCameraPosition = { x: 2, y: 0.2, z: -3 };
            entanglementStep.nextCameraTargetPosition = { x: 0, y: 0, z: -3 };
        }
    }
        
    function showPopupStep(stepIndex) {
        // Remove any existing popups
        const existingPopup = document.querySelector(".annotation-popup");
        if (existingPopup) {
            existingPopup.remove();
        }

        const step = annotationSequence[stepIndex];

        if (stepIndex >= annotationSequence.length) {
            finalInstructions(); // No more steps, end sequence
            return;
        }
    
        showPopupStepWithCamera(step, stepIndex);
        // Show the popup first, but do NOT move the camera yet
        function showPopupStepWithCamera(step, stepIndex) {
            // Show the popup first, but do NOT move the camera yet
            showPopup(step.title, step.annotation, stepIndex, step.linesArray, () => {
                // Wait for the user to click "Next", then move the camera
                moveCameraTo(step.nextCameraTargetPosition, step.nextCameraPosition).then(() => {
                    // Once the camera move is finished, show the next step
                    showPopupStep(stepIndex + 1);
                });
            });
        }
    }

    function moveCameraTo(targetpos, nextCameraPosition) {
        return new Promise((resolve) => {
        // Animate the camera to the specific position
            new TWEEN.Tween(camera.position)
                .to(nextCameraPosition, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(resolve)
                .start();

            // Animate the controls target to focus on the targetpos
            new TWEEN.Tween(controls.target)
                .to(targetpos, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        });
    }

    function showPopup(title, annotation, stepIndex, linesArray, onNext) {
        const existingPopup = document.querySelector(".annotation-popup");
        if (existingPopup) {
            existingPopup.remove();
        }
    
        const popup = document.createElement("div");
        popup.className = "annotation-popup";
        popup.style.position = "fixed"; 
        popup.style.background = "linear-gradient(135deg,rgba(74, 20, 140, 0.85), rgba(123, 31, 162, 0.85))";
        popup.style.padding = "15px";
        popup.style.border = "1px solid #ccc";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
        popup.style.fontFamily = "Arial, sans-serif";
        popup.style.color = "#fff";
        popup.style.opacity = "0";
        popup.style.transition = "opacity 0.3s ease";
        popup.style.zIndex = "9999";
        popup.style.wordWrap = "break-word";
        popup.style.maxHeight = "80vh";
    
        if (window.innerWidth > 768) {
            popup.style.width = "300px";
            //popup.style.height = "300px";
            popup.style.left = "5%";
            popup.style.top = "50%";
            popup.style.transform = "translateY(-50%)";
        } else {
            popup.style.width = "80%";
            //popup.style.height = "120px";
            popup.style.left = "50%";
            popup.style.bottom = "20px";
            popup.style.transform = "translateX(-50%)";
        }
    
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
    
        annotation.split("\n").forEach(point => {
            const listItem = document.createElement("li");
            listItem.innerHTML = point.replace("• ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            listItem.style.marginBottom = "8px";
            annotationList.appendChild(listItem);
        });
    
        popup.appendChild(annotationList);
    
        const nextButton = document.createElement("button");
        nextButton.innerText = stepIndex === annotationSequence.length - 1 ? "Finish" : "Next";
        nextButton.style.display = "block";
        nextButton.style.margin = "15px auto 0";
        nextButton.style.padding = "5px 10px";
        nextButton.style.background = "transparent";  // Transparent background initially
        nextButton.style.color = "#fff";  // White text
        nextButton.style.border = "3px solid #fff";  // White border
        nextButton.style.borderRadius = "8px";
        nextButton.style.cursor = "pointer";
        nextButton.style.fontSize = "16px";
        nextButton.style.fontWeight = "bold";
        nextButton.style.transition = "background 0.3s ease, color 0.3s ease";  // Smooth transition
    
        // Hover effect
        nextButton.addEventListener("mouseenter", () => {
            nextButton.style.background = "#fff";  // White background on hover
            nextButton.style.color = "#512da8";  // Purple text on hover (same as popup background)
        });
    
        nextButton.addEventListener("mouseleave", () => {
            nextButton.style.background = "transparent";  // Revert to transparent background
            nextButton.style.color = "#fff";  // Revert to white text
        });


        let qubitTextSprites = null
        let logicGateTextSprites = null
        let entanglementTextSprites = null


        //have if conditions here which call diff functions for handling qubits, gates etc
        if (title === "1: Qubits"){
            qubitTextSprites = qubitsMarkers();
        }

        if ((title === "1: Qubit Materials") && window.innerWidth < 768){
            popup.style.top = "20px";
            popup.style.bottom = "";
        }

        if (title === "2: Quantum Logic Gates"){
            logicGateTextSprites = logicGateMarkers();
        }

        if (title === "2: Entanglement"){
            entanglementTextSprites = entanglementMarkers();
        }

        nextButton.addEventListener("click", () => {
            popup.remove();
            
            if (qubitTextSprites) {
                qubitTextSprites.forEach(qsprite => scene.remove(qsprite));
                qubitTextSprites.length = 0; // Clear the array
            }
            if (logicGateTextSprites) {
                logicGateTextSprites.forEach(lsprite => scene.remove(lsprite));
                logicGateTextSprites.length = 0; // Clear the array
            }
            if (entanglementTextSprites) {
                entanglementTextSprites.forEach(esprite => scene.remove(esprite));
                entanglementTextSprites.length = 0; // Clear the array
            }
        
            if (onNext) onNext(); // Move the camera and show the next popup
        });
    
        popup.appendChild(nextButton);

        document.body.appendChild(popup);
    
        setTimeout(() => {
            popup.style.opacity = "1";
        }, 10);
    }

    function qubitsMarkers() {
        const textSprites = [];
    
        for (let i = 1; i <= 5; i++) {
            const textSprite = createTextSprite("1", "white", 0.015);
            textSprites.push(textSprite);
            scene.add(textSprite);
        }
    
        // You will set their positions manually like this:
        textSprites[0].position.copy(new THREE.Vector3(0.095, 0.875, -2.13));  //left top
        textSprites[1].position.copy(new THREE.Vector3(0.095, 0.854, -2.217));  //right top
        textSprites[2].position.copy(new THREE.Vector3(0.095, 0.835, -2.172));  //middle
        textSprites[3].position.copy(new THREE.Vector3(0.095, 0.795, -2.132));  //left bot
        textSprites[4].position.copy(new THREE.Vector3(0.095, 0.815, -2.22));  //right bot

        return textSprites;
    }

    function logicGateMarkers() {
        const textSprites = [];
    
        for (let i = 1; i <= 5; i++) {
            const textSprite = createTextSprite("2", "white", 0.015);
            textSprites.push(textSprite);
            scene.add(textSprite);
        }
    
        textSprites[0].position.copy(new THREE.Vector3(0.095, 0.895, -2.135));  //left top
        textSprites[1].position.copy(new THREE.Vector3(0.095, 0.885, -2.215));  //right top
        textSprites[3].position.copy(new THREE.Vector3(0.095, 0.778, -2.14));  //left bot
        textSprites[4].position.copy(new THREE.Vector3(0.095, 0.79, -2.218));  //right bot

        return textSprites;
    }

    function entanglementMarkers() {
        const textSprites = [];
    
        for (let i = 1; i <= 5; i++) {
            const textSprite = createTextSprite("2", "white", 0.015);
            textSprites.push(textSprite);
            scene.add(textSprite);
        }
    
        textSprites[1].position.copy(new THREE.Vector3(0.095, 0.87, -2.178)); //top
        textSprites[4].position.copy(new THREE.Vector3(0.095, 0.795, -2.18));  //bot

        return textSprites;
    }

    function addScaleIndicator(scene, chipHeight, position) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    
        // Define the vertical line
        const verticalPoints = [
            new THREE.Vector3(position.x, position.y - chipHeight / 2, position.z),
            new THREE.Vector3(position.x, position.y + chipHeight / 2, position.z)
        ];
        const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints);
        const verticalLine = new THREE.Line(verticalGeometry, material);
    
        // Define the top rotated horizontal line (aligned along Z-axis)
        const topPoints = [
            new THREE.Vector3(position.x, position.y + chipHeight / 2, position.z - 0.1),
            new THREE.Vector3(position.x, position.y + chipHeight / 2, position.z + 0.1)
        ];
        const topGeometry = new THREE.BufferGeometry().setFromPoints(topPoints);
        const topLine = new THREE.Line(topGeometry, material);
    
        // Define the bottom rotated horizontal line (aligned along Z-axis)
        const bottomPoints = [
            new THREE.Vector3(position.x, position.y - chipHeight / 2, position.z - 0.1),
            new THREE.Vector3(position.x, position.y - chipHeight / 2, position.z + 0.1)
        ];
        const bottomGeometry = new THREE.BufferGeometry().setFromPoints(bottomPoints);
        const bottomLine = new THREE.Line(bottomGeometry, material);
    
        // Create a group for all scale elements
        const scaleGroup = new THREE.Group();
        scaleGroup.add(verticalLine, topLine, bottomLine);
    
        const textSprite = createTextSprite("2cm", "white", 0.25, 50, 10);
        textSprite.position.copy(new THREE.Vector3(0, 0, -4.35));

        scene.add(textSprite);
        scene.add(scaleGroup);
    }
    
    // window.addEventListener("click", onPointerClick, false);
    // window.addEventListener("touchstart", onPointerClick, { passive: false });
  
    showPopupStep(0);
    
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