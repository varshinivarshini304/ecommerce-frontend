const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, '..', 'assets_raw');
const outputDir = path.join(__dirname, '..', 'assets', 'images');
const sizes = [400, 800, 1200];

async function ensureDir(dir) {
  return fs.promises.mkdir(dir, { recursive: true });
}

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  const inputPath = path.join(inputDir, file);

  for (const size of sizes) {
    const outJpg = path.join(outputDir, `${name}-${size}.jpg`);
    const outWebp = path.join(outputDir, `${name}-${size}.webp`);

    try {
      await sharp(inputPath)
        .resize({ width: size })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outJpg);

      await sharp(inputPath)
        .resize({ width: size })
        .webp({ quality: 75 })
        .toFile(outWebp);

      console.log(`Generated: ${path.relative(process.cwd(), outJpg)} and ${path.relative(process.cwd(), outWebp)}`);
    } catch (err) {
      console.error('Error processing', inputPath, err);
    }
  }
}

async function run() {
  if (!fs.existsSync(inputDir)) {
    console.warn('No source images found. Create an `assets_raw` folder and add PNG/JPG images to be processed.');
    console.warn(`Source path: ${inputDir}`);
    return;
  }

  await ensureDir(outputDir);

  const files = await fs.promises.readdir(inputDir);
  const images = files.filter(f => /\.(jpe?g|png)$/i.test(f));
  if (!images.length) {
    console.warn('No images found in assets_raw. Add .jpg/.png files and rerun `npm run images:build`.');
    return;
  }

  for (const file of images) {
    // eslint-disable-next-line no-await-in-loop
    await processImage(file);
  }

  console.log('Image build complete. Outputs are in assets/images');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
