/*
  Resizes an image file in the browser and returns a JPEG data URL.
  square: center-crop to a square (good for avatars).
  Result is typically 50 to 150 KB instead of several MB.
*/
export function compressImage(file, { maxSize = 512, quality = 0.85, square = false } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;

      if (square) {
        const side = Math.min(img.width, img.height);
        sx = (img.width - side) / 2;
        sy = (img.height - side) / 2;
        sw = side;
        sh = side;
      }

      const scale = Math.min(1, maxSize / Math.max(sw, sh));
      const width = Math.max(1, Math.round(sw * scale));
      const height = Math.max(1, Math.round(sh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      // white background so transparent PNGs do not turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };

    img.src = url;
  });
}