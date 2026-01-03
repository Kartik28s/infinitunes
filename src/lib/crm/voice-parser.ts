import { z } from "zod";

export const VoiceNoteInput = z.object({
  transcript: z.string().min(1, "Transcript cannot be empty"),
  userId: z.string().uuid(),
});

export type VoiceNoteInput = z.infer<typeof VoiceNoteInput>;

export const ParsedCRMData = z.object({
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    company: z.string().min(1, "Company name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
  }),
  interaction: z.object({
    type: z.enum(["meeting", "call", "demo", "email", "other"]),
    summary: z.string().min(1, "Summary is required"),
    keyPoints: z.array(z.string()),
    nextSteps: z.array(z.string()),
    followUpDate: z.string().optional(),
  }),
  deal: z
    .object({
      name: z.string(),
      value: z.string(),
      stage: z.enum([
        "prospecting",
        "qualification",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ]),
      closeDate: z.string().optional(),
      description: z.string(),
    })
    .optional(),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.string()),
});

export type ParsedCRMData = z.infer<typeof ParsedCRMData>;

interface ParseResult {
  success: boolean;
  data?: ParsedCRMData;
  errors?: string[];
}

export class VoiceNoteParser {
  private confidenceThreshold = 0.7;

  parse(transcript: string): ParseResult {
    try {
      const parsed = this.extractCRMData(transcript);
      const validation = ParsedCRMData.safeParse(parsed);

      if (!validation.success) {
        return {
          success: false,
          errors: validation.error.errors.map((e) => e.message),
        };
      }

      return {
        success: true,
        data: validation.data,
      };
    } catch (error) {
      return {
        success: false,
        errors: ["Failed to parse voice note"],
      };
    }
  }

  private extractCRMData(transcript: string) {
    const text = transcript.toLowerCase().replace(/[^\w\s@.-]/g, "");
    const lines = text.split(/[.!?]+/).filter((l) => l.trim().length > 0);

    const customer = this.extractCustomerInfo(lines);
    const interaction = this.extractInteractionInfo(lines);
    const deal = this.extractDealInfo(lines);
    const flags = this.identifyFlags(lines, { customer, interaction, deal });

    const confidence = this.calculateConfidence(
      customer,
      interaction,
      deal,
      flags,
    );

    return {
      customer,
      interaction,
      deal: Object.keys(deal).length > 0 ? deal : undefined,
      confidence,
      flags,
    };
  }

  private extractCustomerInfo(lines: string[]) {
    const customer: any = {
      name: "",
      company: "",
      email: "",
      phone: "",
      notes: "",
    };

    const namePatterns = [
      /(?:spoke|met|called|visited)\s+(?:with|to)?\s*([a-z]+\s+[a-z]+)/i,
      /(?:customer|client|contact)\s*:?\s*([a-z]+\s+[a-z]+)/i,
      /(?:from|at)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    ];

    const companyPatterns = [
      /(?:from|at|work[s]?|company|organization)\s*:?\s*([a-z][a-z\s]*(?:inc|llc|corp|ltd|co|company|technologies|systems|solutions)?)/i,
      /(?:working|dealing)\s+(?:with|at)\s+([a-z][a-z\s]*(?:inc|llc|corp|ltd|co|company|technologies|systems|solutions)?)/i,
    ];

    const emailPatterns = [
      /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i,
      /(?:email|mail)\s*:?\s*([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i,
    ];

    const phonePatterns = [
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/,
      /(?:phone|call|mobile|contact)\s*:?\s*(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
    ];

    for (const line of lines) {
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match && !customer.name) {
          customer.name = match[1]
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          break;
        }
      }

      for (const pattern of companyPatterns) {
        const match = line.match(pattern);
        if (match && !customer.company) {
          customer.company = match[1]
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          break;
        }
      }

      for (const pattern of emailPatterns) {
        const match = line.match(pattern);
        if (match && !customer.email) {
          customer.email = match[1].toLowerCase();
          break;
        }
      }

      for (const pattern of phonePatterns) {
        const match = line.match(pattern);
        if (match && !customer.phone) {
          customer.phone = match[0];
          break;
        }
      }
    }

    if (!customer.name) {
      customer.name = "Unknown Customer";
    }
    if (!customer.company) {
      customer.company = "Unknown Company";
    }

    return customer;
  }

  private extractInteractionInfo(lines: string[]) {
    const interaction: any = {
      type: "other",
      summary: "",
      keyPoints: [],
      nextSteps: [],
      followUpDate: undefined as string | undefined,
    };

    const typeKeywords = {
      meeting: ["met", "meeting", "visited", "sat down", "discussed in person"],
      call: ["called", "phone call", "spoke", "conversation", "talked"],
      demo: ["demo", "demonstration", "showed", "presentation", "walkthrough"],
      email: ["emailed", "email", "message", "sent"],
    };

    for (const line of lines) {
      for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (
          keywords.some((keyword) => line.includes(keyword)) &&
          interaction.type === "other"
        ) {
          interaction.type = type as any;
          break;
        }
      }
    }

    const keyPointIndicators = [
      "they mentioned",
      "key point",
      "important",
      "noted",
      "discussed",
      "highlighted",
      "brought up",
      "interested in",
      "concerned about",
    ];

    const nextStepIndicators = [
      "next step",
      "follow up",
      "will",
      "need to",
      "schedule",
      "send",
      "prepare",
      "action item",
      "to do",
    ];

    for (const line of lines) {
      if (keyPointIndicators.some((indicator) => line.includes(indicator))) {
        const point = line
          .replace(new RegExp(keyPointIndicators.join("|"), "gi"), "")
          .trim();
        if (point.length > 5) {
          interaction.keyPoints.push(
            point.charAt(0).toUpperCase() + point.slice(1),
          );
        }
      }

      if (nextStepIndicators.some((indicator) => line.includes(indicator))) {
        const step = line
          .replace(new RegExp(nextStepIndicators.join("|"), "gi"), "")
          .trim();
        if (step.length > 5) {
          interaction.nextSteps.push(
            step.charAt(0).toUpperCase() + step.slice(1),
          );
        }
      }
    }

    const datePatterns = [
      /(?:follow up|next|schedule)\s+(?:on|in|at)?\s*(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
      /(?:follow up|next|schedule)\s+(?:on|in|at)?\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
      /(?:follow up|next|schedule)\s+(?:on|in|at)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          interaction.followUpDate = match[1];
          break;
        }
      }
    }

