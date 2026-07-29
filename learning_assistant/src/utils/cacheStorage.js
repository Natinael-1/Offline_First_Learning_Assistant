const CACHE_NAME = "user-uploaded-materials";

export const getMaterialCacheUrl = (materialId) => {
  if (!materialId) return "/materials/mat_unknown";
  const idStr = String(materialId);
  const cleanId = idStr.startsWith("mat_") ? idStr : `mat_${idStr}`;
  return `/materials/${cleanId}`;
};

/*** Saves a PDF file (Base64 string or Blob) into Cache Storage.
 *
 * @param {string|number} materialId - Unique ID of the material
 * @param {string|Blob} fileData - Base64 Data URL or Blob object
 * @returns {Promise<boolean>} True if successfully cached
 */
export async function savePDFToCache(materialId, fileData) {
  if (!materialId || !fileData) return false;

  try {
    const cache = await caches.open(CACHE_NAME);
    let responseToCache;

    // 1. If fileData is a Base64 string ("data:application/pdf;base64,...")
    if (typeof fileData === "string" && fileData.startsWith("data:")) {
      const parts = fileData.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
      const binaryStr = atob(parts[1]);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mime });
      responseToCache = new Response(blob, {
        headers: {
          "Content-Type": mime,
          "Content-Length": blob.size.toString(),
        },
      });
    }
    // 2. If fileData is already a binary Blob
    else if (fileData instanceof Blob) {
      responseToCache = new Response(fileData, {
        headers: {
          "Content-Type": fileData.type || "application/pdf",
          "Content-Length": fileData.size.toString(),
        },
      });
    } else {
      return false;
    }

    // Write to the user-uploaded-materials cache bucket
    await cache.put(getMaterialCacheUrl(materialId), responseToCache);
    return true;
  } catch (err) {
    console.error(
      `[CacheStorage] Failed to save material #${materialId}:`,
      err,
    );
    return false;
  }
}

/**
 * Retrieves a cached PDF from Cache Storage and returns a browser Blob URL.
 *
 * @param {string|number} materialId - Unique ID of the material
 * @returns {Promise<string|null>} Blob URL (e.g. "blob:http://...") or null if not found
 */
export async function getPDFFromCache(materialId) {
  if (!materialId) return null;

  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(getMaterialCacheUrl(materialId));

    if (!cachedResponse) return null;

    const blob = await cachedResponse.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error(
      `[CacheStorage] Failed to read material #${materialId}:`,
      err,
    );
    return null;
  }
}

/**
 * Removes a cached material from Cache Storage.
 *
 * @param {string|number} materialId - Unique ID of the material
 * @returns {Promise<boolean>}
 */
export async function deletePDFFromCache(materialId) {
  if (!materialId) return false;

  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(getMaterialCacheUrl(materialId));
  } catch (err) {
    console.error(
      `[CacheStorage] Failed to delete material #${materialId}:`,
      err,
    );
    return false;
  }
}
