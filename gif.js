const fs = require('fs');
const path = require('path');
const { Image } = require('canvas');
const GIFEncoder = require('gifencoder');
const { createCanvas } = require('canvas');
const { randomUUID } = require('crypto');

const sourceImagePath = 'images/day2';

// Get all image names from the source folder
const sourceImageNames = fs.readdirSync(sourceImagePath);
const sourceImagePaths = sourceImageNames.map(name => path.join(sourceImagePath, name));

async function loadImageData(path) {
	const data = await fs.promises.readFile(path);
	const img = new Image();
	img.src = data;
	return img;
}

// Create canvas with the same size as the source image
const c = [];
for (let i = 0; i < 64; i++) {
	const cvs = createCanvas(1, 1);
	const ctx = cvs.getContext('2d');
	c.push({ cvs, ctx });
}

async function main() {
	const sourceImage = await loadImageData(sourceImagePaths[0]);

	c.forEach(({ cvs, ctx }) => {
		cvs.width = sourceImage.width;
		cvs.height = sourceImage.height;
		ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);
	});

	let lastXpos = 0;

	for (let i = 1; i < sourceImagePaths.length; i++) {
		const xPos = Math.floor(sourceImage.width / sourceImagePaths.length * i);
		// const yPos = Math.floor(sourceImage.height / sourceImagePaths.length * i);
		if (xPos === lastXpos) {
			continue;
		}
		lastXpos = xPos;

		const img = await loadImageData(sourceImagePaths[i]);

		console.log(`Processing image ${i} (${sourceImagePaths[i]}) at x: ${xPos}`);

		for (let j = 0; j < c.length; j++) {
			const { ctx } = c[j];
			const x = (xPos + j * 10) % sourceImage.width;
			ctx.drawImage(img, x, 0, 1, sourceImage.height, x, 0, 1, sourceImage.height);
		}
	}

	// Create gif from canvases
	const encoder = new GIFEncoder(sourceImage.width, sourceImage.height);
	const outputImagePath = `output_${randomUUID().substring(0, 8)}.gif`;
	const out = fs.createWriteStream(outputImagePath);
	encoder.createReadStream().pipe(out);
	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(20);
	encoder.setQuality(10);
	for (let i = 0; i < c.length; i++) {
		const { cvs } = c[i];
		encoder.addFrame(cvs.getContext('2d'));
	}
	encoder.finish();

	out.on('finish', () => console.log('The GIF file was created.'));
}

main();
