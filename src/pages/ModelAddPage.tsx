import React from "react";
import axios, { AxiosError } from "axios";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Accept common 3D formats
const ACCEPTED_EXTENSIONS = [".glb", ".gltf", ".fbx", ".obj", ".stl", ".usdz"];
const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(",");
const MAX_BYTES = 100 * 1024 * 1024; // 100MB

export function ModelAddPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aborted, setAborted] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetState() {
    setError(null);
    setProgress(0);
    setIsUploading(false);
    setAborted(false);
  }

  function validateFile(f: File): string | null {
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Allowed: ${ACCEPTED_EXTENSIONS.join(" ")}`;
    }
    if (f.size > MAX_BYTES) {
      return `File is too large. Max size is ${Math.floor(
        MAX_BYTES / 1024 / 1024
      )}MB`;
    }
    return null;
  }

  function onFileSelected(f: File) {
    const err = validateFile(f);
    if (err) {
      setFile(null);
      setError(err);
      toast.error(err, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setError(null);
    setFile(f);
    toast.success("File selected: " + f.name, {
      position: "top-right",
      autoClose: 3000,
    });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelected(f);
  }

  function humanSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function handleBrowse() {
    inputRef.current?.click();
  }

  function handleKeyActivate(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrowse();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a model name.");
      toast.error("Please enter a model name.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (!file) {
      setError("Please select a model file to upload.");
      toast.error("Please select a model file to upload.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5001/upload-model",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: ProgressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setProgress(pct);
            }
          },
        }
      );

      // Success
      setProgress(100);
      setName("");
      setFile(null);
      toast.success("Model uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => setProgress(0), 400);
    } catch (error) {
      let message = "Upload failed";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        message =
          axiosError.response?.data?.message || axiosError.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  }

  function cancelUpload() {
    if (xhrRef.current && isUploading) {
      setAborted(true);
      xhrRef.current.abort();
      xhrRef.current = null;
      setIsUploading(false);
      toast.warn("Upload canceled.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }

  function safeParseError(text: string | null): string | null {
    if (!text) return null;
    try {
      const obj = JSON.parse(text);
      if (typeof (obj as any)?.error === "string") return (obj as any).error;
      if (typeof (obj as any)?.message === "string") return (obj as any).message;
    } catch {
      // not JSON, ignore
    }
    return text.replace(/<[^>]*>/g, "").slice(0, 300);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Upload 3D Model
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Provide a name and upload your 3D asset. Supported formats: GLB, GLTF,
          FBX, OBJ, STL, USDZ.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Model Details</CardTitle>
          <CardDescription>
            Fill out the model name and add your model
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High-Poly Spaceship"
                  disabled={isUploading}
                  aria-invalid={!!error && !name.trim()}
                  className="font-sans"
                />
              </div>

              <div className="grid gap-2">
                <Label>Model File</Label>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyActivate}
                  onClick={handleBrowse}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  aria-label="Upload 3D model file"
                  aria-describedby="file-help"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-colors",
                    "bg-background",
                    dragActive
                      ? "border-blue-500 bg-blue-50/40"
                      : "border-muted-foreground/25 hover:border-muted-foreground/40"
                  )}
                >
                  <div className="pointer-events-none">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <span className="text-2xl leading-none">↑</span>
                    </div>
                    <p className="text-sm font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or click to browse
                    </p>
                    <p id="file-help" className="mt-3 text-xs text-muted-foreground">
                      Allowed: {ACCEPTED_EXTENSIONS.join(", ").toUpperCase()} • Max{" "}
                      {Math.floor(MAX_BYTES / 1024 / 1024)}MB
                    </p>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_ATTRIBUTE}
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0];
                      if (f) onFileSelected(f);
                      e.currentTarget.value = "";
                    }}
                    disabled={isUploading}
                  />
                </div>

                {file && (
                  <div className="mt-2 rounded-md border bg-card p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {humanSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          toast.info("File removed.", {
                            position: "top-right",
                            autoClose: 3000,
                          });
                        }}
                        disabled={isUploading}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelUpload}
                    >
                      Cancel upload
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button onClick={() => navigate("/")}>Go Back</Button>
              <div className="space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setName("");
                    setFile(null);
                    resetState();
                    toast.info("Form reset.", {
                      position: "top-right",
                      autoClose: 3000,
                    });
                  }}
                  disabled={isUploading || (!name && !file)}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload Model"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </main>
  );
}