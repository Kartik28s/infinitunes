"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { ParsedCRMData } from "@/lib/crm/voice-parser";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

interface ParserDashboardProps {
  parsedData: ParsedCRMData;
  transcript: string;
  onSave?: (data: ParsedCRMData) => void;
  onRetry?: () => void;
}

export function ParserDashboard({
  parsedData,
  transcript,
  onSave,
  onRetry,
}: ParserDashboardProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(parsedData);

  const confidenceLevel =
    formData.confidence >= 0.8 ? "high" : formData.confidence >= 0.6 ? "medium" : "low";

  const confidenceColors = {
    high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const handleFieldChange = (
    section: "customer" | "interaction" | "deal",
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayFieldChange = (
    section: "customer" | "interaction",
    field: string,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const newArray = [...(prev[section] as any)[field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
    });
  };

  const addArrayItem = (section: "customer" | "interaction", field: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section] as any)[field], ""],
      },
    }));
  };

  const removeArrayItem = (
    section: "customer" | "interaction",
    field: string,
    index: number,
  ) => {
    setFormData((prev) => {
      const newArray = [...(prev[section] as any)[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/crm/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parsedData: formData,
          transcript,
        }),
      });

      const result = await response.json() as { success: boolean; error?: string };

      if (response.ok) {
        toast({
          title: "Success",
          description: "CRM data saved successfully",
        });

        if (onSave) {
          onSave(formData);
        }
      } else {
        throw new Error(result.error || "Failed to save CRM data");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save CRM data",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Parsed CRM Data
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={confidenceColors[confidenceLevel]}>
              {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} confidence
              ({Math.round(formData.confidence * 100)}%)
            </Badge>
            {onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {formData.flags.length > 0 && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Flags detected:
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    {formData.flags.map((flag, index) => (
                      <li key={index}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name *</Label>
              <Input
                id="customer-name"
                value={formData.customer.name}
                onChange={(e) =>
                  handleFieldChange("customer", "name", e.target.value)
                }
                placeholder="Customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-company">Company *</Label>
              <Input
                id="customer-company"
                value={formData.customer.company}
                onChange={(e) =>
                  handleFieldChange("customer", "company", e.target.value)
                }
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={formData.customer.email}
                onChange={(e) =>
                  handleFieldChange("customer", "email", e.target.value)
                }
                placeholder="customer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={formData.customer.phone}
                onChange={(e) =>
                  handleFieldChange("customer", "phone", e.target.value)
                }
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-notes">Notes</Label>
              <Textarea
                id="customer-notes"
                value={formData.customer.notes}
                onChange={(e) =>
                  handleFieldChange("customer", "notes", e.target.value)
                }
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interaction-type">Interaction Type *</Label>
              <select
                id="interaction-type"
                value={formData.interaction.type}
                onChange={(e) =>
                  handleFieldChange("interaction", "type", e.target.value)
                }
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="demo">Demo</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interaction-summary">Summary *</Label>
              <Textarea
                id="interaction-summary"
                value={formData.interaction.summary}
                onChange={(e) =>
                  handleFieldChange("interaction", "summary", e.target.value)
                }
                placeholder="Brief summary of the interaction..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Points</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem("interaction", "keyPoints")}
                >
                  Add
                </Button>
              </div>
              <ScrollArea className="h-32 rounded-md border p-3">
                <div className="space-y-2">
                  {formData.interaction.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) =>
                          handleArrayFieldChange("interaction", "keyPoints", index, e.target.value)
                        }
                        placeholder={`Key point ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("interaction", "keyPoints", index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Next Steps</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem("interaction", "nextSteps")}
                >
                  Add
                </Button>
              </div>
              <ScrollArea className="h-32 rounded-md border p-3">
                <div className="space-y-2">
                  {formData.interaction.nextSteps.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={step}
                        onChange={(e) =>
                          handleArrayFieldChange("interaction", "nextSteps", index, e.target.value)
                        }
                        placeholder={`Next step ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("interaction", "nextSteps", index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-date">Follow-up Date</Label>
              <Input
                id="followup-date"
                type="date"
                value={formData.interaction.followUpDate || ""}
                onChange={(e) =>
                  handleFieldChange("interaction", "followUpDate", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {formData.deal && (
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deal-name">Deal Name</Label>
              <Input
                id="deal-name"
                value={formData.deal.name}
                onChange={(e) => handleFieldChange("deal", "name", e.target.value)}
                placeholder="Deal name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-value">Value</Label>
              <Input
                id="deal-value"
                type="number"
                step="0.01"
                value={formData.deal.value}
                onChange={(e) => handleFieldChange("deal", "value", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-stage">Stage</Label>
              <select
                id="deal-stage"
                value={formData.deal.stage}
                onChange={(e) =>
                  handleFieldChange("deal", "stage", e.target.value)
                }
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deal-description">Description</Label>
              <Textarea
                id="deal-description"
                value={formData.deal.description}
                onChange={(e) => handleFieldChange("deal", "description", e.target.value)}
                placeholder="Deal description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-close-date">Expected Close Date</Label>
              <Input
                id="deal-close-date"
                type="date"
                value={formData.deal.closeDate || ""}
                onChange={(e) => handleFieldChange("deal", "closeDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save to CRM
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
