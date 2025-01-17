/*
 * A filter takes a source img object and returns a BlobURL of the filtered image.
 * Intended to be used as a preprocessor for input images.
 */

// eslint-disable-next-line no-unused-vars
const FILTERS = [
  { fn: filterChromakey, label: "クロマキー透過 (左上から)" },
];

function filterChromakey(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const baseColor = [data[0], data[1], data[2]];

  const queue = [
    [0, 0],
    [canvas.width - 1, 0],
    [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
  ];

  while (queue.length) {
    const item = queue.shift();
    if (item[0] >= canvas.width || item[1] >= canvas.height || item[0] < 0 || item[1] < 0) {
      continue;
    }

    const ix = (item[1] * canvas.width + item[0]) * 4;
    if (!data[ix + 3]) continue;

    const norm = Math.hypot(
      data[ix] - baseColor[0],
      data[ix + 1] - baseColor[1],
      data[ix + 2] - baseColor[2],
    );
    if (norm < 90) {
      data[ix + 3] = 0;
      queue.push(
        [item[0] - 1, item[1] - 1],
        [item[0], item[1] - 1],
        [item[0] + 1, item[1] - 1],
        [item[0] - 1, item[1]],
        [item[0] + 1, item[1]],
        [item[0] - 1, item[1] + 1],
        [item[0], item[1] + 1],
        [item[0] + 1, item[1] + 1],
      );
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
