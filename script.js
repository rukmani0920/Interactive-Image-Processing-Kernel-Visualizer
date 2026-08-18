/* =========================================================
   INTERACTIVE IMAGE KERNEL VISUALIZER
   ========================================================= */


/* ================= ELEMENTS ================= */

const imageInput =
    document.getElementById("imageInput");

const kernelSelect =
    document.getElementById("kernelSelect");

const originalCanvas =
    document.getElementById("originalCanvas");

const outputCanvas =
    document.getElementById("outputCanvas");

const originalWrapper =
    document.getElementById("originalWrapper");

const selectionGrid =
    document.getElementById("selectionGrid");

const kernelDisplay =
    document.getElementById("kernelDisplay");

const pixelRegion =
    document.getElementById("pixelRegion");

const calculation =
    document.getElementById("calculation");

const result =
    document.getElementById("result");

const fullPixelValues =
    document.getElementById("fullPixelValues");


/* ================= CONTEXT ================= */

const originalCtx =
    originalCanvas.getContext("2d");

const outputCtx =
    outputCanvas.getContext("2d");


/* ================= VARIABLES ================= */

let originalImageData = null;

let currentImage = null;

let selectedX = null;

let selectedY = null;

let zoom = 1;


/* =========================================================
   OPERATION DATA
   ========================================================= */

