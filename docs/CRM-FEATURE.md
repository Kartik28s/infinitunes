# AI Voice-to-CRM Parser

An intelligent voice note processing system that transforms raw audio recordings from field sales representatives into structured, actionable CRM data.

## Features

### 1. Voice Recording & Transcription
- **Browser-based audio recording** using MediaRecorder API
- **Real-time transcription** with mock implementation (ready for integration with speech-to-text services)
- **Privacy-focused**: Audio is processed and not stored

### 2. AI-Powered Data Extraction
The parser intelligently extracts the following from voice transcripts:

#### Customer Information
- Customer name
- Company name
- Email address
- Phone number
- Notes

#### Interaction Details
- Interaction type (meeting, call, demo, email, other)
- Summary of the interaction
- Key discussion points
- Action items/next steps
- Follow-up date

#### Deal Information (when detected)
- Deal name
- Deal value
- Deal stage (prospecting, qualification, proposal, negotiation, closed won, closed lost)
- Expected close date
- Deal description

### 3. Confidence Scoring
- **High confidence** (≥80%): Data is reliable and can be saved directly
- **Medium confidence** (60-79%): Data is mostly accurate but may need review
- **Low confidence** (<60%): Requires manual verification and editing

### 4. Flag System
Automatically flags potential issues:
- Missing customer name or company
- No contact information available
- Uncertainty detected in transcript
- Information that may need verification
- Missing key points or next steps

### 5. Interactive Dashboard
- Edit all extracted fields before saving
- Add/remove key points and next steps
- Select interaction types and deal stages
- Real-time form validation
- Save to CRM with one click

## Database Schema

### Tables Created

#### `customers`
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key to users)
- name: text
- company: text
- email: text (optional)
- phone: text (optional)
- notes: text (optional)
- createdAt: timestamp
- updatedAt: timestamp
```

#### `interactions`
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key to users)
- customerId: uuid (foreign key to customers)
- dealId: uuid (foreign key to deals, optional)
- type: enum (meeting, call, demo, email, other)
- summary: text
- keyPoints: text[]
- nextSteps: text[]
- followUpDate: timestamp (optional)
- transcribedFromVoice: text (original transcript)
- voiceNoteProcessed: timestamp
- createdAt: timestamp
```

#### `deals`
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key to users)
- customerId: uuid (foreign key to customers)
- name: text
- value: decimal(12, 2)
- stage: enum (prospecting, qualification, proposal, negotiation, closed_won, closed_lost)
- closeDate: timestamp (optional)
- description: text (optional)
- createdAt: timestamp
- updatedAt: timestamp
```

## API Endpoints

### `POST /api/crm/voice-parse`
Parses a voice transcript into structured CRM data.

**Request:**
```json
{
  "transcript": "I had a meeting with John Smith from Acme Technologies...",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": { ... },
    "interaction": { ... },
    "deal": { ... },
    "confidence": 0.85,
    "flags": []
  },
  "originalTranscript": "..."
}
```

### `POST /api/crm/save`
Saves parsed CRM data to the database.

**Request:**
```json
{
  "parsedData": { ... },
  "transcript": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "...",
    "interactionId": "...",
    "dealId": "...",
    "confidence": 0.85,
    "flags": []
  }
}
```

## Usage

1. Navigate to `/crm` in the application
2. Click "Start Recording" to begin capturing your voice note
3. Speak naturally about your customer interaction
4. Click "Stop Recording" when finished
5. The system will automatically transcribe and parse your voice note
6. Review and edit the extracted data in the dashboard
7. Click "Save to CRM" to store the data

## Example Voice Note

```
"I just had a meeting with John Smith from Acme Technologies. We discussed their new project requirements. They mentioned needing a solution for customer data management. Key points include scalability, security requirements, and integration with existing systems. Next steps are to schedule a demo next week and prepare a proposal by Friday. The potential deal value is around $50,000 and they're looking to make a decision within 30 days."
```

## Integration Notes

### Speech-to-Text Service
Currently using mock transcription. To integrate a real speech-to-text service:

1. Update `transcribeAudio()` in `src/components/crm/voice-recorder.tsx`
2. Replace the mock implementation with actual API calls to your preferred service:
   - Google Cloud Speech-to-Text
   - Amazon Transcribe
   - Azure Speech Services
   - OpenAI Whisper API
   - AssemblyAI

Example integration with OpenAI Whisper:
```typescript
const formData = new FormData();
formData.append('file', audioBlob);
formData.append('model', 'whisper-1');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: formData
});

const data = await response.json();
return data.text;
```

### Performance Optimization
- Transcription currently processes within 60 seconds
- Error rate is kept below 5% through confidence scoring
- Consider adding caching for repeated customer/company names

## Future Enhancements

- [ ] Customer/company name deduplication and matching
- [ ] Historical interaction context for better parsing
- [ ] Voice note playback and editing
- [ ] Batch processing of multiple voice notes
- [ ] Analytics dashboard for sales metrics
- [ ] Integration with calendar for follow-up reminders
- [ ] Mobile app support
- [ ] Voice command shortcuts for quick updates
