const fs = require('fs');

const content = `"use client";

import { useState, useRef } from "react";
import { Paperclip, X, FileIcon, Loader2 } from "lucide-react";

export type Attachment = {
  filename: string;
  contentType: string;
  content: string; // base64 encoded
  size: number;
};

interface AttachmentPickerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export default function AttachmentPicker({ attachments, onChange }: AttachmentPickerProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    const newAttachments = [...attachments];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // reader.result is like "data:image/png;base64,iVBORw0KGgo..."
          const result = reader.result as string;
          const base64data = result.split(',')[1];
          resolve(base64data);
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        content: base64,
        size: file.size,
      });
    }

    onChange(newAttachments);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    const next = [...attachments];
    next.splice(index, 1);
    onChange(next);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-[#F9FAFB] border border-[#EAECF0] dark:bg-slate-800 dark:border-slate-700 px-3 py-1.5 rounded-md text-sm text-[#344054] dark:text-slate-300">
              <FileIcon size={14} className="text-[#98A2B3]" />
              <span className="truncate max-w-[150px]">{att.filename}</span>
              <span className="text-xs text-[#98A2B3]">({formatSize(att.size)})</span>
              <button 
                type="button" 
                onClick={() => removeAttachment(idx)}
                className="ml-1 text-[#98A2B3] hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center gap-2 text-sm text-[#475467] dark:text-slate-400 hover:text-[#1D2939] dark:hover:text-slate-200 cursor-pointer transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          Attach Files
        </label>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('apps/web/src/app/dashboard/emailing/components/AttachmentPicker.tsx', content);
console.log("AttachmentPicker component created");
