# AI Moderation Setup Guide

## 🚀 Phase 1: Basic Text Moderation

This guide will help you set up the AI moderation system for your Christian community platform.

### **Required Environment Variables**

Add these to your `.env.local` file:

```bash
# OpenAI for AI Moderation
OPENAI_API_KEY=your_openai_api_key_here
```

### **Getting Your OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in your dashboard
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### **Features Implemented**

#### **✅ Real-time Content Moderation**
- Analyzes content as users type
- Provides immediate feedback
- Prevents inappropriate content from being posted

#### **✅ Community-Specific Guidelines**
- Christian community guidelines
- Respectful and edifying content requirements
- Biblical soundness checks

#### **✅ Multi-level Moderation**
- **Allow**: Content is appropriate
- **Flag**: Content needs review
- **Block**: Content violates guidelines

#### **✅ User-Friendly Feedback**
- Real-time moderation status
- Clear explanations of issues
- Confidence scores
- Detailed flag descriptions

### **How It Works**

1. **User Types Content**: As users type in forms, content is automatically analyzed
2. **AI Analysis**: OpenAI's GPT-4 analyzes content against community guidelines
3. **Real-time Feedback**: Users see immediate feedback about their content
4. **Submission Control**: Inappropriate content cannot be submitted
5. **Detailed Explanations**: Users understand why content was flagged

### **Testing the System**

#### **Test Cases to Try:**

1. **✅ Appropriate Content**:
   ```
   "I found this passage really encouraging for my daily walk with God."
   ```

2. **⚠️ Flagged Content**:
   ```
   "This is the worst thing I've ever read, you're all wrong!"
   ```

3. **❌ Blocked Content**:
   ```
   [Inappropriate content that violates guidelines]
   ```

### **Integration Points**

The moderation system is currently integrated with:
- ✅ **AddResponseForm**: Community response creation
- ✅ **Real-time feedback**: As users type
- ✅ **Submission prevention**: Blocks inappropriate content

### **Next Steps (Phase 2)**

Once Phase 1 is working, we can add:
- Image moderation with GPT-4 Vision
- Comment moderation
- Blog post moderation
- Admin moderation dashboard
- Appeal system for flagged content

### **Troubleshooting**

#### **Common Issues:**

1. **"Moderation service temporarily unavailable"**
   - Check your OpenAI API key
   - Verify your API key has sufficient credits
   - Check network connectivity

2. **"Content is being reviewed..." (stuck)**
   - The debounce timer might be too long
   - Check browser console for errors
   - Verify API endpoint is working

3. **No moderation feedback appearing**
   - Ensure you have content in the text area
   - Check browser network tab for API calls
   - Verify environment variables are set

### **API Endpoints**

- `POST /api/moderation` - Analyze content
- `GET /api/moderation` - Get moderation guidelines

### **Configuration Options**

You can customize the moderation behavior by editing:
- `lib/ai/moderation.ts` - Guidelines and prompts
- `hooks/useModeration.ts` - Debounce timing and behavior
- `components/ui/moderation-feedback.tsx` - UI appearance

### **Cost Considerations**

- OpenAI GPT-4: ~$0.03 per 1K tokens
- Typical response analysis: ~500-1000 tokens
- Estimated cost per moderation: ~$0.015-0.03

### **Security Notes**

- All content is sent to OpenAI for analysis
- No content is stored by OpenAI (they don't train on your data)
- API keys should be kept secure
- Consider implementing rate limiting for production

---

**Ready to test?** Start your development server and try creating a response to see the AI moderation in action! 