const operations = {

    blur: {

        name: "Blur / Mean Filter",

        kernel: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],

        divisor: 9,

        description:
            "A smoothing filter that reduces noise and small details by averaging neighboring pixels.",

        formula:
            "g(x,y) = (1/9) × Σ f(x+i,y+j)",

        theory:
            "The mean filter replaces each pixel with the average of its 3×3 neighborhood. It is mainly used for smoothing and noise reduction.",

        applications: [
            "Noise reduction",
            "Image smoothing",
            "Pre-processing"
        ]

    },


    gaussian: {

        name: "Gaussian Blur",

        kernel: [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ],

        divisor: 16,

        description:
            "A weighted smoothing filter. Pixels near the center receive higher importance.",

        formula:
            "g(x,y) = (1/16) × Σ K(i,j)f(x+i,y+j)",

        theory:
            "Gaussian filtering performs weighted averaging. The center pixel has greater influence than the surrounding pixels, producing smoother and more natural results.",

        applications: [
            "Noise reduction",
            "Image smoothing",
            "Before edge detection"
        ]

    },


    sharpen: {

        name: "Sharpen",

        kernel: [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ],

        divisor: 1,

        description:
            "Enhances edges and fine details by emphasizing the center pixel and subtracting neighboring pixels.",

        formula:
            "g(x,y) = 5f(x,y) − f(x−1,y) − f(x+1,y) − f(x,y−1) − f(x,y+1)",

        theory:
            "Sharpening increases the contrast around edges. The center pixel receives a high positive weight while neighboring pixels receive negative weights.",

        applications: [
            "Image sharpening",
            "Detail enhancement",
            "Edge enhancement"
        ]

    },


    laplacian: {

        name: "Laplacian",

        kernel: [
            [0, -1, 0],
            [-1, 4, -1],
            [0, -1, 0]
        ],

        divisor: 1,

        description:
            "A second-order derivative operator used to detect rapid intensity changes and edges.",

        formula:
            "∇²f = ∂²f/∂x² + ∂²f/∂y²",

        theory:
            "The Laplacian operator detects regions where the intensity changes rapidly. It is a second-order derivative and is commonly used for edge detection and sharpening.",

        applications: [
            "Edge detection",
            "Image sharpening",
            "Feature extraction"
        ]

    },


    sobelX: {

        name: "Sobel X",

        kernel: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ],

        divisor: 1,

        description:
            "Detects vertical edges by measuring intensity changes in the horizontal direction.",

        formula:
            "Gx = (-1×P1) + (1×P3) + (-2×P4) + (2×P6) + (-1×P7) + (1×P9)",

        theory:
            "The Sobel X operator calculates the horizontal intensity gradient. Strong responses indicate vertical edges.",

        applications: [
            "Vertical edge detection",
            "Object boundaries",
            "Feature extraction"
        ]

    },


    sobelY: {

        name: "Sobel Y",

        kernel: [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ],

        divisor: 1,

        description:
            "Detects horizontal edges by measuring intensity changes in the vertical direction.",

        formula:
            "Gy = (-1×P1) + (-2×P2) + (-1×P3) + (1×P7) + (2×P8) + (1×P9)",

        theory:
            "The Sobel Y operator measures the vertical intensity gradient. Strong responses indicate horizontal edges.",

        applications: [
            "Horizontal edge detection",
            "Object boundaries",
            "Shape analysis"
        ]

    },


    prewittX: {

        name: "Prewitt X",

        kernel: [
            [-1, 0, 1],
            [-1, 0, 1],
            [-1, 0, 1]
        ],

        divisor: 1,

        description:
            "A first-order derivative operator used to detect vertical edges.",

        formula:
            "Gx = Σ Kx(i,j)f(x+i,y+j)",

        theory:
            "Prewitt X estimates the gradient in the horizontal direction and highlights vertical edges.",

        applications: [
            "Vertical edge detection",
            "Image segmentation",
            "Feature extraction"
        ]

    },


    prewittY: {

        name: "Prewitt Y",

        kernel: [
            [-1, -1, -1],
            [0, 0, 0],
            [1, 1, 1]
        ],

        divisor: 1,

        description:
            "A first-order derivative operator used to detect horizontal edges.",

        formula:
            "Gy = Σ Ky(i,j)f(x+i,y+j)",

        theory:
            "Prewitt Y estimates the gradient in the vertical direction and highlights horizontal edges.",

        applications: [
            "Horizontal edge detection",
            "Image segmentation",
            "Feature extraction"
        ]

    },


    emboss: {

        name: "Emboss",

        kernel: [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ],

        divisor: 1,

        description:
            "Creates a raised or 3D-like appearance by emphasizing directional edges.",

        formula:
            "g(x,y) = Σ K(i,j)f(x+i,y+j)",

        theory:
            "Emboss filtering highlights directional changes in intensity and creates an appearance similar to a raised surface.",

        applications: [
            "Artistic effects",
            "Texture visualization",
            "Edge enhancement"
        ]

    },


    edgeEnhance: {

        name: "Edge Enhance",

        kernel: [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ],

        divisor: 1,

        description:
            "Enhances boundaries and fine details in an image.",

        formula:
            "g(x,y) = Σ K(i,j)f(x+i,y+j)",

        theory:
            "Edge enhancement increases local contrast around boundaries, making objects and details appear sharper.",

        applications: [
            "Detail enhancement",
            "Image sharpening",
            "Boundary enhancement"
        ]

    }

};


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    document.getElementById("fileName").textContent =
        file.name;

    const img = new Image();

    img.onload = function () {

        currentImage = img;

        originalCanvas.width = img.width;

        originalCanvas.height = img.height;

        outputCanvas.width = img.width;

        outputCanvas.height = img.height;

        zoom = 1;

        updateZoom();

        originalCtx.clearRect(
            0,
            0,
            originalCanvas.width,
            originalCanvas.height
        );

        originalCtx.drawImage(
            img,
            0,
            0
        );

        originalImageData =
            originalCtx.getImageData(
                0,
                0,
                img.width,
                img.height
            );

        document.getElementById("imageSize").textContent =
            `${img.width} × ${img.height}`;

        document.getElementById("outputSize").textContent =
            `${img.width} × ${img.height}`;

        document.getElementById("statWidth").textContent =
            img.width;

        document.getElementById("statHeight").textContent =
            img.height;

        document.getElementById("statPixels").textContent =
            (img.width * img.height).toLocaleString();

        createOutput();

        showFullPixelValues();

        clearSelection();

    };

    img.src = URL.createObjectURL(file);

});


/* =========================================================
   CREATE OUTPUT IMAGE
   ========================================================= */

