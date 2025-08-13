# OMELY.AI Chat Interface

A modern, responsive chat interface for OMELY.AI powered by Google Gemini API. Built with React, Tailwind CSS, and Netlify Functions.

## Features

- 🎨 **Modern Design**: Clean, professional interface similar to ChatGPT/Claude
- 🤖 **AI Integration**: Powered by Google Gemini API
- 📱 **Responsive**: Works perfectly on mobile and desktop
- ⚡ **Real-time**: Smooth typing indicators and instant responses
- 🔒 **Secure**: API key stored securely in environment variables
- 📋 **Copy Messages**: One-click message copying functionality
- 🎯 **Auto-scroll**: Automatically scrolls to latest messages
- 🌙 **Dark Theme**: Beautiful dark gradient background

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Netlify Functions
- **AI**: Google Gemini API
- **Deployment**: Netlify

## Project Structure

```
src/
├── App.jsx                 # Main chat interface
├── components/
│   ├── ChatMessage.jsx     # Individual message bubble
│   ├── ChatInput.jsx       # Input area with send button
│   └── TypingIndicator.jsx # When AI is thinking
├── styles/
│   └── index.css          # Tailwind imports + custom styles
├── netlify/
│   └── functions/
│       └── gemini-chat.js  # Backend API call
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Netlify CLI (for local development)

```bash
npm install -g netlify-cli
```

### 4. Run Development Server

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Netlify Functions (in another terminal)
netlify dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy to Netlify

1. **Connect to Netlify**:
   - Push your code to GitHub
   - Connect your repository to Netlify

2. **Set Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key

3. **Deploy**:
   - Netlify will automatically build and deploy your site

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## API Configuration

### Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your environment variables

### Netlify Function

The `gemini-chat.js` function handles:
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Rate limiting
- ✅ Security checks
- ✅ OMELY.AI system prompt

## Features in Detail

### Chat Interface
- **Message Bubbles**: Different styles for user and AI messages
- **Timestamps**: Each message shows when it was sent
- **Copy Function**: Click the copy icon to copy any message
- **Auto-scroll**: Automatically scrolls to new messages

### Input System
- **Auto-resize**: Textarea grows with content
- **Enter to Send**: Press Enter to send, Shift+Enter for new line
- **Character Count**: Shows current character count
- **Send Button**: Beautiful gradient button with hover effects

### AI Integration
- **System Prompt**: Customized for OMELY.AI's learning focus
- **Error Handling**: Graceful error messages
- **Loading States**: Typing indicator while AI thinks
- **Response Validation**: Ensures valid responses

## Customization

### Styling
- Modify `src/index.css` for custom styles
- Update `tailwind.config.js` for theme changes
- Edit component styles in individual files

### AI Behavior
- Update the `SYSTEM_PROMPT` in `netlify/functions/gemini-chat.js`
- Modify response handling and validation

### Features
- Add file upload functionality
- Implement conversation history
- Add user authentication
- Include more AI models

## Security Considerations

- ✅ API key stored in environment variables
- ✅ Input validation and sanitization
- ✅ Rate limiting protection
- ✅ CORS properly configured
- ✅ Error messages don't expose sensitive data

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Check environment variables are set correctly
   - Verify API key is valid and has proper permissions

2. **Functions Not Working Locally**:
   - Ensure Netlify CLI is installed
   - Run `netlify dev` in a separate terminal

3. **Build Errors**:
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall

4. **Styling Issues**:
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email: support@omely.ai

---

Built with ❤️ by the OMELY.AI Team 
