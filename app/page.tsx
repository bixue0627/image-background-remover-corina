"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

type ProcessingState = "idle" | "processing" | "success" | "error";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (file: File) => {
    setErrorMessage("");
    
    // Validate file type
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrorMessage("Please upload a PNG or JPG image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds 10MB limit.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setProcessingState("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) {
      setErrorMessage("Please select an image first.");
      return;
    }

    setProcessingState("processing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove background");
      }

      const data = await response.json();
      setResultUrl(data.resultUrl);
      setProcessingState("success");
    } catch (error) {
      setProcessingState("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "removed-background.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setProcessingState("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Image Background Remover
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {previewUrl ? (
            <div className="relative inline-block">
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={300}
                className="max-w-full h-auto rounded-lg"
                unoptimized
              />
              <button
                onClick={handleReset}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Drag and drop an image here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">Supports PNG, JPG (max 10MB)</p>
            </>
          )}
          {/* Hidden file input - always rendered but visually hidden */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{errorMessage}</p>
          </div>
        )}

        {/* Action Button */}
        {selectedImage && processingState !== "processing" && (
          <div className="text-center mb-8">
            <button
              onClick={handleRemoveBackground}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Remove Background
            </button>
          </div>
        )}

        {/* Loading State */}
        {processingState === "processing" && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Processing your image...</p>
          </div>
        )}

        {/* Result Preview */}
        {processingState === "success" && resultUrl && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-900">
              Result
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Original</h3>
                <div className="bg-gray-100 rounded-lg p-4 inline-block">
                  <Image
                    src={previewUrl!}
                    alt="Original"
                    width={300}
                    height={300}
                    className="max-w-full h-auto rounded"
                    unoptimized
                  />
                </div>
              </div>
              {/* Result Image */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Removed Background</h3>
                <div className="bg-[url('https://transparent-bg.vercel.app/checkerboard.svg')] bg-repeat rounded-lg p-4 inline-block">
                  <Image
                    src={resultUrl}
                    alt="Result"
                    width={300}
                    height={300}
                    className="max-w-full h-auto rounded"
                    unoptimized
                  />
                </div>
              </div>
            </div>
            {/* Download Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </button>
            </div>
            {/* Process Another */}
            <div className="text-center pt-2">
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Process another image
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
