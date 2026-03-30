"use client";

import { useState, useRef } from "react";

const REMOVE_BG_API_KEY = "GCXmdDUHYYjgTCMMVdmQVsNB";

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
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Only PNG and JPG images are supported");
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
    setResultPreview(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      console.log("Sending request to Remove.bg with base64 length:", base64.length);

      const formData = new FormData();
      formData.append("image_file_b64", base64);
      formData.append("size", "auto");
      formData.append("format", "png");
      formData.append("bg_color", "transparent");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Remove.bg error:", errorText);
        setError(`API Error (${response.status}): ${errorText}`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("image")) {
        const errorText = await response.text();
        console.error("Wrong content type:", contentType, errorText);
        setError("API returned non-image response");
        return;
      }

      const blob = await response.blob();
      console.log("Result blob size:", blob.size, "type:", blob.type);
      
      if (blob.size < 1000) {
        const text = await blob.text();
        console.error("Result is too small, likely error:", text);
        setError("API returned error: " + text.substring(0, 100));
        return;
      }
      
      const url = URL.createObjectURL(blob);
      setResultPreview(url);
    } catch (e: unknown) {
      console.error("Error:", e);
      setError(e instanceof Error ? e.message : "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (resultPreview) {
      const link = document.createElement("a");
      link.href = resultPreview;
      link.download = "removed-bg.png";
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
            accept="image/png,image/jpeg,image/jpg"
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
              <p style={{ fontSize: "12px" }}>{error}</p>
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
                  <p style={{ color: "#444", marginBottom: "8px" }}>Result (Transparent Background)</p>
                  <div style={{ 
                    background: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    padding: "12px", 
                    borderRadius: "12px" 
                  }}>
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
                    Download PNG
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
