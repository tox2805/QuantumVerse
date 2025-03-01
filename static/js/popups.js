export function showInstructionsPopup(controls, markersClickable) {
    const popup = document.createElement("div");
    popup.className = "instruction-popup";
    popup.style.position = "absolute";
    popup.style.background = "linear-gradient(135deg, #512da8, #673ab7)";
    popup.style.padding = "20px";
    popup.style.border = "2px solid #fff";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.color = "#fff";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.3s ease";
    popup.style.zIndex = "10000";
    popup.style.maxWidth = "350px";
    popup.style.wordWrap = "break-word";
    popup.style.textAlign = "left";
    popup.style.lineHeight = "1.4"; // Improved readability

    // Positioning based on screen size
    if (window.innerWidth > 768) {
        popup.style.left = "20px"; // Left side for desktop
        popup.style.top = "20px";
    } else {
        popup.style.left = "50%"; // Centered on mobile
        popup.style.top = "50%";
        popup.style.transform = "translate(-50%, -50%)";
    }

    // Add title
    const title = document.createElement("div");
    title.innerText = "Welcome to the AR Quantum Tool!";
    title.style.fontSize = "20px";
    title.style.fontWeight = "bold";
    title.style.textAlign = "center";
    title.style.marginBottom = "12px"; // Less space before bullet points
    popup.appendChild(title);

    // Add instructions with proper spacing
    const instructions = document.createElement("ul");
    instructions.style.paddingLeft = "20px";
    instructions.style.margin = "0";

    // Determine input method based on device
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const interactText = isTouchDevice ? "Tap" : "Click";
    const rotateText = isTouchDevice ? "Drag with one finger" : "Use the mouse";
    const zoomText = isTouchDevice ? "Pinch to zoom" : "Scroll to zoom";

    const steps = [
        `${interactText} on markers to view annotations.`,
        `${rotateText} to rotate the model.`,
        `${zoomText} in and out.`,
        `${interactText} the ❌ to close this popup and enable controls.`
    ];

    steps.forEach(step => {
        const li = document.createElement("li");
        li.innerText = step.replace("❌", "✖"); // Ensuring black '✖' in text
        li.style.marginBottom = "8px"; // Space between bullet points
        popup.appendChild(li);
    });

    popup.appendChild(instructions);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.right = "12px";
    closeButton.style.top = "10px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "20px"; // Bigger close button
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#fff";
    closeButton.style.fontWeight = "bold";
    closeButton.style.transition = "color 0.2s ease"; // Smooth hover effect

    // Change color on hover
    closeButton.addEventListener("mouseover", () => {
        closeButton.style.color = "#000"; // White on hover
    });
    closeButton.addEventListener("mouseout", () => {
        closeButton.style.color = "#fff"; // Back to black when not hovered
    });

    closeButton.addEventListener("click", () => {
        popup.remove();
        window.markersClickable = true;
        controls.enabled = true; // Enable orbit controls
    });

    popup.appendChild(closeButton);
    document.body.appendChild(popup);

    // Disable controls until popup is closed
    controls.enabled = false;

    // Fade in effect
    setTimeout(() => {
        popup.style.opacity = "1";
    }, 10);
}