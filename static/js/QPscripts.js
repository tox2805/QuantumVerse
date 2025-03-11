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
        camera.position.set(3, 0, -3);
    }

    const originalCameraPosition = new THREE.Vector3().copy(camera.position);

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
            title: "Quantum processor",
            annotation: "These qubits use superconducting circuits cooled to near absolute zero to maintain quantum states.",
            nextCameraPosition: { x: 0.25, y: 0.9, z: -2.15 },
            nextCameraTargetPosition: { x: 0.2, y: 0.89, z: -2.15 },
            linesArray: [
                { from: new THREE.Vector3(0, 0, 0), to: new THREE.Vector3(0, 0, 0) }
            ]
        },
        {
            title: "1: Qubits",
            annotation: "Here's how qubits are arranged...",
            nextCameraPosition: { x: 0.11, y: 0.92, z: -1.98 },
            nextCameraTargetPosition: { x: 0.115, y: 0.88, z: -2.1},
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.875, -2.13) }
            ]

        },
        {
            title: "1: Qubit Materials",
            annotation: "Each qubit is made from...",
            nextCameraPosition: { x: 0.25, y: 0.9, z: -2.15 },
            nextCameraTargetPosition: { x: 0.2, y: 0.89, z: -2.15 },
            linesArray: [
                { from: new THREE.Vector3(-0.7, 0.92, -1.1), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        },
        {
            title: "2: Quantum Logic Gates",
            annotation: "These gold lines represented with a '2' are resonators. Resonators carry microwave signals to the qubit to perform modify its state - acting as a quantum logic gate. They also do readouts on the qubit.",
            nextCameraPosition: { x: 0.25, y: 0.9, z: -2.15 },
            nextCameraTargetPosition: { x: 0.2, y: 0.89, z: -2.15 },
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        },
        {
            title: "2: Entanglement",
            annotation: "The resonators labeled here are responsible for connecting the qubits together - quantum coupling. This allows entanglement...",
            nextCameraPosition: { x: 3, y: 0, z: -3 },
            nextCameraTargetPosition: { x: 0.2, y: 0, z: -3 },
            linesArray: [
                { from: new THREE.Vector3(0.1, 0.9, -2), to: new THREE.Vector3(0.1, 0.88, -2.13) }
            ]
        }
    ];
        
    function showPopupStep(stepIndex) {
        // Remove any existing popups
        const existingPopup = document.querySelector(".annotation-popup");
        if (existingPopup) {
            existingPopup.remove();
        }
    
        if (stepIndex >= annotationSequence.length) {
            finalInstructions(); // No more steps, end sequence
        }
    
        const step = annotationSequence[stepIndex];
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
        popup.style.background = "linear-gradient(135deg, #4a148c, #7b1fa2)";
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
    
        if (window.innerWidth > 768) {
            popup.style.width = "300px";
            popup.style.height = "300px";
            popup.style.left = "5%";
            popup.style.top = "50%";
            popup.style.transform = "translateY(-50%)";
        } else {
            popup.style.width = "80%";
            popup.style.height = "120px";
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
        nextButton.style.margin = "0 auto";
        nextButton.style.padding = "10px 20px";
        nextButton.style.background = "#ff9800";
        nextButton.style.border = "none";
        nextButton.style.borderRadius = "5px";
        nextButton.style.color = "#fff";
        nextButton.style.cursor = "pointer";
        nextButton.style.fontSize = "14px";

        let lines = null; // Define line outside the condition

        // if (window.innerWidth > 768) {
        //     lines = drawLines(linesArray);  
        // }
        let qubitTextSprites = null
        let logicGateTextSprites = null
        let entanglementTextSprites = null


        //have if conditions here which call diff functions for handling qubits, gates etc
        if (title === "1: Qubits"){
            qubitTextSprites = qubitsMarkers();
        }

        // if (title === "1: Qubit Materials"){
        //     lines = drawLines(linesArray);
        // }

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
        textSprites[0].position.copy(new THREE.Vector3(0.1, 0.875, -2.13));  //left top
        textSprites[1].position.copy(new THREE.Vector3(0.1, 0.854, -2.217));  //right top
        textSprites[2].position.copy(new THREE.Vector3(0.1, 0.84, -2.172));  //middle
        textSprites[3].position.copy(new THREE.Vector3(0.1, 0.8, -2.132));  //left bot
        textSprites[4].position.copy(new THREE.Vector3(0.1, 0.821, -2.217));  //right bot

        return textSprites;
    }
    

    function drawLines(linesArray) {
        const lines = []; // Array to store line objects
    
        linesArray.forEach(({ from, to }) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const line = new THREE.Line(geometry, material);
    
            scene.add(line);
            lines.push(line); // Store the created line
        });
    
        return lines; // Return all the drawn lines
    }

    function logicGateMarkers() {
        const textSprites = [];
    
        for (let i = 1; i <= 5; i++) {
            const textSprite = createTextSprite("2", "white", 0.012);
            textSprites.push(textSprite);
            scene.add(textSprite);
        }
    
        // You will set their positions manually like this:
        textSprites[0].position.copy(new THREE.Vector3(0.1, 0.895, -2.135));  //left top
        textSprites[1].position.copy(new THREE.Vector3(0.1, 0.885, -2.211));  //right top
        textSprites[3].position.copy(new THREE.Vector3(0.1, 0.785, -2.14));  //left bot
        textSprites[4].position.copy(new THREE.Vector3(0.1, 0.8, -2.217));  //right bot

        return textSprites;
    }

    function entanglementMarkers() {
        const textSprites = [];
    
        for (let i = 1; i <= 5; i++) {
            const textSprite = createTextSprite("2", "white", 0.012);
            textSprites.push(textSprite);
            scene.add(textSprite);
        }
    
        // You will set their positions manually like this:
        textSprites[1].position.copy(new THREE.Vector3(0.1, 0.87, -2.175));  //right top
        textSprites[4].position.copy(new THREE.Vector3(0.1, 0.81, -2.175));  //right bot

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
    
        const textSprite = createTextSprite("2cm", "white", 0.2, 50, 10);
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