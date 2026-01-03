# AI Voice-to-CRM Parser - Example Usage

This document provides practical examples of how to use the AI Voice-to-CRM parser feature.

## Quick Start

1. **Navigate to the CRM page:**
   ```
   https://your-domain.com/crm
   ```

2. **Start recording:**
   - Click the "Start Recording" button
   - Grant microphone permissions if prompted
   - Speak clearly about your customer interaction

3. **Stop and review:**
   - Click "Stop Recording" when finished
   - Wait for automatic transcription and parsing
   - Review the extracted data in the dashboard

4. **Edit and save:**
   - Make any necessary corrections
   - Add or remove key points and next steps
   - Click "Save to CRM" to store the data

## Example Voice Notes

### Example 1: Initial Sales Call

**Transcript:**
```
I had a call with Sarah Johnson from TechStart Inc. She's interested in our enterprise solution. We discussed their current pain points with data management and how our product could help. Key points include their need for better analytics, integration with their existing CRM, and scalability for their growing team. Next steps are to send a product demo link and schedule a follow-up meeting next Tuesday. The potential deal value is around $75,000.
```

**Expected Output:**
- **Customer:** Sarah Johnson, TechStart Inc.
- **Interaction Type:** Call
- **Key Points:**
  - Need for better analytics
  - Integration with existing CRM
  - Scalability for growing team
- **Next Steps:**
  - Send product demo link
  - Schedule follow-up meeting next Tuesday
- **Deal:** $75,000, Qualification stage

### Example 2: Product Demo

**Transcript:**
```
Just finished a demo with Michael Chen from Global Logistics. I showed them our warehouse management features and real-time tracking capabilities. They seemed particularly interested in the automated reporting and the mobile app. We need to prepare a custom quote for their 5 warehouses and get pricing approval from their finance team. Follow up in two weeks. This deal is worth about $120,000.
```

**Expected Output:**
- **Customer:** Michael Chen, Global Logistics
- **Interaction Type:** Demo
- **Key Points:**
  - Showed warehouse management features
  - Demonstrated real-time tracking
  - Interest in automated reporting
  - Interest in mobile app
- **Next Steps:**
  - Prepare custom quote for 5 warehouses
  - Get pricing approval from finance team
  - Follow up in two weeks
- **Deal:** $120,000, Proposal stage

### Example 3: Deal Closing

**Transcript:**
```
Great news! I just closed the deal with Emily Rodriguez at Innovative Solutions. We signed the contract for their annual subscription. The final value is $45,000 with a 20% discount applied. They'll start onboarding next Monday. The deal moved from negotiation to closed won. Need to coordinate with the customer success team for the kickoff meeting.
```

**Expected Output:**
- **Customer:** Emily Rodriguez, Innovative Solutions
- **Interaction Type:** Meeting
- **Key Points:**
  - Signed contract for annual subscription
  - 20% discount applied
  - Onboarding starts next Monday
- **Next Steps:**
  - Coordinate with customer success team
  - Schedule kickoff meeting
- **Deal:** $45,000, Closed Won stage

## Best Practices for Voice Notes

### 1. Speak Clearly and Naturally
- Use a normal speaking pace
- Enunciate key names and numbers
- Avoid excessive filler words ("um", "uh", "like")

### 2. Structure Your Notes
- Start with customer and company names
- Mention interaction type early
- Group related information together
- End with clear next steps

### 3. Be Specific with Details
- **Bad:** "They have some money"
- **Good:** "The deal value is around $50,000"

- **Bad:** "Contact them sometime"
- **Good:** "Follow up on Friday, January 15th"

### 4. Use Action Verbs
- "Schedule a demo" ✓
- "Need to schedule" ✓
- "We should probably think about scheduling" ✗

### 5. Quantify When Possible
- Deal values: "$75,000"
- Timeframes: "within 30 days"
- Quantities: "5 warehouses", "3 key requirements"

## Editing Extracted Data

### Adding Key Points
1. Scroll to the "Key Points" section
2. Click "Add" button
3. Enter the new key point
4. Click away to save

### Removing Items
1. Click the "✕" button next to the item
2. The item is immediately removed

### Changing Deal Stage
1. Click on the deal stage dropdown
2. Select the appropriate stage:
   - Prospecting - Initial contact
   - Qualification - Qualified lead
   - Proposal - Proposal sent
   - Negotiation - In negotiations
   - Closed Won - Deal won
   - Closed Lost - Deal lost

## Common Patterns Recognized

### Customer Names
- "Spoke with John Smith"
- "Meeting with Maria Garcia"
- "Called Alex Johnson"

### Company Names
- "From Acme Technologies"
- "Working with Global Corp"
- "At Innovate Solutions"

### Interaction Types
- "Meeting" → Meeting
- "Called", "Spoke", "Conversation" → Call
- "Demo", "Demonstration" → Demo
- "Emailed", "Sent email" → Email

### Deal Values
- "$50,000"
- "around 75k"
- "about one hundred thousand dollars"

### Dates
- "next Tuesday"
- "January 15th"
- "in two weeks"
- "by Friday"

### Next Steps
- "Next step is to..."
- "Need to..."
- "Will schedule..."
- "Action item:..."

## Troubleshooting

### Issue: Low Confidence Score
**Solution:**
- Review all fields for accuracy
- Check that customer and company names are correct
- Verify contact information if possible
- Add more detail to key points and next steps

### Issue: Missing Deal Information
**Solution:**
- The parser only creates a deal if it detects deal-specific information
- Manually add deal information if appropriate
- Use phrases like "deal value", "worth", "close date" to trigger deal detection

### Issue: Incorrect Interaction Type
**Solution:**
- Manually select the correct type from the dropdown
- Use clearer language in future notes (e.g., "I had a meeting" vs "I talked to them")

### Issue: No Transcription
**Solution:**
- Check microphone permissions
- Ensure you're speaking clearly
- Verify your internet connection (for cloud transcription services)
- Try recording again

## Advanced Usage

### Multiple Interactions in One Note
The parser handles multiple interactions by creating separate entries:
```
I called John to confirm our meeting tomorrow. Then I sent an email to Sarah with the proposal.
```

### Complex Deal Information
For complex deals, be more specific:
```
This is a multi-stage deal worth $250,000 total. First phase is $100,000 for implementation, second phase is $150,000 for customization. Close date expected in Q2.
```

### Team Mentions
You can mention team members for context:
```
Emily from the sales team will handle the technical review. David from engineering needs to assess integration requirements.
```

## Integration with Calendar

For future integration, the parser could automatically create calendar events:
```
Follow up meeting next Tuesday at 2pm
```

Would become:
- Calendar event: "Follow-up with [Customer]"
- Date/Time: Next Tuesday, 2:00 PM
- Attendees: Sales rep, customer

## Performance Metrics

Target performance metrics:
- ✅ Processing time: < 60 seconds
- ✅ Transcription accuracy: > 99%
- ✅ Information extraction: < 5% error rate
- ✅ Confidence scoring: Reliable indicators

## Support

For issues or questions:
1. Check the documentation in `docs/CRM-FEATURE.md`
2. Review the code in `src/lib/crm/voice-parser.ts`
3. Check API endpoints in `src/app/api/crm/`
4. Contact development team for assistance
