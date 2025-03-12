"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import AnalysisResults from "./analysis-results"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | null) => {
    setError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!selectedFile.name.endsWith(".apk")) {
      setError("Invalid file type. Please upload an APK file.")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("apkFile", file)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const response = await fetch("http://localhost:3040/apk", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`)
      }

      setUploadProgress(100)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json()

        if (jsonData.vulnerabilitiesFound === false) {
          // Handle case when no vulnerabilities are found
          setAnalysisData({
            noVulnerabilities: true,
            message: jsonData.message || "No vulnerabilities detected",
          })
        } else if (jsonData.error) {
          // Handle error in processing APK
          throw new Error(jsonData.message || "Error analyzing APK file")
        } else {
          // Regular JSON response
          setAnalysisData(jsonData)
        }
      } else {
        // Parse XML response
        const xmlText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "text/xml")

        setAnalysisData(xmlDoc)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const resetForm = () => {
    setFile(null)
    setAnalysisData(null)
    setError(null)
    setUploadProgress(0)
    setIsUploading(false) // Add this line
    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!analysisData && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Upload APK File</h3>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop your APK file here, or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".apk"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            <Button onClick={triggerFileInput}>Select APK File</Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {file && !analysisData && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress < 100 ? "Analyzing APK file..." : "Analysis complete!"}
              </p>
            </div>
          )}
        </div>
      )}

      {analysisData && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <Button variant="outline" onClick={resetForm}>
              Analyze Another APK
            </Button>
          </div>
          <AnalysisResults xmlData={analysisData} />
        </div>
      )}
    </div>
  )
}

