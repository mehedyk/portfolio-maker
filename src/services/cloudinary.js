// ─────────────────────────────────────────────────────────────────────────────
// cloudinary.js
//
// Two separate upload helpers:
//   uploadToCloudinary     → IMAGES  (uses /image/upload endpoint)
//   uploadRawToCloudinary  → PDFs / DOCX  (uses /auto/upload endpoint)
//
// FIX: Changed from import.meta.env (Vite) to process.env (Create React App)
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
// Use a separate raw preset if provided; fall back to the image preset.
const RAW_PRESET = process.env.REACT_APP_CLOUDINARY_RAW_PRESET || UPLOAD_PRESET;

/**
 * Upload an IMAGE file (JPEG, PNG, WebP, GIF…) to Cloudinary.
 * Returns the secure URL string directly.
 *
 * @param {File} file
 * @returns {Promise<string>} secure_url
 */
export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'portfolio-builder');

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Image upload failed');
    }

    const data = await res.json();
    return data.secure_url;
};

/**
 * Upload a raw document (PDF, DOCX, etc.) to Cloudinary.
 * Uses the /auto/upload endpoint which handles all file types correctly.
 *
 * @param {File} file
 * @returns {Promise<string>} secure_url
 */
export const uploadRawToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', RAW_PRESET);
    formData.append('folder', 'portfolio-builder/cv');

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Document upload failed');
    }

    const data = await res.json();
    return data.secure_url;
};