function createOutput() {

    if (!originalImageData) return;

    const operation =
        operations[kernelSelect.value];

    const width =
        originalImageData.width;

    const height =
        originalImageData.height;

    const src =
        originalImageData.data;

    const output =
        outputCtx.createImageData(
            width,
            height
        );

    const dst =
        output.data;


    for (let y = 1; y < height - 1; y++) {

        for (let x = 1; x < width - 1; x++) {

            let sum = 0;

            for (let ky = -1; ky <= 1; ky++) {

                for (let kx = -1; kx <= 1; kx++) {

                    const px =
                        x + kx;

                    const py =
                        y + ky;

                    const index =
                        (py * width + px) * 4;

                    const gray =
                        Math.round(
                            0.299 * src[index] +
                            0.587 * src[index + 1] +
                            0.114 * src[index + 2]
                        );

                    const kernelValue =
                        operation.kernel[ky + 1][kx + 1];

                    sum +=
                        gray * kernelValue;

                }

            }


            let value =
                sum / operation.divisor;


            if (
                operation.name.includes("Sobel") ||
                operation.name.includes("Prewitt") ||
                operation.name === "Laplacian"
            ) {
                value = Math.abs(value);
            }


            if (operation.name === "Emboss") {

                value =
                    Math.abs(value) + 128;

            }


            value =
                Math.max(
                    0,
                    Math.min(
                        255,
                        Math.round(value)
                    )
                );


            const outputIndex =
                (y * width + x) * 4;

            dst[outputIndex] =
                value;

            dst[outputIndex + 1] =
                value;

            dst[outputIndex + 2] =
                value;

            dst[outputIndex + 3] =
                255;

        }

    }


    outputCtx.putImageData(
        output,
        0,
        0
    );


    document.getElementById("outputInfo").textContent =
        `${operation.name} applied successfully to the image.`;

}


/* =========================================================
   OPERATION CHANGE
   ========================================================= */

kernelSelect.addEventListener("change", function () {

    updateOperationInformation();

    createOutput();

    if (
        selectedX !== null &&
        selectedY !== null
    ) {

        updateSelectedPixel();

    }

});


function updateOperationInformation() {

    const operation =
        operations[kernelSelect.value];

    document.getElementById(
        "operationDescription"
    ).textContent =
        operation.description;


    displayKernel();

    updateTheory();

}


/* =========================================================
   DISPLAY KERNEL
   ========================================================= */

function displayKernel() {

    const operation =
        operations[kernelSelect.value];

    let html =
        `<table class="kernel-table">`;

    operation.kernel.forEach(row => {

        html += "<tr>";

        row.forEach(value => {

            html +=
                `<td>${value}</td>`;

        });

        html += "</tr>";

    });

    html += "</table>";

    kernelDisplay.innerHTML =
        html;


    document.getElementById(
        "kernelExplanation"
    ).innerHTML =
        `<strong>${operation.name}</strong><br><br>
        ${operation.description}<br><br>
        <strong>Divisor:</strong> ${operation.divisor}`;
}


/* =========================================================
   THEORY
   ========================================================= */

function updateTheory() {

    const operation =
        operations[kernelSelect.value];

    document.getElementById(
        "theoryTitle"
    ).textContent =
        `About ${operation.name} Operator`;


    const applications =
        operation.applications
            .map(item => `<li>${item}</li>`)
            .join("");


    document.getElementById(
        "theoryContent"
    ).innerHTML = `

        <div class="theory-intro">

            <h3>💡 ${operation.name}</h3>

            <p>
                ${operation.theory}
            </p>

        </div>


        <div class="theory-grid">


            <div class="theory-box">

                <h3>📖 Definition</h3>

                <p>
                    ${operation.description}
                </p>

            </div>


            <div class="theory-box">

                <h3>📐 Formula</h3>

                <div class="formula">
                    ${operation.formula}
                </div>

            </div>


            <div class="theory-box">

                <h3>⚙️ Kernel Matrix</h3>

                <div class="formula">

                    ${operation.kernel
                        .map(row => row.join("   "))
                        .join("<br>")}

                </div>

            </div>


            <div class="theory-box">

                <h3>🚀 Applications</h3>

                <ul>
                    ${applications}
                </ul>

            </div>

        </div>


        <div class="key-idea">

            ⭐ <strong>Key Idea:</strong>

            The kernel moves over the image and performs
            multiplication and addition with neighboring
            pixel values to produce the output pixel.

        </div>
    `;
}


/* =========================================================
   ORIGINAL IMAGE CLICK
   ========================================================= */

originalCanvas.addEventListener(
    "click",
    function (event) {

        if (!originalImageData) return;


        const rect =
            originalCanvas.getBoundingClientRect();


        const scaleX =
            originalCanvas.width /
            rect.width;

        const scaleY =
            originalCanvas.height /
            rect.height;


        const x =
            Math.floor(
                (event.clientX - rect.left)
                * scaleX
            );

        const y =
            Math.floor(
                (event.clientY - rect.top)
                * scaleY
            );


        selectPixel(x, y);

    }
);


