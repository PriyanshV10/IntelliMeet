package com.meet.backend.service;

import com.meet.backend.entity.Meeting;
import com.meet.backend.repository.MeetingRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MeetingService {

  private final MeetingRepository meetingRepository;
  private final UploadService uploadService;
  private final AIServiceClient aiClient;

  public MeetingService(
      MeetingRepository meetingRepository, UploadService uploadService, AIServiceClient aiClient) {
    this.meetingRepository = meetingRepository;
    this.uploadService = uploadService;
    this.aiClient = aiClient;
  }

  @Async
  public void processMeetingFiles(
      Meeting meeting, MultipartFile audio, MultipartFile pdf, MultipartFile video) {
    try {
      List<Map<String, Object>> allChunks = new ArrayList<>();
      int chunkIdCounter = 1;

      int slideCount = 0;

      if (audio != null && !audio.isEmpty()) {
        String audioPath = uploadService.store(audio, meeting.getId());
        meeting.setAudioPath(audioPath);
        Map<String, Object> audioRes = aiClient.processAudio(audioPath);
        List<Map<String, Object>> segments = (List<Map<String, Object>>) audioRes.get("segments");

        for (Map<String, Object> segment : segments) {
          Map<String, Object> chunk = new HashMap<>();
          chunk.put("chunk_id", "chunk-audio-" + chunkIdCounter++);
          chunk.put("text", segment.get("text"));

          Map<String, Object> meta = new HashMap<>();
          meta.put("type", "transcript");
          meta.put("start", segment.get("start"));

          chunk.put("metadata", meta);
          allChunks.add(chunk);
        }
      }

      if (pdf != null && !pdf.isEmpty()) {
        String pdfPath = uploadService.store(pdf, meeting.getId());
        meeting.setPdfPath(pdfPath);
        Map<String, Object> pdfRes = aiClient.processPdf(pdfPath);
        List<Map<String, Object>> pages = (List<Map<String, Object>>) pdfRes.get("pages");
        slideCount = pages.size();

        for (Map<String, Object> page : pages) {
          Map<String, Object> chunk = new HashMap<>();
          chunk.put("chunk_id", "chunk-pdf-" + chunkIdCounter++);
          chunk.put("text", page.get("text"));

          Map<String, Object> meta = new HashMap<>();
          meta.put("type", "slide");
          meta.put("page_number", page.get("page_number"));
          chunk.put("metadata", meta);
          allChunks.add(chunk);
        }
      }

      if (video != null && !video.isEmpty()) {
        String videoPath = uploadService.store(video, meeting.getId());
        meeting.setVideoPath(videoPath);
        Map<String, Object> videoRes = aiClient.processVideo(videoPath);
        List<Map<String, Object>> frames = (List<Map<String, Object>>) videoRes.get("frames");

        for (Map<String, Object> frame : frames) {
          Map<String, Object> chunk = new HashMap<>();
          chunk.put("chunk_id", "chunk-video-" + chunkIdCounter++);
          chunk.put("text", frame.get("ocr_text"));

          Map<String, Object> meta = new HashMap<>();
          meta.put("type", "video_frame");
          meta.put("timestamp_seconds", frame.get("timestamp_seconds"));
          chunk.put("metadata", meta);
          allChunks.add(chunk);
        }
      }

      if (!allChunks.isEmpty()) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("meeting_id", meeting.getId().toString());
        payload.put("chunks", allChunks);
        aiClient.storeChunks(payload);
      }

      meeting.setStatus(Meeting.Status.READY);
      meeting.setChunkCount(allChunks.size());
      meeting.setSlideCount(slideCount);

      meetingRepository.save(meeting);
    } catch (Exception e) {
      e.printStackTrace();
      meeting.setStatus(Meeting.Status.FAILED);
      meetingRepository.save(meeting);
    }
  }
}