    interaction.summary = lines.slice(0, 3).join(". ") + ".";

    if (interaction.keyPoints.length === 0) {
      interaction.keyPoints.push(
        "No specific key points identified in the transcript.",
      );
    }

    if (interaction.nextSteps.length === 0) {
      interaction.nextSteps.push("No next steps identified in the transcript.");
    }

    return interaction;
  }

  private extractDealInfo(lines: string[]) {
    const deal: any = {
      name: "",
      value: "",
      stage: "prospecting",
      closeDate: undefined as string | undefined,
      description: "",
    };

    const stageKeywords = {
      prospecting: ["prospecting", "new", "initial", "first contact"],
      qualification: ["qualified", "interested", "potential", "opportunity"],
      proposal: ["proposal", "quote", "pricing", "sent proposal"],
      negotiation: ["negotiating", "terms", "contract", "finalizing"],
      closed_won: ["won", "closed", "signed", "deal closed"],
      closed_lost: ["lost", "declined", "not interested", "passed"],
    };

    const valuePatterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(?:worth|value|price|cost|budget)\s*:?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars|usd)/i,
    ];

    for (const line of lines) {
      for (const [stage, keywords] of Object.entries(stageKeywords)) {
        if (
          keywords.some((keyword) => line.includes(keyword)) &&
          deal.stage === "prospecting"
        ) {
          deal.stage = stage as any;
          break;
        }
      }

      for (const pattern of valuePatterns) {
        const match = line.match(pattern);
        if (match && !deal.value) {
          deal.value = match[1];
          break;
        }
      }
    }

    const closingPatterns = [
      /(?:close|closing|expected|deadline)\s*(?:by|on|date)?\s*:?\s*(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
      /(?:close|closing|expected|deadline)\s*(?:by|on|date)?\s*:?\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
    ];

    for (const line of lines) {
      for (const pattern of closingPatterns) {
        const match = line.match(pattern);
        if (match && !deal.closeDate) {
          deal.closeDate = match[1];
          break;
        }
      }
    }

    const discussionLines = lines.filter(
      (line) =>
        line.length > 10 &&
        !line.includes("next step") &&
        !line.includes("follow up"),
    );

    deal.description = discussionLines.slice(0, 5).join(". ");

    if (deal.value || deal.stage !== "prospecting") {
      deal.name = `Deal - ${new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })}`;
    }

    return deal;
  }

  private identifyFlags(
    lines: string[],
    extracted: { customer: any; interaction: any; deal: any },
  ): string[] {
    const flags: string[] = [];

    if (!extracted.customer.name || extracted.customer.name === "Unknown") {
      flags.push("Customer name not identified");
    }

    if (!extracted.customer.company || extracted.customer.company === "Unknown") {
      flags.push("Company name not identified");
    }

    if (!extracted.customer.email && !extracted.customer.phone) {
      flags.push("No contact information found");
    }

    if (extracted.interaction.keyPoints.length === 0) {
      flags.push("No key points identified");
    }

    if (extracted.interaction.nextSteps.length === 0) {
      flags.push("No next steps identified");
    }

    const uncertaintyIndicators = [
      "not sure",
      "maybe",
      "uncertain",
      "unclear",
      "tentative",
      "possibly",
    ];

    for (const line of lines) {
      if (uncertaintyIndicators.some((indicator) => line.includes(indicator))) {
        flags.push("Uncertainty detected in transcript");
        break;
      }
    }

    const lowConfidenceKeywords = ["follow up", "check", "verify", "confirm"];

    for (const line of lines) {
      if (lowConfidenceKeywords.some((keyword) => line.includes(keyword))) {
        flags.push("Information may need verification");
        break;
      }
    }

    return flags;
  }

  private calculateConfidence(
    customer: any,
    interaction: any,
    deal: any,
    flags: string[],
  ): number {
    let score = 1.0;

    if (!customer.name || customer.name === "Unknown Customer") {
      score -= 0.15;
    }
    if (!customer.company || customer.company === "Unknown Company") {
      score -= 0.1;
    }
    if (!customer.email) {
      score -= 0.05;
    }
    if (!customer.phone) {
      score -= 0.05;
    }

    if (interaction.type === "other") {
      score -= 0.1;
    }
    if (interaction.keyPoints.length === 0) {
      score -= 0.1;
    }
    if (interaction.nextSteps.length === 0) {
      score -= 0.1;
    }

    score -= flags.length * 0.05;

    return Math.max(0, Math.min(1, score));
  }
}

export const voiceNoteParser = new VoiceNoteParser();
