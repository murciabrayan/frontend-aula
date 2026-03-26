const IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
export const IMAGE_MAX_SIZE_MB = 3;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;

const hasAllowedExtension = (fileName: string) => {
  const loweredName = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((extension) => loweredName.endsWith(extension));
};

export const validateImageFile = (file: File) => {
  const validMimeType = IMAGE_MIME_TYPES.includes(file.type);
  const validExtension = hasAllowedExtension(file.name);

  if (!validMimeType && !validExtension) {
    return "Solo se permiten imagenes JPG, JPEG o PNG.";
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return `La imagen supera el maximo permitido de ${IMAGE_MAX_SIZE_MB} MB.`;
  }

  return null;
};

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";
