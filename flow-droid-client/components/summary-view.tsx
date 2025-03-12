"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { AlertTriangle, ShieldAlert } from "lucide-react"

interface SummaryViewProps {
  results: Element[]
}

interface SourceCount {
  name: string
  value: number
}

interface SinkCount {
  name: string
  value: number
}

export default function SummaryView({ results }: SummaryViewProps) {
  const [sourceCounts, setSourceCounts] = useState<SourceCount[]>([])
  const [sinkCounts, setSinkCounts] = useState<SinkCount[]>([])

  useEffect(() => {
    // Count sources by type
    const sourceMap = new Map<string, number>()

    // Count sinks by type
    const sinkMap = new Map<string, number>()

    results.forEach((result) => {
      // Process sources
      const sources = result.querySelectorAll("Source")
      sources.forEach((source) => {
        const methodName = source.getAttribute("MethodSourceSinkDefinition") || "Unknown"
        const simplifiedName = simplifyMethodName(methodName)
        sourceMap.set(simplifiedName, (sourceMap.get(simplifiedName) || 0) + 1)
      })

      // Process sink
      const sink = result.querySelector("Sink")
      if (sink) {
        const methodName = sink.getAttribute("MethodSourceSinkDefinition") || "Unknown"
        const simplifiedName = simplifyMethodName(methodName)
        sinkMap.set(simplifiedName, (sinkMap.get(simplifiedName) || 0) + 1)
      }
    })

    // Convert maps to arrays for charts
    setSourceCounts(Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value })))
    setSinkCounts(Array.from(sinkMap.entries()).map(([name, value]) => ({ name, value })))
  }, [results])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Vulnerability Summary</span>
          </CardTitle>
          <CardDescription>Overview of detected data flow vulnerabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
              <span className="font-medium">Total Findings</span>
              <span className="text-xl font-bold">{results.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-1">Unique Sources</div>
                <div className="text-xl font-bold">{sourceCounts.length}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-1">Unique Sinks</div>
                <div className="text-xl font-bold">{sinkCounts.length}</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm font-medium mb-2">Risk Assessment</div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>
                  {results.length > 10
                    ? "High Risk: Multiple data flow vulnerabilities detected"
                    : results.length > 0
                      ? "Medium Risk: Some data flow vulnerabilities detected"
                      : "Low Risk: No data flow vulnerabilities detected"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Distribution</CardTitle>
          <CardDescription>Types of sensitive data sources detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {sourceCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} occurrences`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No source data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sink Distribution</CardTitle>
          <CardDescription>Types of vulnerable data sinks detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {sinkCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sinkCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sinkCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} occurrences`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sink data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function simplifyMethodName(methodName: string): string {
  // Extract the class and method name for better readability
  const match = methodName.match(/<([^:]+): ([^>]+)>/)
  if (match) {
    const className = match[1].split(".").pop() || match[1]
    return `${className}.${match[2]}`
  }
  return methodName
}

