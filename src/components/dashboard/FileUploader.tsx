import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";
import styles from "./index.module.css";
import { useUploadDeliverable } from "@/hooks/useProject/export";

const STORAGE_KEY = "signoff_upload_draft_file";

interface FileUploaderProps {
  token?: string;
}

// --- Helper: Convert File to Base64 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- Helper: Convert Base64 back to File ---
const base64ToFile = (
  base64: string,
  fileName: string,
  mimeType: string
): File => {
  const arr = base64.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mimeType });
};

export const FileUploader = ({ token }: FileUploaderProps) => {
  const { uploadDeliverable, isUploading, uploadProgress } =
    useUploadDeliverable(token);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  // 1. Load from LocalStorage on Mount
  useEffect(() => {
    const loadDraft = async () => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const { name, type, base64 } = JSON.parse(savedData);
          const restoredFile = base64ToFile(base64, name, type);

          setFile(restoredFile);

          // Re-generate preview URL
          if (type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(restoredFile));
          }
        } catch (e) {
          console.error("Failed to restore file draft", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsHydrating(false);
    };

    loadDraft();
  }, []);

  // 2. Cleanup Preview URL on unmount/change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 3. Handle Saving to LocalStorage
  const saveToStorage = async (selectedFile: File) => {
    // Safety: LocalStorage has a 5MB limit.
    // We limit caching to files under 4MB to prevent quota errors.
    if (selectedFile.size > 4 * 1024 * 1024) {
      console.warn("File too large to persist in local storage");
      return;
    }

    try {
      const base64 = await fileToBase64(selectedFile);
      const dataToSave = {
        name: selectedFile.name,
        type: selectedFile.type,
        base64: base64,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Error saving draft", e);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setFile(selected);
    saveToStorage(selected); // Trigger save

    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const startUpload = async () => {
    // We don't need to pass 'token' here anymore, the hook has it.
    if (file && token) {
      try {
        console.log("Uploading:", file.name);

        // 1. Wait for upload to finish
        await uploadDeliverable(file);

        // 2. Success! Clear the draft from UI and LocalStorage
        reset();
      } catch (err) {
        // 3. Error is handled in the hook (toast), but we catch here
        // to prevent 'reset()' from running so the user doesn't lose their file.
        console.log("Upload prevented reset due to error", err);
      }
    }
  };
  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    localStorage.removeItem(STORAGE_KEY); // Clear storage
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [], "application/pdf": [] },
  });

  // Prevent UI flicker while checking local storage
  if (isHydrating) return null;

  /* ================= Uploading State ================= */
  if (isUploading) {
    return (
      <div className={styles.uploading}>
        <Loader2 className={styles.spinner} size={32} />
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className={styles.uploadText}>Uploading... {uploadProgress}%</p>
      </div>
    );
  }

  /* ================= Preview State ================= */
  if (file) {
    return (
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <p className={styles.fileName}>{file.name}</p>
          <button onClick={reset} className={styles.removeBtn}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.previewBody}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.pdfPreview}>
              <FileText size={32} />
              <span>PDF Preview</span>
            </div>
          )}
        </div>

        <button onClick={startUpload} className={styles.uploadBtn}>
          Upload File
        </button>
      </div>
    );
  }

  /* ================= Dropzone ================= */
  return (
    <div
      {...getRootProps()}
      className={`${styles.dropzone} ${
        isDragActive ? styles.active : styles.inactive
      }`}
    >
      <input {...getInputProps()} />
      <div className={styles.iconWrapper}>
        <UploadCloud size={24} />
      </div>
      <h3 className={styles.title}>Upload Deliverable</h3>
      <p className={styles.subtitle}>Drag & drop or click to browse</p>
      <p className={styles.helper}>PDF, PNG, JPG (Max 50MB)</p>
    </div>
  );
};
