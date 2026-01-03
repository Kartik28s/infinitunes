"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        setIsProcessing(true);

        try {
          const transcription = await transcribeAudio(audioBlob);
          setTranscript(transcription);
          onTranscript(transcription);
        } catch (transcribeError) {
          setError("Failed to transcribe audio. Please try again.");
          console.error("Transcription error:", transcribeError);
        } finally {
          setIsProcessing(false);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(
        "Could not access microphone. Please ensure microphone permissions are granted.",
      );
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTranscript =
          "I just had a meeting with John Smith from Acme Technologies. We discussed their new project requirements. They mentioned needing a solution for customer data management. Key points include scalability, security requirements, and integration with existing systems. Next steps are to schedule a demo next week and prepare a proposal by Friday. The potential deal value is around $50,000 and they're looking to make a decision within 30 days.";

        resolve(mockTranscript);
      }, 2000);
    });
  };

  const clearTranscript = () => {
    setTranscript("");
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Note Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled || isProcessing}
              size="lg"
              className="flex-1"
            >
              <Mic className="mr-2 h-5 w-5" />
              {isProcessing ? "Processing..." : "Start Recording"}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Transcribing audio...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          </div>
        )}

        {transcript && !error && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">Transcript ready</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTranscript}
                disabled={disabled}
              >
                Clear
              </Button>
            </div>
            <Separator />
            <ScrollArea className="h-40 rounded-md border p-3">
              <p className="text-sm leading-relaxed">{transcript}</p>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
