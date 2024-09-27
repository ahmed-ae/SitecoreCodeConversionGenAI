import React, { useRef, useState } from "react";
import { Upload, FileJson } from "lucide-react";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  onFileChange: (file: File) => void;
  disableJsonUpload: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileChange, disableJsonUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isJsonFile, setIsJsonFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await processFile(selectedFile);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1 || (!disableJsonUpload && items[i].type === "application/json")) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          await processFile(pastedFile);
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
      await processFile(droppedFile);
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
    let validFile = true;
    if (!disableJsonUpload && file.type === "application/json") {
      setIsJsonFile(true);
      setFile(file);
      setImagePreview(null);
    } else if (file.type.startsWith("image/")) {
      setIsJsonFile(false);
      file = await compressImage(file);
      setFile(file);
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Invalid file type
      validFile = false;
      return;
    }
    if(validFile)
    {
      onFileChange(file);
    }
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
      className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-4 ${
        file ? 'bg-red-100 border-red-300' : 'border-gray-600'
      }`}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
    >
      {file ? (
        <p className="text-red-600 font-semibold mb-4">File uploaded successfully!</p>
      ) : (
        <p className="mt-6 text-sm text-gray-400 text-center">
          Upload an image/wireframe/screenshot{!disableJsonUpload && " or JSON file"} for your component design.
        </p>
      )}
      {imagePreview ? (
        <div className="mb-4 flex-grow flex items-center justify-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full h-auto max-h-[calc(100%-2rem)] rounded-lg"
          />
        </div>
      ) : isJsonFile && file ? (
        <div className="flex flex-col items-center">
          <FileJson className="w-24 h-24 text-red-400 mb-2" />
          <p className="text-red-600 font-semibold">JSON file uploaded</p>
        </div>
      ) : (
        <Upload className="w-24 h-24 text-gray-400 mb-8" />
      )}
      <input
        type="file"
        accept={disableJsonUpload ? "image/*" : "image/*,application/json"}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        ref={fileInputRef}
      />
      <label
        htmlFor="file-upload"
        className="bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto"
      >
        {file ? "Change File" : "Upload File"}
      </label>
      {file && <p className="mt-4 text-sm text-gray-400">{file.name}</p>}
      <p className="mt-6 text-sm text-gray-400 text-center">
        Or <b>drag / paste</b> an image{!disableJsonUpload && " or JSON file"} here.
      </p>
    </div>
  );
};

export default ImageUpload;