/* =========================================================
   SELECT PIXEL
   ========================================================= */

function selectPixel(x, y) {

    if (!originalImageData) return;


    if (
        x <= 0 ||
        y <= 0 ||
        x >= originalCanvas.width - 1 ||
        y >= originalCanvas.height - 1
    ) {

        return;

    }


    selectedX = x;

    selectedY = y;


    document.getElementById(
        "statSelected"
    ).textContent =
        `${x}, ${y}`;


    updateSelectionGrid(
        x,
        y
    );


    updateSelectedPixel();

}


/* =========================================================
   UPDATE SELECTION GRID
   ========================================================= */

function updateSelectionGrid(x, y) {

    const rect =
        originalCanvas.getBoundingClientRect();

    const wrapperRect =
        originalWrapper.getBoundingClientRect();


    const scaleX =
        rect.width /
        originalCanvas.width;

    const scaleY =
        rect.height /
        originalCanvas.height;


    const pixelSize =
        Math.max(
            8,
            10 * Math.min(
                scaleX,
                scaleY
            )
        );


    const gridSize =
        pixelSize * 3;


    const canvasLeft =
        rect.left -
        wrapperRect.left;

    const canvasTop =
        rect.top -
        wrapperRect.top;


    const centerX =
        canvasLeft +
        x * scaleX;

    const centerY =
        canvasTop +
        y * scaleY;


    selectionGrid.style.display =
        "block";

    selectionGrid.style.width =
        `${gridSize}px`;

    selectionGrid.style.height =
        `${gridSize}px`;

    selectionGrid.style.left =
        `${centerX - gridSize / 2}px`;

    selectionGrid.style.top =
        `${centerY - gridSize / 2}px`;

}


/* =========================================================
   GET PIXEL INFORMATION
   ========================================================= */

function getPixelInfo(x, y) {

    const data =
        originalImageData.data;

    const width =
        originalImageData.width;


    const index =
        (y * width + x) * 4;


    const r =
        data[index];

    const g =
        data[index + 1];

    const b =
        data[index + 2];


    const gray =
        Math.round(
            0.299 * r +
            0.587 * g +
            0.114 * b
        );


    return {
        r,
        g,
        b,
        gray
    };

}


/* =========================================================
   UPDATE PIXEL INSPECTOR + REGION
   ========================================================= */

function updateSelectedPixel() {

    if (
        selectedX === null ||
        selectedY === null
    ) return;


    const pixel =
        getPixelInfo(
            selectedX,
            selectedY
        );


    document.getElementById(
        "pixelX"
    ).textContent =
        selectedX;


    document.getElementById(
        "pixelY"
    ).textContent =
        selectedY;


    document.getElementById(
        "pixelR"
    ).textContent =
        pixel.r;


    document.getElementById(
        "pixelG"
    ).textContent =
        pixel.g;


    document.getElementById(
        "pixelB"
    ).textContent =
        pixel.b;


    document.getElementById(
        "pixelGray"
    ).textContent =
        pixel.gray;


    const region =
        getPixelRegion(
            selectedX,
            selectedY
        );


    displayPixelRegion(
        region
    );


    calculatePixel(
        region
    );


    document.getElementById(
        "selectedRegionTitle"
    ).textContent =
        `Selected 3×3 region around pixel (${selectedX}, ${selectedY})`;

}


/* =========================================================
   GET 3x3 REGION
   ========================================================= */

function getPixelRegion(
    centerX,
    centerY
) {

    let region = [];


    for (
        let row = -1;
        row <= 1;
        row++
    ) {

        let currentRow = [];


        for (
            let col = -1;
            col <= 1;
            col++
        ) {

            const x =
                centerX + col;

            const y =
                centerY + row;


            const pixel =
                getPixelInfo(
                    x,
                    y
                );


            currentRow.push(
                pixel.gray
            );

        }


        region.push(
            currentRow
        );

    }


    return region;

}


/* =========================================================
   DISPLAY PIXEL REGION
   ========================================================= */

function displayPixelRegion(region) {

    let html =
        `<table class="pixel-table">`;


    region.forEach(row => {

        html += "<tr>";

        row.forEach(value => {

            html +=
                `<td>${value}</td>`;

        });

        html += "</tr>";

    });


    html += "</table>";


    pixelRegion.innerHTML =
        html;

}


/* =========================================================
   CALCULATE CONVOLUTION
   ========================================================= */

