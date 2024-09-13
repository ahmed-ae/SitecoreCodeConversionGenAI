import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  onFileChange: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await processFile(selectedFile)
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
         await processFile(pastedFile)
        }
        break;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await processFile(droppedFile)
    }
  };

  const handleDragOver = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const compressedFile = await compressImage(file);
    setFile(compressedFile);
    onFileChange(compressedFile);
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  };
  
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      return file; // Return original file if compression fails
    }
  };
  return (
    <div
      className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 mb-4"
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
    >
      <p className="mt-6 text-sm text-gray-400 text-center">
        Upload an image/wireframe/screenshot for your component design
        to convert it into Sitecore JSS (react) component.
      </p>
      {imagePreview ? (
        <div className="mb-4 flex-grow flex items-center justify-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full h-auto max-h-[calc(100%-2rem)] rounded-lg"
          />
        </div>
      ) : (
        <Upload className="w-24 h-24 text-gray-400 mb-8" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
        ref={fileInputRef}
      />
      <label
        htmlFor="image-upload"
        className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
      >
        {file ? "Change Image" : "Upload Image"}
      </label>
      {file && (
        <p className="mt-4 text-sm text-gray-400">{file.name}</p>
      )}
      <p className="mt-6 text-sm text-gray-400 text-center">
        Or <b>drag / paste</b> an image here.
      </p>
    </div>
  );
};

export default ImageUpload;