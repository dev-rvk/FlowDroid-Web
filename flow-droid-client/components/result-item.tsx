"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react"

interface ResultItemProps {
  result: Element
  index: number
}

export default function ResultItem({ result, index }: ResultItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Extract sink information
  const sink = result.querySelector("Sink")
  const sinkStatement = sink?.getAttribute("Statement") || "Unknown"
  const sinkMethod = sink?.getAttribute("Method") || "Unknown"

  // Extract source information
  const sources = Array.from(result.querySelectorAll("Source"))

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Finding #{index + 1}</span>
            <Badge variant="outline" className="ml-2">
              {sources.length} Source{sources.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground truncate max-w-[50%]">{formatMethodName(sinkMethod)}</div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sink (Vulnerability Target)</h4>
                <div className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  <div>
                    <span className="font-medium">Statement:</span> {sinkStatement}
                  </div>
                  <div>
                    <span className="font-medium">Method:</span> {sinkMethod}
                  </div>
                  {sink?.querySelector("AccessPath") && (
                    <div>
                      <span className="font-medium">Access Path:</span>{" "}
                      {sink.querySelector("AccessPath")?.getAttribute("Value")}(
                      {sink.querySelector("AccessPath")?.getAttribute("Type")})
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sources (Data Origins)</h4>
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div key={idx} className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <div>
                        <span className="font-medium">Statement:</span> {source.getAttribute("Statement")}
                      </div>
                      <div>
                        <span className="font-medium">Method:</span> {source.getAttribute("Method")}
                      </div>
                      {source.querySelector("AccessPath") && (
                        <div>
                          <span className="font-medium">Access Path:</span>{" "}
                          {source.querySelector("AccessPath")?.getAttribute("Value")}(
                          {source.querySelector("AccessPath")?.getAttribute("Type")})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <span>Source</span>
                    <ArrowRight className="mx-2 h-4 w-4" />
                    <span>Sink</span>
                  </div>
                  <div className="text-xs mt-1">
                    Data flows from source to sink, potentially leaking sensitive information
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function formatMethodName(methodName: string): string {
  // Remove angle brackets and package prefixes for readability
  return methodName.replace(/[<>]/g, "").replace(/^.*\.([\w$]+): /, "$1: ")
}

