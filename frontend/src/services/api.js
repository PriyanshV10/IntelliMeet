import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadMeeting = async (title, audioFile, pdfFile, videoFile) => {
  const formData = new FormData();
  formData.append('title', title);
  if (audioFile) formData.append('audio', audioFile);
  if (pdfFile) formData.append('pdf', pdfFile);
  if (videoFile) formData.append('video', videoFile);

  const response = await apiClient.post('/meetings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMeeting = async (id) => {
  const response = await apiClient.get(`/meetings/${id}`);
  return response.data;
};

export const getAllMeetings = async () => {
  const response = await apiClient.get('/meetings');
  return response.data;
};

export const getQueryHistory = async (meetingId) => {
  const response = await apiClient.get(`/meetings/${meetingId}/query`);
  return response.data;
};

export const askQuestion = async (meetingId, question) => {
  const response = await apiClient.post(`/meetings/${meetingId}/query`, { question });
  return response.data;
};
