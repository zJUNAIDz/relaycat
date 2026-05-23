import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import React from "react";
import { cn } from "../utils/cn";

interface FileUploadProps {
  type: "messageFile" | "image";
  value: string;
  defaultValue?: string;
  onChange: (previewUrl: string, file: File | null) => void;
}

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const FileUpload: React.FC<FileUploadProps> = ({ type, value, defaultValue, onChange }) => {
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (!selectedFile) {
      onChange(defaultValue || "", null);
      return;
    }

    // Handle PDF files
    if (selectedFile.type === "application/pdf" && type === "messageFile") {
      const previewUrl = URL.createObjectURL(selectedFile);
      onChange(previewUrl, selectedFile);
      return;
    }

    // Handle allowed image files
    if (!allowedImageTypes.includes(selectedFile.type)) {
      alert("Only these image files (png, jpeg, jpg, gif) or PDF files are allowed");
      onChange(defaultValue || "", null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    onChange(previewUrl, selectedFile);
  };

  // Render PDF preview locally
  if (file && file.type === "application/pdf") {
    return (
      <div className="relative mt-2">
        <embed src={value} type="application/pdf" width="100%" height="500px" />
        {value !== defaultValue && (
          <button
            type="button"
            title="Remove PDF"
            className="bg-rose-500 text-white text-sm rounded-full absolute top-2 right-2"
            onClick={() => {
              setFile(null);
              onChange(defaultValue || "", null)
            }}
          >
            <X />
          </button>
        )}
      </div>
    );
  }

  // Render image preview
  return (
    <div className="flex flex-col justify-center items-center gap-y-2">
      <div className={cn(
        "relative h-20 w-20",
        type === "messageFile" && "h-60 w-60",
      )}>
        <Image
          fill
          src={value}
          alt="Uploaded Image"
          className={type === "messageFile" ? "rounded-none" : "rounded-full"}
          unoptimized
        />
        {value !== defaultValue && (
          <button
            type="button"
            title="Remove Image"
            className="bg-rose-500 text-white text-sm rounded-full absolute top-0 right-0"
            onClick={() => onChange(defaultValue || "", null)}
          >
            <X />
          </button>
        )}
      </div>
      <div>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif, application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileUpload"
        />
        <Button
          type="button"
          onClick={() => document.getElementById("fileUpload")?.click()}
        >
          Upload File
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
