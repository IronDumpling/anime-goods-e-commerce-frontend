import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { ImageOff, Upload, X } from 'lucide-react';
import { uploadToS3 } from '@/lib/s3Utils';

interface ImageUploadProps {
  onUploadComplete: (fileUrlMap: Record<string, string>) => void;
  label?: string;
  mode?: 'single' | 'multiple';
}

export function ImageUpload({
  onUploadComplete,
  label = "Upload Image",
  mode = 'multiple'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Convert FileList to Array and filter for image files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please upload image files only');
      return;
    }

    // If mode is single, only take the first file
    const filesToAdd = mode === 'single' ? [imageFiles[0]] : imageFiles;

    // Create preview URLs for each file
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));

    // Update state
    if (mode === 'single') {
      // In single mode, replace existing files instead of adding
      // Revoke existing object URLs to prevent memory leaks
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles(filesToAdd);
      setPreviewUrls(newPreviewUrls);
    } else {
      // In multiple mode, add to existing files
      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    handleFilesSelect(e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files);
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (files?: File[]) => {
    const filesToUpload = files || selectedFiles;
    if (filesToUpload.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);

      // Create a map to store file name to URL mapping
      const fileUrlMap: Record<string, string> = {};

      // Upload files sequentially to maintain order and create the mapping
      for (const file of filesToUpload) {
        const imageUrl = await uploadToS3(file);
        fileUrlMap[file.name] = imageUrl;
      }

      onUploadComplete(fileUrlMap);

      // Clear all preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          multiple={mode === 'multiple'}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="mb-1 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG or GIF {mode === 'multiple' ? '(Multiple files allowed)' : '(Single file only)'}</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium mb-2">
            {mode === 'single' ? 'Selected file:' : `Selected files (${selectedFiles.length}):`}
          </p>
          <div className="space-y-2 mb-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-2">
                    {previewUrls[index] && (
                      <img
                        src={previewUrls[index]}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={() => handleUpload()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : mode === 'single' ? 'Upload image to S3' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} to S3`}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}