function calculatePixel(region) {

    const operation =
        operations[kernelSelect.value];


    const kernel =
        operation.kernel;


    let total = 0;

    let lines = [];


    for (let r = 0; r < 3; r++) {

        for (let c = 0; c < 3; c++) {

            const pixel =
                region[r][c];

            const kernelValue =
                kernel[r][c];


            const product =
                pixel * kernelValue;


            total += product;


            lines.push(
                `<span class="calc-line">
                    ${pixel} × ${kernelValue} = ${product}
                </span>`
            );

        }

    }


    lines.push(
        `<div class="calc-total">
            Total = ${total}
        </div>`
    );


    let outputValue;


    if (
        operation.name.includes("Sobel") ||
        operation.name.includes("Prewitt") ||
        operation.name === "Laplacian"
    ) {

        outputValue =
            Math.abs(
                total /
                operation.divisor
            );

    }

    else if (
        operation.name === "Emboss"
    ) {

        outputValue =
            Math.abs(
                total /
                operation.divisor
            ) + 128;

    }

    else {

        outputValue =
            total /
            operation.divisor;

    }


    outputValue =
        Math.max(
            0,
            Math.min(
                255,
                Math.round(
                    outputValue
                )
            )
        );


    lines.push(
        `<div class="calc-formula">
            Output = ${total} / ${operation.divisor}
            = ${(
                total /
                operation.divisor
            ).toFixed(2)}
        </div>`
    );


    calculation.innerHTML =
        lines.join("");


    result.innerHTML =
        `🎯 Output Pixel = ${outputValue}`;

}


/* =========================================================
   FULL IMAGE PIXEL VALUES
   ========================================================= */

function showFullPixelValues() {

    if (!originalImageData) return;


    const width =
        originalImageData.width;

    const height =
        originalImageData.height;


    let text = "";


    for (let y = 0; y < height; y++) {

        let row = [];


        for (let x = 0; x < width; x++) {

            const pixel =
                getPixelInfo(
                    x,
                    y
                );


            row.push(
                String(
                    pixel.gray
                ).padStart(
                    3,
                    " "
                )
            );

        }


        text +=
            row.join(" ") +
            "\n";

    }


    fullPixelValues.textContent =
        text;

}


/* =========================================================
   ZOOM
   ========================================================= */

document.getElementById(
    "zoomIn"
).addEventListener(
    "click",
    function () {

        zoom =
            Math.min(
                4,
                zoom + 0.25
            );

        updateZoom();

    }
);


document.getElementById(
    "zoomOut"
).addEventListener(
    "click",
    function () {

        zoom =
            Math.max(
                0.5,
                zoom - 0.25
            );

        updateZoom();

    }
);


document.getElementById(
    "zoomReset"
).addEventListener(
    "click",
    function () {

        zoom = 1;

        updateZoom();

    }
);


function updateZoom() {

    if (!currentImage) return;


    originalCanvas.style.width =
        `${originalCanvas.width * zoom}px`;

    originalCanvas.style.height =
        `${originalCanvas.height * zoom}px`;


    document.getElementById(
        "zoomValue"
    ).textContent =
        `${Math.round(zoom * 100)}%`;


    if (
        selectedX !== null &&
        selectedY !== null
    ) {

        updateSelectionGrid(
            selectedX,
            selectedY
        );

    }

}


/* =========================================================
   CLEAR SELECTION
   ========================================================= */

function clearSelection() {

    selectedX = null;

    selectedY = null;

    selectionGrid.style.display =
        "none";


    document.getElementById(
        "statSelected"
    ).textContent =
        "—";


    document.getElementById(
        "pixelX"
    ).textContent =
        "—";

    document.getElementById(
        "pixelY"
    ).textContent =
        "—";

    document.getElementById(
        "pixelR"
    ).textContent =
        "—";

    document.getElementById(
        "pixelG"
    ).textContent =
        "—";

    document.getElementById(
        "pixelB"
    ).textContent =
        "—";

    document.getElementById(
        "pixelGray"
    ).textContent =
        "—";


    pixelRegion.innerHTML =
        "";

    calculation.innerHTML =
        "Click on the original image to calculate.";

    result.innerHTML =
        "🎯 Output Pixel = —";

}


/* =========================================================
   INITIAL DISPLAY
   ========================================================= */

updateOperationInformation();