import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import {
  UploadCloud,
  FileText,
  X,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import Button from './Button';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.webp';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ReceiptUploader({
  value = '',
  onChange,
  userId,
  disabled = false,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [storageRefPath, setStorageRefPath] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);

  const fileInputRef = useRef(null);

  // Sync internal preview if value changes externally
  React.useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const validateFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return false;

    if (!ALLOWED_TYPES.includes(selectedFile.type.toLowerCase())) {
      setError('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.');
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit. (Selected: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    const localPreviewUrl = URL.createObjectURL(selectedFile);
    setPreview(localPreviewUrl);

    // Auto-upload if userId is provided
    if (userId) {
      uploadImage(selectedFile);
    }
  };

  const uploadImage = (fileToUpload) => {
    if (!userId || !fileToUpload) return;

    setUploading(true);
    setProgress(0);
    setError('');

    // Generate user-specific path: receipts/{userId}/{timestamp}_{cleanFileName}
    const sanitizedFileName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `receipts/${userId}/${Date.now()}_${sanitizedFileName}`;
    const fileRef = ref(storage, path);
    setStorageRefPath(path);

    const uploadTask = uploadBytesResumable(fileRef, fileToUpload);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        console.error('Receipt upload error:', err);
        setError('Upload failed. Please check your storage connection and try again.');
        setUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPreview(downloadUrl);
          setUploading(false);
          if (onChange) {
            onChange(downloadUrl);
          }
        } catch (err) {
          console.error('Error getting download URL:', err);
          setError('Failed to retrieve file download URL.');
          setUploading(false);
        }
      }
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = async () => {
    if (disabled || uploading) return;

    // Optional delete from storage if reference path exists
    if (storageRefPath) {
      try {
        const fileRef = ref(storage, storageRefPath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete storage file object:', err);
      }
    }

    setFile(null);
    setPreview('');
    setStorageRefPath('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onChange) onChange('');
  };

  const handleTriggerSelect = () => {
    if (fileInputRef.current && !disabled && !uploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Receipt Attachment (JPG, PNG, WEBP)
      </label>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Drop Zone / Active Preview */}
      {!preview && !uploading ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleTriggerSelect}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            disabled
              ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Click or drag & drop receipt image
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports JPG, JPEG, PNG, WEBP (Max 5MB)
          </p>
        </div>
      ) : uploading ? (
        /* Progress Indicator */
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading receipt to secure storage ({progress}%)</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 group">
              <img
                src={preview}
                alt="Receipt Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Could not load image preview.')}
              />
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="View image"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Receipt Attached</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Stored in Firebase Storage
              </p>
            </div>
          </div>

          {/* Action buttons: Replace & Remove */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowLightbox(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View full size"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTriggerSelect}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              title="Replace image"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete receipt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Full Image Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl p-2 border border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={preview}
              alt="Receipt Full View"
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
            <div className="pt-2 text-center">
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Original Image Link
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
