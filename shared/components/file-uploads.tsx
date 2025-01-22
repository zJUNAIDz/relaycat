import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import React from "react";

interface FileUploadProps {
  value: string;
  onChange: (previewUrl: string, file: File | null) => void;
}
const FileUpload: React.FC<FileUploadProps> = ({ value, onChange }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only image files(png, jpeg, jpg, gif) are allowed");
      return;
    }

    //* Handle file preview and upload
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl, file);
  };

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center gap-y-2">
        <div className="relative h-20 w-20">
          <Image
            fill
            src={value}
            alt="Uploaded Server Image"
            className="rounded-full"
            unoptimized
          />
          <button
            type="button"
            title="remove image"
            className="bg-rose-500 text-white text-sm rounded-full absolute top-0 right-0"
            onClick={() => onChange("", null)}
          >
            <X />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/gif"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileUpload"
      />
      <Button
        type="button"
        onClick={() => document.getElementById("fileUpload")?.click()}
      >
        Upload Image
      </Button>
    </div>
  );
};
export default FileUpload;
