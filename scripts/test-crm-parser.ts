#!/usr/bin/env bun
/**
 * Test script for CRM voice parser
 * Run with: bun scripts/test-crm-parser.ts
 */

import { voiceNoteParser } from "../src/lib/crm/voice-parser";

const testTranscripts = [
  {
    name: "Initial Sales Call",
    text: "I had a call with Sarah Johnson from TechStart Inc. She's interested in our enterprise solution. We discussed their current pain points with data management and how our product could help. Key points include their need for better analytics, integration with their existing CRM, and scalability for their growing team. Next steps are to send a product demo link and schedule a follow-up meeting next Tuesday. The potential deal value is around $75,000.",
  },
  {
    name: "Product Demo",
    text: "Just finished a demo with Michael Chen from Global Logistics. I showed them our warehouse management features and real-time tracking capabilities. They seemed particularly interested in the automated reporting and the mobile app. We need to prepare a custom quote for their 5 warehouses and get pricing approval from their finance team. Follow up in two weeks. This deal is worth about $120,000.",
  },
  {
    name: "Deal Closing",
    text: "Great news! I just closed the deal with Emily Rodriguez at Innovative Solutions. We signed the contract for their annual subscription. The final value is $45,000 with a 20% discount applied. They'll start onboarding next Monday.",
  },
  {
    name: "Minimal Information",
    text: "Met with John from Acme. Discussed pricing.",
  },
];

console.log("Testing CRM Voice Parser\n");
console.log("=" .repeat(60));

for (const test of testTranscripts) {
  console.log(`\n📝 Test: ${test.name}`);
  console.log("-".repeat(60));
  console.log(`Transcript: "${test.text.substring(0, 100)}..."`);

  const result = voiceNoteParser.parse(test.text);

  if (result.success) {
    console.log(`\n✅ Parse Status: SUCCESS`);
    console.log(`🎯 Confidence: ${Math.round((result.data?.confidence || 0) * 100)}%`);

    if (result.data) {
      console.log("\n👤 Customer:");
      console.log(`   Name: ${result.data.customer.name}`);
      console.log(`   Company: ${result.data.customer.company}`);
      console.log(`   Email: ${result.data.customer.email || "N/A"}`);
      console.log(`   Phone: ${result.data.customer.phone || "N/A"}`);

      console.log("\n💬 Interaction:");
      console.log(`   Type: ${result.data.interaction.type}`);
      console.log(`   Summary: ${result.data.interaction.summary.substring(0, 80)}...`);
      console.log(`   Key Points: ${result.data.interaction.keyPoints.length} items`);
      console.log(`   Next Steps: ${result.data.interaction.nextSteps.length} items`);

      if (result.data.deal) {
        console.log("\n💰 Deal:");
        console.log(`   Name: ${result.data.deal.name}`);
        console.log(`   Value: ${result.data.deal.value || "N/A"}`);
        console.log(`   Stage: ${result.data.deal.stage}`);
      }

      if (result.data.flags.length > 0) {
        console.log("\n⚠️ Flags:");
        result.data.flags.forEach((flag) => console.log(`   - ${flag}`));
      }
    }
  } else {
    console.log(`\n❌ Parse Status: FAILED`);
    console.log(`Errors:`, result.errors);
  }
}

console.log("\n" + "=".repeat(60));
console.log("Test complete!");
