export function showInstructionsPopup(controls, markersClickable, toolbarNotCreated = true) {
    const popup = document.createElement("div");
    popup.className = "instruction-popup";
    popup.style.position = "absolute";
    popup.style.background = "linear-gradient(135deg, rgba(74, 20, 140, 0.85), rgba(123, 31, 162, 0.85))";
    popup.style.padding = "20px";
    popup.style.border = "2px solid #fff";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.color = "#fff";
    popup.style.opacity = "1";
    popup.style.transition = "opacity 0.5s ease";
    popup.style.zIndex = "10000";
    popup.style.maxWidth = window.innerWidth > 768 ? "360px" : "400px";
    popup.style.width = "90vw";
    popup.style.wordWrap = "break-word";
    popup.style.textAlign = "left";
    popup.style.lineHeight = "1.4";

    if (window.innerWidth > 768) {
        popup.style.left = "2%";
        popup.style.top = "15%";
    } else {
        popup.style.left = "50%";
        popup.style.top = "40%";
        popup.style.transform = "translate(-50%, -50%)";
    }

    const title = document.createElement("div");
    title.innerText = "Welcome to the Quantum Visualisation Tool!";
    title.style.fontSize = "20px";
    title.style.fontWeight = "bold";
    title.style.textAlign = "center";
    title.style.marginBottom = "12px";
    popup.appendChild(title);

    const instructions = document.createElement("ul");
    instructions.style.paddingLeft = "20px";
    instructions.style.margin = "0";

    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const interactText = isTouchDevice ? "tapping" : "clicking";
    const rotateText = isTouchDevice ? "dragging with one finger" : "dragging the mouse";
    const zoomText = isTouchDevice ? "by pinching" : "by scrolling";
    const exitText = isTouchDevice ? "Tap" : "Click";

    const steps = [
        'Displayed here is a quantum computer based on IBM\'s superconducting architecture.',
        `View annotations by ${interactText} on markers.`,
        `Rotate the model by ${rotateText}.`,
        `Zoom in and out ${zoomText}.`,
        `${exitText} anywhere to start interacting.`
    ];

    steps.forEach(step => {
        const li = document.createElement("li");
        li.innerText = step;
        li.style.marginBottom = "8px";
        li.style.listStylePosition = "outside";
        li.style.paddingLeft = "20px";
        li.style.textIndent = "-20px";
        popup.appendChild(li);
    });

    popup.appendChild(instructions);

    // Close button at the bottom
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.display = "block";
    closeButton.style.margin = "20px auto 0";
    closeButton.style.padding = "10px 20px";
    closeButton.style.background = "transparent";
    closeButton.style.color = "#fff";
    closeButton.style.border = "3px solid #fff";
    closeButton.style.borderRadius = "8px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "16px";
    closeButton.style.fontWeight = "bold";
    closeButton.style.transition = "background 0.3s ease, color 0.3s ease";

    // Hover effect
    closeButton.addEventListener("mouseenter", () => {
        closeButton.style.background = "#fff";
        closeButton.style.color = "#512da8";
    });

    closeButton.addEventListener("mouseleave", () => {
        closeButton.style.background = "transparent";
        closeButton.style.color = "#fff";
    });

    let closeButtonClicked = false; // Flag to prevent enableControls from running

    // Event listener for the close button
    closeButton.addEventListener("click", () => {
        closeButtonClicked = true; // Set the flag when close button is clicked
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500);
        controls.enabled = true;
        window.markersClickable = true;
        if (toolbarNotCreated){
            createToolBar(controls);
        }
    });

    closeButton.addEventListener("touchstart", () => {
        closeButtonClicked = true; // Set the flag when close button is clicked
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500);
        controls.enabled = true;
        window.markersClickable = true;
        if (toolbarNotCreated){
            createToolBar(controls);
        }
    });
    
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
    
    controls.enabled = false;
    
    //Controls get enabled if the user clicks anywhere on the screen, not just the close button
    function enableControls(event) {
        // Prevent execution of enableControls if closeButton was clicked to prevent duplicate toolbars
        if (closeButtonClicked) return;
    
        if (!controls.enabled) {
            controls.enabled = true;
            window.markersClickable = true;
            popup.style.opacity = "0";
            setTimeout(() => popup.remove(), 500);
            document.removeEventListener("pointerdown", enableControls);
            if (toolbarNotCreated){
                createToolBar(controls);
            }
            // Ensure the controls register the first drag movement
            controls.update();
        }
    }
    
    document.addEventListener("pointerdown", enableControls, { passive: false });
}

