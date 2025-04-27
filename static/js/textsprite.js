export function createTextSprite(text, color = "white", size = 1, fontSize=125, strokeWidth=20) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    context.font = `Bold ${fontSize}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle"; 

    const x = textureSize / 2;
    const y = textureSize / 2;

    context.strokeStyle = "black";
    context.lineWidth = strokeWidth;
    context.strokeText(text, x, y);

    context.fillStyle = color;
    context.fillText(text, x, y);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1);

    return sprite;
}