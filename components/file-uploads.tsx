"use client"

import { UploadDropzone } from "@/lib/utils";
import "@uploadthing/react/styles.css";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  endpoint: "messageFile" | "serverImage"
  value: string;
  onChange: (url?: string) => void;
}
const FileUpload: React.FC<FileUploadProps> = ({
  endpoint,
  value,
  onChange
}) => {
  const fileType = value.split(".").pop();
  //* check if it is pdf (or else it would be image only)
  if (fileType != "pdf" && value != "") {
    return (
      <div className="flex flex-col justify-center items-center gap-y-2">
        <div className="relative h-20 w-20">
          <Image
            fill
            src={value}
            alt="Uploaded Server Image"
            className="rounded-full"
          />
          <button
            type="button"
            title="remove image"
            className="bg-rose-500 text-white text-sm rounded-full absolute top-0 right-0"
            onClick={() => onChange("")}
          >
            <X />
          </button>
        </div>
      </div>
    )
  }
  return ( 
    <div>
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => onChange(res?.[0].url)}
        onUploadError={(err) => console.error(err)}
      />
    </div>
  )
}
export default FileUpload;