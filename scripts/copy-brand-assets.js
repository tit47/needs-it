const fs = require("fs");
const path = require("path");

const images = path.join(__dirname, "..", "Images");
const publicDir = path.join(__dirname, "..", "public");

const copies = [
  ["logo.png", "logo.png"],
  ["logo noir.PNG", "logo-dark.png"],
];

for (const [src, dest] of copies) {
  fs.copyFileSync(path.join(images, src), path.join(publicDir, dest));
}

console.log("Brand assets copied to public/");
