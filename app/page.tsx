"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }
    setSelectedFile(file);
    setError("");
    setResultPreview(null);
    setOriginalPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/remove", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to process image");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultPreview(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (resultPreview) {
      const link = document.createElement("a");
      link.href = resultPreview;
      link.download = "result.png";
      link.click();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9f9" }}>
      <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: "700", textAlign: "center", color: "#333", marginBottom: "30px" }}>
          Image Background Remover
        </h1>

        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "20px" }}>
          <div
            style={{
              border: "2px dashed #ccc",
              borderRadius: "12px",
              padding: "80px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {originalPreview ? (
              <img src={originalPreview} alt="Preview" style={{ maxHeight: "300px", margin: "0 auto", borderRadius: "12px" }} />
            ) : (
              <>
                <p style={{ color: "#444" }}>Click to upload or drag and drop</p>
                <p style={{ color: "#999", marginTop: "10px" }}>PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            style={{
              width: "100%",
              marginTop: "16px",
              background: loading || !selectedFile ? "#ccc" : "#0066ff",
              color: "#fff",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: loading || !selectedFile ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {loading ? "Processing..." : "Remove Background"}
          </button>

          {error && (
            <div style={{ marginTop: "16px", padding: "12px", background: "#ffeeee", color: "#cc3333", borderRadius: "12px" }}>
              <p>{error}</p>
            </div>
          )}

          {(originalPreview || resultPreview) && (
            <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {originalPreview && (
                <div>
                  <p style={{ color: "#444", marginBottom: "8px" }}>Original</p>
                  <img src={originalPreview} alt="Original" style={{ width: "100%", borderRadius: "12px", border: "1px solid #eee" }} />
                </div>
              )}
              {resultPreview && (
                <div>
                  <p style={{ color: "#444", marginBottom: "8px" }}>Result</p>
                  <div style={{ background: "#f0f0f0", padding: "12px", borderRadius: "12px" }}>
                    <img src={resultPreview} alt="Result" style={{ width: "100%", borderRadius: "12px" }} />
                  </div>
                  <button
                    onClick={downloadResult}
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      background: "#28a745",
                      color: "#fff",
                      padding: "12px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
