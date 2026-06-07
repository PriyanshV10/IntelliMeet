package com.meet.backend.controller;

import com.meet.backend.entity.Meeting;
import com.meet.backend.repository.MeetingRepository;
import com.meet.backend.service.MeetingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

  private final MeetingRepository meetingRepository;
  private final MeetingService meetingService;

  public MeetingController(MeetingRepository meetingRepository, MeetingService meetingService) {
    this.meetingRepository = meetingRepository;
    this.meetingService = meetingService;
  }

  @PostMapping
  public ResponseEntity<?> uploadMeeting(
      @RequestParam("title") String title,
      @RequestParam(value = "audio", required = false) MultipartFile audio,
      @RequestParam(value = "pdf", required = false) MultipartFile pdf,
      @RequestParam(value = "video", required = false) MultipartFile video) {

    if ((audio == null || audio.isEmpty())
        && (pdf == null || pdf.isEmpty())
        && (video == null || video.isEmpty())) {
      return ResponseEntity.badRequest()
          .body("At least one of audio or pdf or video must be provided");
    }

    Meeting meeting = new Meeting();
    meeting.setTitle(title);
    meeting.setStatus(Meeting.Status.PROCESSING);
    meeting.setCreatedAt(LocalDateTime.now());
    meeting = meetingRepository.save(meeting);

    meetingService.processMeetingFiles(meeting, audio, pdf, video);

    return ResponseEntity.accepted().body(meeting);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Meeting> getMeeting(@PathVariable java.util.UUID id) {
    return meetingRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping
  public ResponseEntity<java.util.List<Meeting>> getAllMeetings() {
    return ResponseEntity.ok(meetingRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")));
  }
}
