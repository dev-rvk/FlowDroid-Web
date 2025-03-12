"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import ResultItem from "./result-item"
import SummaryView from "./summary-view"
import { Shield } from "lucide-react"

interface AnalysisResultsProps {
  xmlData: Document | null
}

export default function AnalysisResults({ xmlData }: AnalysisResultsProps) {
  const [results, setResults] = useState<Element[]>([])
  const [performanceData, setPerformanceData] = useState<Record<string, string>>({})
  const [terminationState, setTerminationState] = useState<string>("")
  const [noVulnerabilities, setNoVulnerabilities] = useState(false)
  const [noVulnerabilitiesMessage, setNoVulnerabilitiesMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (xmlData) {
      // Check if we have a "no vulnerabilities" result
      if ("noVulnerabilities" in xmlData) {
        setNoVulnerabilities(true)
        setNoVulnerabilitiesMessage(xmlData.message)
        return
      } else {
        setNoVulnerabilities(false)
        setNoVulnerabilitiesMessage(undefined)
      }

      // Extract results
      const resultElements = xmlData.querySelectorAll("Result")
      setResults(Array.from(resultElements))

      // Extract performance data
      const performanceEntries = xmlData.querySelectorAll("PerformanceEntry")
      const perfData: Record<string, string> = {}
      performanceEntries.forEach((entry) => {
        const name = entry.getAttribute("Name")
        const value = entry.getAttribute("Value")
        if (name && value) {
          perfData[name] = value
        }
      })
      setPerformanceData(perfData)

      // Extract termination state
      const rootElement = xmlData.querySelector("DataFlowResults")
      if (rootElement) {
        setTerminationState(rootElement.getAttribute("TerminationState") || "")
      }
    } else {
      setResults([])
      setPerformanceData({})
      setTerminationState("")
      setNoVulnerabilities(false)
      setNoVulnerabilitiesMessage(undefined)
    }
  }, [xmlData])

  if (noVulnerabilities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-500" />
            <span>Analysis Complete</span>
          </CardTitle>
          <CardDescription>{noVulnerabilitiesMessage || "No vulnerabilities detected in the APK file"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your APK is secure!</h3>
            <p className="text-muted-foreground">
              No data flow vulnerabilities were detected in the analyzed APK file.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Alert variant={terminationState === "Success" ? "default" : "destructive"}>
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis {terminationState}</AlertTitle>
        <AlertDescription>
          {terminationState === "Success"
            ? `Found ${results.length} potential data flow vulnerabilities.`
            : "The analysis did not complete successfully."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Detailed Results</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <SummaryView results={results} />
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detailed Analysis Results</span>
                <Badge variant="outline">{results.length} Findings</Badge>
              </CardTitle>
              <CardDescription>
                Each result represents a potential data flow from a sensitive source to a sink
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <ResultItem key={index} result={result} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Analysis performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(performanceData).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 border rounded-md">
                    <span className="font-medium">{formatPerformanceKey(key)}</span>
                    <span>{formatPerformanceValue(key, value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatPerformanceKey(key: string): string {
  // Convert camelCase to spaces
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/([A-Z][a-z])/g, " $1")
    .trim()
}

function formatPerformanceValue(key: string, value: string): string {
  if (key.includes("Seconds")) {
    return `${value} seconds`
  } else if (key === "MaxMemoryConsumption") {
    return `${value} MB`
  }
  return value
}

