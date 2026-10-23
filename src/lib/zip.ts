import JSZip from "jszip";
import { ZIP_ICONS_FOLDER } from "../config/app";
import { EXTENSION_FILES, EXTENSION_ICONS_BASE64 } from "../extensionFiles";

/** 拡張機能一式（ソース＋アイコン）をZIPにまとめる */
export async function buildExtensionZip(): Promise<Blob> {
  const zip = new JSZip();

  for (const file of EXTENSION_FILES) {
    zip.file(file.path, file.content);
  }

  const iconsFolder = zip.folder(ZIP_ICONS_FOLDER);
  if (iconsFolder) {
    for (const [name, b64] of Object.entries(EXTENSION_ICONS_BASE64)) {
      iconsFolder.file(name, b64, { base64: true });
    }
  }

  return zip.generateAsync({ type: "blob" });
}
