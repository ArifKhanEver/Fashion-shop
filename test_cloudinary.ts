import { config } from 'dotenv';
config();
import { cloudinary, CLOUDINARY_FOLDERS } from './src/lib/cloudinary.ts';
(async () => {
  try {
    const res = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', { folder: CLOUDINARY_FOLDERS.variants });
    console.log(res);
  } catch (e) {
    console.error('ERROR:', e);
  }
})();
