import { createSlice } from '@reduxjs/toolkit';

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    progress: 0,
    statusMessage: 'Ready to extract complaint document details.',
    groqApiKey: '',
    analysisResult: null,
    chatMessages: [
      {
        id: 1,
        sender: 'assistant',
        text: 'Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    isCopilotThinking: false,
  },
  reducers: {
    setGroqApiKey: (state, action) => {
      state.groqApiKey = action.payload;
    },
    setExtractionProgress: (state, action) => {
      const { progress, message, status } = action.payload;
      if (progress !== undefined) state.progress = progress;
      if (message !== undefined) state.statusMessage = message;
      if (status !== undefined) state.status = status;
    },
    setAnalysisResult: (state, action) => {
      state.analysisResult = action.payload;
      state.status = 'success';
      state.progress = 100;
      state.statusMessage = 'Extraction complete! Form fields updated successfully.';
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push({
        id: Date.now(),
        sender: action.payload.sender,
        text: action.payload.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    },
    setCopilotThinking: (state, action) => {
      state.isCopilotThinking = action.payload;
    },
    resetAiState: (state) => {
      state.status = 'idle';
      state.progress = 0;
      state.statusMessage = 'Ready to extract complaint document details.';
      state.analysisResult = null;
    },
  },
});

export const {
  setGroqApiKey,
  setExtractionProgress,
  setAnalysisResult,
  addChatMessage,
  setCopilotThinking,
  resetAiState,
} = aiSlice.actions;

export default aiSlice.reducer;
