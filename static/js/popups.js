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
        popup.style.top = "10%";
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
        `View annotations by ${interactText} on markers.`,
        `Rotate the model by ${rotateText}.`,
        `Zoom in and out ${zoomText}.`,
        `${exitText} anywhere to start interacting.`
    ];

    steps.forEach(step => {
        const li = document.createElement("li");
        li.innerText = step;
        li.style.marginBottom = "8px";
        popup.appendChild(li);
    });

    popup.appendChild(instructions);

    // Close button at the bottom
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.display = "block";
    closeButton.style.margin = "20px auto 0";
    closeButton.style.padding = "10px 20px";
    closeButton.style.background = "transparent";  // Transparent background initially
    closeButton.style.color = "#fff";  // White text
    closeButton.style.border = "3px solid #fff";  // White border
    closeButton.style.borderRadius = "8px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "16px";
    closeButton.style.fontWeight = "bold";
    closeButton.style.transition = "background 0.3s ease, color 0.3s ease";  // Smooth transition

    // Hover effect
    closeButton.addEventListener("mouseenter", () => {
        closeButton.style.background = "#fff";  // White background on hover
        closeButton.style.color = "#512da8";  // Purple text on hover (same as popup background)
    });

    closeButton.addEventListener("mouseleave", () => {
        closeButton.style.background = "transparent";  // Revert to transparent background
        closeButton.style.color = "#fff";  // Revert to white text
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
    // Create the toolbar container
    const toolbar = document.createElement("div");
    toolbar.style.position = "fixed";
    toolbar.style.left = "20px";
    toolbar.style.zIndex = "10000"; // Ensure the toolbar is on top
    toolbar.style.display = "flex";
    toolbar.style.flexDirection = "row";
    toolbar.style.alignItems = "flex-start";
    toolbar.style.gap = "10px"; // Space between buttons

    // Function to create a button with common styles
    const createButton = (text, onClickHandler) => {
        const button = document.createElement("button");
        button.innerText = text;
        button.style.background = "#512da8";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = text === "?" ? "20%" : "8px"; // Conditional border radius
        button.style.cursor = "pointer";
        button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        button.style.transition = "background 0.3s ease";

        // Adjust button size based on screen width
        if (window.innerWidth <= 768) {
            button.style.padding = "6px 12px"; // Smaller padding for mobile
            button.style.fontSize = "14px"; // Smaller font size for mobile
            toolbar.style.top = "10px";
        } else {
            button.style.padding = text === "?" ? "10px 20px" : "12px 20px"; // Default padding
            button.style.fontSize = "16px"; // Default font size
            toolbar.style.top = "20px";
        }

        // Hover effects
        button.addEventListener("mouseover", () => {
            button.style.background = "#673ab7";
        });

        button.addEventListener("mouseout", () => {
            button.style.background = "#512da8";
        });

        // Click/touch event
        button.addEventListener("click", onClickHandler);
        button.addEventListener("touchstart", onClickHandler);

        return button;
    };

    // Create the help button (?)
    const helpButton = createButton("?", () => {
        showInstructionsPopup(controls, true, false); // Show instructions popup
    });

    // Create the "click to explore" button
    const exploreButton = createButton("Explore Quantum Processor", () => {
        window.location.href = "/quantumprocessor"; // Navigate to quantum processor page
    });

    // Append both buttons to the toolbar
    toolbar.appendChild(helpButton);
    toolbar.appendChild(exploreButton);

    // Append toolbar to the body
    document.body.appendChild(toolbar);
}

export function finalInstructions() {
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
    titleElement.innerText = "End of Quantum Processor Visualization";
    titleElement.style.fontSize = "18px";
    titleElement.style.fontWeight = "bold";
    titleElement.style.textAlign = "center";
    titleElement.style.marginBottom = "10px";
    popup.appendChild(titleElement);

    const message = document.createElement("p");
    message.innerText = "You have reached the end of the visualization sequence. Would you like to restart or return to the full quantum computer model?";
    message.style.fontSize = "14px";
    message.style.textAlign = "center";
    message.style.marginBottom = "15px";
    popup.appendChild(message);

    // Restart Button
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

    // Back to Full Model Button
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
        window.location.href = "/quantumar"; // Redirects to the full quantum computer model page
    });
    popup.appendChild(backButton);

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = "1";
    }, 10);
}