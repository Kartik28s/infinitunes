import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ParsedCRMData } from "@/lib/crm/voice-parser";
import {
  customers,
  interactions,
  deals,
  type NewCustomer,
  type NewInteraction,
  type NewDeal,
} from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { parsedData?: ParsedCRMData; transcript?: string };
    const { parsedData, transcript } = body;

    if (!parsedData || !transcript) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    let customerResult;
    const existingCustomer = await db.query.customers.findFirst({
      where: (c, { and, eq }) =>
        and(
          eq(c.userId, userId),
          eq(sql`LOWER(${c.name})`, parsedData.customer.name.toLowerCase()),
          eq(sql`LOWER(${c.company})`, parsedData.customer.company.toLowerCase()),
        ),
    });

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;

      await db
        .update(customers)
        .set({
          email: parsedData.customer.email || existingCustomer.email,
          phone: parsedData.customer.phone || existingCustomer.phone,
          notes: parsedData.customer.notes || existingCustomer.notes,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));
    } else {
      const newCustomer: NewCustomer = {
        userId,
        name: parsedData.customer.name,
        company: parsedData.customer.company,
        email: parsedData.customer.email || null,
        phone: parsedData.customer.phone || null,
        notes: parsedData.customer.notes || null,
      };

      customerResult = await db.insert(customers).values(newCustomer).returning();
      customerId = customerResult[0]!.id;
    }

    let dealId: string | null = null;

    if (parsedData.deal && parsedData.deal.name) {
      const newDeal: NewDeal = {
        userId,
        customerId,
        name: parsedData.deal.name,
        value: parsedData.deal.value || null,
        stage: parsedData.deal.stage,
        closeDate: parsedData.deal.closeDate
          ? new Date(parsedData.deal.closeDate)
          : null,
        description: parsedData.deal.description || null,
      };

      const dealResult = await db.insert(deals).values(newDeal).returning();
      dealId = dealResult[0]!.id;
    }

    const newInteraction: NewInteraction = {
      userId,
      customerId,
      dealId,
      type: parsedData.interaction.type,
      summary: parsedData.interaction.summary,
      keyPoints: parsedData.interaction.keyPoints,
      nextSteps: parsedData.interaction.nextSteps,
      followUpDate: parsedData.interaction.followUpDate
        ? new Date(parsedData.interaction.followUpDate)
        : null,
      transcribedFromVoice: transcript,
      voiceNoteProcessed: new Date().toISOString(),
    };

    const interactionResult = await db
      .insert(interactions)
      .values(newInteraction)
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        customerId,
        interactionId: interactionResult[0]!.id,
        dealId,
        confidence: parsedData.confidence,
        flags: parsedData.flags,
      },
    });
  } catch (error) {
    console.error("Error saving CRM data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
