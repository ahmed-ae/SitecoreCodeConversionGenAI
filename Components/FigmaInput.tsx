import React from 'react';

interface FigmaInputProps {
  fileId: string;
  setFileId: React.Dispatch<React.SetStateAction<string>>;
  nodeId: string;
  setNodeId: React.Dispatch<React.SetStateAction<string>>;
}

const FigmaInput: React.FC<FigmaInputProps> = ({ fileId, setFileId, nodeId, setNodeId }) => {
  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileId">
          Figma File ID
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="fileId"
          type="text"
          placeholder="Enter Figma File ID"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nodeId">
          Figma Node ID
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="nodeId"
          type="text"
          placeholder="Enter Figma Node ID"
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FigmaInput;