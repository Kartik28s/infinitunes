"use client";

import { useState } from "react";
import { Loader2, FileText, Users, DollarSign, TrendingUp } from "lucide-react";

import { VoiceRecorder } from "@/components/crm/voice-recorder";
import { ParserDashboard } from "@/components/crm/parser-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ParsedCRMData } from "@/lib/crm/voice-parser";

interface CRMPageProps {
  userId: string;
}

export function CRMPage({ userId }: CRMPageProps) {
  const { toast } = useToast();
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<ParsedCRMData | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleTranscript = async (newTranscript: string) => {
    setTranscript(newTranscript);
    setIsParsing(true);

    try {
      const response = await fetch("/api/crm/voice-parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: newTranscript,
          userId,
        }),
      });

      const result = await response.json() as { success: boolean; data?: ParsedCRMData; error?: string };

      if (response.ok && result.success && result.data) {
        setParsedData(result.data);
        toast({
          title: "Success",
          description: "Voice note parsed successfully",
        });
      } else {
        throw new Error(result.error || "Failed to parse voice note");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse voice note",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    setTranscript("");
    setParsedData(null);
  };

  const handleSave = (data: ParsedCRMData) => {
    toast({
      title: "CRM Updated",
      description: "Your data has been saved successfully",
    });
    handleReset();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Voice to CRM</h1>
        <p className="text-muted-foreground mt-2">
          Transform your voice notes into structured CRM updates
        </p>
      </div>

      {!parsedData && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">View all customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">View all interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">View active deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Performance metrics</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VoiceRecorder
            onTranscript={handleTranscript}
            disabled={isParsing || !!parsedData}
          />
        </div>

        <div className="lg:col-span-2">
          {isParsing && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Processing Voice Note</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing transcript and extracting CRM data...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!parsedData && !isParsing && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Data Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Record a voice note to get started
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {parsedData && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Start New Voice Note
                </Button>
              </div>
              <ParserDashboard
                parsedData={parsedData}
                transcript={transcript}
                onSave={handleSave}
                onRetry={() => handleTranscript(transcript)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