function createToolBar(controls) {
    // Create a container to hold both the title and the toolbar
    const toolbarWrapper = document.createElement("div");
    toolbarWrapper.style.position = "fixed";
    toolbarWrapper.style.top = "20px";
    toolbarWrapper.style.left = "20px";
    toolbarWrapper.style.zIndex = "10000";
    toolbarWrapper.style.display = "flex";
    toolbarWrapper.style.flexDirection = "column";
    toolbarWrapper.style.alignItems = "flex-start";
    toolbarWrapper.style.gap = "10px";

    const title = document.createElement("div");
    title.innerText = "IBM Superconducting Quantum Computer";
    title.style.fontSize = "1rem";
    title.style.fontWeight = "600";
    title.style.color = "white";
    title.style.background = "#25144d";
    title.style.padding = "6px 12px";
    title.style.borderRadius = "8px";

    // Create the toolbar row
    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.flexDirection = "row";
    toolbar.style.gap = "10px";

    const createButton = (text, onClickHandler) => {
        const button = document.createElement("button");
        button.innerText = text;
        button.style.background = "#512da8";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = text === "?" ? "20%" : "8px";
        button.style.cursor = "pointer";
        button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        button.style.transition = "background 0.3s ease";

        if (window.innerWidth <= 768) {
            button.style.padding = "6px 12px";
            button.style.fontSize = "14px";
        } else {
            button.style.padding = text === "?" ? "10px 20px" : "12px 20px";
            button.style.fontSize = "16px";
        }

        button.addEventListener("mouseover", () => {
            button.style.background = "#673ab7";
        });

        button.addEventListener("mouseout", () => {
            button.style.background = "#512da8";
        });

        button.addEventListener("click", onClickHandler);
        button.addEventListener("touchstart", onClickHandler);

        return button;
    };

    const helpButton = createButton("?", () => {
        showInstructionsPopup(controls, true, false);
    });

    const exploreButton = createButton("Go To Quantum Processor", () => {
        window.location.href = "/quantumprocessor";
    });

    const quizbutton = createButton("Quiz", () => {
        window.location.href = "/quiz";
    });

    toolbar.appendChild(helpButton);
    toolbar.appendChild(exploreButton);
    toolbar.appendChild(quizbutton);


    if (window.innerWidth >= 768) {
        toolbarWrapper.appendChild(title);
    }
    toolbarWrapper.appendChild(toolbar);

    document.body.appendChild(toolbarWrapper);
}

export function backToFullModelBtn(){
    const button = document.createElement("button");
    const text = "← Back To Full Model";
    button.innerText = text;
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.left = "20px";
    button.style.background = "#512da8";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = text === "?" ? "20%" : "8px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
    button.style.transition = "background 0.3s ease";

    button.style.padding = text === "?" ? "10px 20px" : "12px 20px";
    button.style.fontSize = "16px";


    button.addEventListener("mouseover", () => {
        button.style.background = "#673ab7";
    });

    button.addEventListener("mouseout", () => {
        button.style.background = "#512da8";
    });

    button.addEventListener("click", () => {
        window.location.href = "/quantumar";
    });
    button.addEventListener("touchstart", () => {
        window.location.href = "/quantumar";
    });

    return button;
}

export function finalInstructions() {
    const existingPopup = document.querySelector(".annotation-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.className = "annotation-popup";
    popup.style.position = "fixed";
    popup.style.background = "linear-gradient(135deg, rgba(74, 20, 140, 0.85), rgba(123, 31, 162, 0.85))";
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
        popup.style.left = "5%";
        popup.style.top = "50%";
        popup.style.transform = "translateY(-50%)";
    } else {
        popup.style.width = "80%";
        popup.style.left = "50%";
        popup.style.bottom = "20px";
        popup.style.transform = "translateX(-50%)";
    }

    const titleElement = document.createElement("div");
    titleElement.innerText = "You've finished!";
    titleElement.style.fontSize = "18px";
    titleElement.style.fontWeight = "bold";
    titleElement.style.textAlign = "center";
    titleElement.style.marginBottom = "10px";
    popup.appendChild(titleElement);

    const message = document.createElement("p");
    message.innerText = "You have reached the end of the visualisation. Would you like to restart or return to the full quantum computer model?";
    message.style.fontSize = "14px";
    message.style.textAlign = "center";
    message.style.marginBottom = "15px";
    popup.appendChild(message);

    const restartButton = document.createElement("button");
    restartButton.innerText = "Restart";
    restartButton.style.display = "block";
    restartButton.style.margin = "10px auto";
    restartButton.style.padding = "10px 20px";
    restartButton.style.background = "#ff9800";
    restartButton.style.border = "none";
    restartButton.style.borderRadius = "5px";
    restartButton.style.color = "#fff";
    restartButton.style.cursor = "pointer";
    restartButton.style.fontSize = "14px";
    restartButton.addEventListener("click", () => {
        location.reload(); // Refreshes the page
    });
    popup.appendChild(restartButton);

    const backButton = document.createElement("button");
    backButton.innerText = "Back to full computer model";
    backButton.style.display = "block";
    backButton.style.margin = "10px auto";
    backButton.style.padding = "10px 20px";
    backButton.style.background = "#4CAF50";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.color = "#fff";
    backButton.style.cursor = "pointer";
    backButton.style.fontSize = "14px";
    backButton.addEventListener("click", () => {
        window.location.href = "/quantumar";
    });
    popup.appendChild(backButton);

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = "1";
    }, 10);
}