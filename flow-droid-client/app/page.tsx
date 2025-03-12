import FileUpload from "@/components/file-upload"

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Android APK Security Analysis</h1>
        <p className="text-muted-foreground">
          Upload your Android APK file to analyze potential data flow vulnerabilities and security leaks.
        </p>
      </section>

      <FileUpload />
    </div>
  )
}

