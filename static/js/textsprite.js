export function createTextSprite(text, color = "white", size = 1, fontSize=125, strokeWidth=20) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const textureSize = 128; // Texture resolution
    canvas.width = textureSize;
    canvas.height = textureSize;

    // Set font and alignment
    context.font = `Bold ${fontSize}px Arial`;
    context.textAlign = "center"; // Center text horizontally
    context.textBaseline = "middle"; // Center text vertically

    // Calculate the center of the canvas
    const x = textureSize / 2;
    const y = textureSize / 2;

    // Draw the stroke (outline)
    context.strokeStyle = "black"; // Black stroke color
    context.lineWidth = strokeWidth;
    context.strokeText(text, x, y);

    // Draw the text
    context.fillStyle = color; // Text color
    context.fillText(text, x, y);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create a sprite material
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });

    // Create the sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1); // Adjust size as needed

    return sprite;
}