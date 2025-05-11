import { useState } from "react";
import { CreateButton } from "../ui/create-button";
import { FileText, Image, FolderPlus, Plus } from "lucide-react";

export default function CreateButtonExample() {
  const [createdItems, setCreatedItems] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Action handlers
  const createDocument = () => {
    setCreatedItems(prev => [...prev, "New Document"]);
  };

  const createFolder = () => {
    // In a real app, you might open a modal to get the folder name
    const folderName = prompt("Enter folder name");
    if (folderName) {
      setCreatedItems(prev => [...prev, `Folder: ${folderName}`]);
    }
  };

  // File upload handlers
  const handleImageUpload = (file: File) => {
    // In a real application, you would upload the file to a server
    setUploadedFiles(prev => [...prev, `Image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
  };

  const handleDocumentUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, `Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Create Button Example</h1>

      <div className="flex gap-4">
        {/* Basic usage */}
        <CreateButton 
          buttonText="Create New" 
          buttonIcon={<Plus size={18} />}
          headerText="Create New Item"
          popoverWidth="w-64"
          items={[
            {
              id: "document",
              label: "Blank Document",
              icon: <FileText size={16} />,
              action: createDocument
            },
            {
              id: "folder",
              label: "New Folder",
              icon: <FolderPlus size={16} />,
              action: createFolder
            },
            {
              id: "upload-image",
              label: "Upload Image",
              icon: <Image size={16} />,
              isFileUpload: true,
              acceptFileTypes: "image/*",
              onFileSelect: handleImageUpload
            },
            {
              id: "upload-document",
              label: "Upload Document",
              icon: <FileText size={16} />,
              isFileUpload: true,
              acceptFileTypes: ".pdf,.docx,.txt",
              onFileSelect: handleDocumentUpload
            }
          ]}
        />

        {/* Custom styling example */}
        <CreateButton 
          buttonText="Add Media" 
          buttonIcon={<Image size={18} />}
          buttonClassName="bg-blue-500 hover:bg-blue-600"
          headerText="Upload Media"
          popoverAlign="center"
          items={[
            {
              id: "upload-image",
              label: "Upload Image",
              icon: <Image size={16} />,
              isFileUpload: true,
              acceptFileTypes: "image/*",
              onFileSelect: handleImageUpload
            }
          ]}
        />
      </div>

      {/* Display created items */}
      {createdItems.length > 0 && (
        <div className="mt-8 border rounded-md p-4">
          <h2 className="font-medium mb-2">Created Items:</h2>
          <ul className="list-disc list-inside">
            {createdItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 border rounded-md p-4">
          <h2 className="font-medium mb-2">Uploaded Files:</h2>
          <ul className="list-disc list-inside">
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}