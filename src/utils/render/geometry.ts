import * as THREE from "three";

function getImageData(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);

            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
}

export async function createItemGeometry(
    blob: Blob,
    options = {
        width: 16,
        height: 16,
        scale: 0.4 / 16,
        threshold: 128,
    }
): Promise<THREE.BufferGeometry> {
    const { width, height, scale, threshold } = options;
    const data = (await getImageData(blob)).data;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const alpha = data[i + 3];

            if (alpha > 0) {
                // Get the base vertex index for this cube
                const baseIndex = vertices.length / 3;

                // Add vertices for a cube at (x, y) position
                const xPos = (x - width / 2) * scale;
                const yPos = (height / 2 - y) * scale;

                // Add unique vertices for the cube
                vertices.push(
                    // Front vertices
                    xPos,
                    yPos,
                    0, // 0
                    xPos + scale,
                    yPos,
                    0, // 1
                    xPos + scale,
                    yPos + scale,
                    0, // 2
                    xPos,
                    yPos + scale,
                    0, // 3
                    // Back vertices
                    xPos,
                    yPos,
                    -scale, // 4
                    xPos + scale,
                    yPos,
                    -scale, // 5
                    xPos + scale,
                    yPos + scale,
                    -scale, // 6
                    xPos,
                    yPos + scale,
                    -scale // 7
                );

                // Check neighboring pixels with threshold and invert checks
                const hasLeft = x > 0 && data[(y * width + (x - 1)) * 4 + 3] >= threshold;
                const hasRight = x < width - 1 && data[(y * width + (x + 1)) * 4 + 3] >= threshold;
                const hasTop = y < height - 1 && data[((y + 1) * width + x) * 4 + 3] >= threshold;
                const hasBottom = y > 0 && data[((y - 1) * width + x) * 4 + 3] >= threshold;

                // Add normals only for visible faces
                // Front face (always visible)
                normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
                // Back face (always visible)
                normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);

                // Add UVs for each vertex
                const u = x / width;
                const v = 1 - y / height;
                uvs.push(
                    u,
                    v,
                    u + 1 / width,
                    v,
                    u + 1 / width,
                    v - 1 / height,
                    u,
                    v - 1 / height,
                    u,
                    v,
                    u + 1 / width,
                    v,
                    u + 1 / width,
                    v - 1 / height,
                    u,
                    v - 1 / height
                );

                // Add indices only for visible faces
                // Front face
                indices.push(baseIndex, baseIndex + 2, baseIndex + 1, baseIndex, baseIndex + 3, baseIndex + 2);
                // Back face
                indices.push(baseIndex + 5, baseIndex + 6, baseIndex + 4, baseIndex + 6, baseIndex + 7, baseIndex + 4);

                // Add side faces only if there's no adjacent pixel
                if (!hasRight) {
                    indices.push(
                        baseIndex + 1,
                        baseIndex + 6,
                        baseIndex + 2,
                        baseIndex + 1,
                        baseIndex + 5,
                        baseIndex + 6
                    );
                }
                if (!hasLeft) {
                    indices.push(baseIndex, baseIndex + 7, baseIndex + 3, baseIndex, baseIndex + 4, baseIndex + 7);
                }
                if (!hasTop) {
                    indices.push(baseIndex + 1, baseIndex + 5, baseIndex, baseIndex + 5, baseIndex + 4, baseIndex);
                }
                if (!hasBottom) {
                    indices.push(
                        baseIndex + 2,
                        baseIndex + 6,
                        baseIndex + 3,
                        baseIndex + 6,
                        baseIndex + 7,
                        baseIndex + 3
                    );
                }
            }
        }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
}
