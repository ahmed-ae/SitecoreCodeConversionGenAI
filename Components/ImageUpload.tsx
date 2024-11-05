import React, { useRef, useState } from "react";
import { Upload, FileJson, Loader } from "lucide-react";
import imageCompression from "browser-image-compression";

interface Asset {
  name: string;
  imageUrl: string;
}

interface ImageUploadProps {
  onFileChange: (file: File) => void;
  disableJsonUpload: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileChange,
  disableJsonUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isJsonFile, setIsJsonFile] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractAssets = (node: any): Asset[] => {
    let extractedAssets: Asset[] = [];

    // Check current node for assets
    if (node.convertedToImage && node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === "IMAGE" && fill.imageFullUrl) {
        extractedAssets.push({
          name: node.name || "Unnamed Asset",
          imageUrl: fill.imageFullUrl,
        });
      }
    }

    // Recursively check children if they exist
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        extractedAssets = [...extractedAssets, ...extractAssets(child)];
      });
    }

    return extractedAssets;
  };

  const processNodes = (data: any) => {
    let allAssets: Asset[] = [];

    if (data.nodes) {
      Object.values(data.nodes).forEach((node: any) => {
        allAssets = [...allAssets, ...extractAssets(node)];
      });
    }

    return allAssets;
  };

  const processFile = async (file: File) => {
    let validFile = true;
    setIsProcessing(true);
    setAssets([]); // Reset assets when processing new file

    try {
      if (!disableJsonUpload && file.type === "application/json") {
        setIsJsonFile(true);
        setFile(file);

        // Read and parse JSON file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            const screenshot = extractComponentScreenshot(jsonData);
            const extractedAssets = processNodes(jsonData);

            setAssets(extractedAssets);

            if (screenshot) {
              setImagePreview(screenshot);
            } else {
              setImagePreview(null);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            setImagePreview(null);
          }
        };
        reader.readAsText(file);
      } else if (file.type.startsWith("image/")) {
        setIsJsonFile(false);
        const compressedFile = await compressImage(file);
        setFile(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } else {
        validFile = false;
      }
      if (validFile) {
        onFileChange(file);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      validFile = false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Rest of the existing helper functions remain the same
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type.indexOf("image") !== -1 ||
        (!disableJsonUpload && items[i].type === "application/json")
      ) {
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
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  function extractComponentScreenshot(data: any) {
    if (!data || !data.nodes) {
      return null;
    }

    const nodes = data.nodes;
    const nodeKeys = Object.keys(nodes);

    if (nodeKeys.length === 0) {
      return null;
    }

    const firstNodeKey = nodeKeys[0];
    const firstNode = nodes[firstNodeKey];

    if (!firstNode || !firstNode.hasOwnProperty("componentScreenshot")) {
      return null;
    }

    return firstNode.componentScreenshot;
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-4 ${
          file ? "bg-gray-500 border-gray-200" : "border-gray-600"
        }`}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        tabIndex={0}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader className="w-24 h-24 text-red-400 mb-2 animate-spin" />
            <p className="text-white-600 font-semibold">Processing file...</p>
          </div>
        ) : (
          <>
            {file ? (
              <p className="text-white-600 font-semibold mb-4">
                Ready to generate code
              </p>
            ) : (
              <p className="mt-6 text-sm text-gray-400 text-center">
                Upload an image/wireframe/screenshot
                {!disableJsonUpload && " or JSON file"} for your component
                design.
              </p>
            )}

            {!isProcessing && (
              <>
                {imagePreview ? (
                  <div className="mb-4 flex-grow flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-[calc(100%-2rem)] rounded-lg"
                    />
                  </div>
                ) : isJsonFile && file ? (
                  <FileJson className="w-24 h-24 text-red-400 mb-2" />
                ) : (
                  <Upload className="w-24 h-24 text-gray-400 mb-8" />
                )}
              </>
            )}

            <input
              type="file"
              accept={
                disableJsonUpload ? "image/*" : "image/*,application/json"
              }
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              ref={fileInputRef}
            />
            <label
              htmlFor="file-upload"
              className={`bg-red-400 hover:bg-red-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 text-sm w-full sm:w-auto ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {file ? "Change File" : "Upload File"}
            </label>
            {file && <p className="mt-4 text-sm text-gray-400">{file.name}</p>}
            <p className="mt-6 text-sm text-gray-400 text-center">
              Or <b>drag / paste</b> an image
              {!disableJsonUpload && " or JSON file"} here.
            </p>
          </>
        )}
      </div>

      {/* Assets Table with Previews */}
      {assets.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2 text-gray-200">
            Assets Found
          </h3>
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left text-gray-200">Preview</th>
                <th className="px-4 py-2 text-left text-gray-200">
                  Asset Name
                </th>
                <th className="px-4 py-2 text-left text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="px-4 py-2">
                    <div className="w-16 h-16 relative bg-gray-900 rounded overflow-hidden">
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{asset.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <a
                        href={asset.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-400 hover:bg-red-300 text-gray-800 px-3 py-1 rounded-md transition duration-300 text-sm w-full sm:w-auto"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
