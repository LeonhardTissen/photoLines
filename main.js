const fs = require('fs');
const path = require('path');
const { Image } = require('canvas');

const sourceImagePath = 'images/day1nonight';

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
const { createCanvas } = require('canvas');
const { randomUUID } = require('crypto');
const canvas = createCanvas(1, 1);
const ctx = canvas.getContext('2d');

async function main() {
	const sourceImage = await loadImageData(sourceImagePaths[0]);

	canvas.width = sourceImage.width;
	canvas.height = sourceImage.height;

	ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

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

		// const randomXpos = Math.floor(Math.random() * sourceImage.width);
		// ctx.drawImage(img, randomXpos, 0, 1, sourceImage.height, randomXpos, 0, 1, sourceImage.height);
		ctx.drawImage(img, xPos, 0, 1, sourceImage.height, xPos, 0, 1, sourceImage.height);
		// ctx.drawImage(img, 0, yPos, sourceImage.width, 1, 0, yPos, sourceImage.width, 1);
	}

	// Save the canvas as a new image
	const outputImagePath = `output_${randomUUID().substring(0, 8)}.png`;
	const out = fs.createWriteStream(outputImagePath);
	const stream = canvas.createPNGStream();
	stream.pipe(out);

	out.on('finish', () =>  console.log('The PNG file was created.'));
}

main();
