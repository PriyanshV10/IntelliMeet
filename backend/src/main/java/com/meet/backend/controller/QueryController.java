package com.meet.backend.controller;

import com.meet.backend.entity.QueryMessage;
import com.meet.backend.entity.Meeting;
import com.meet.backend.repository.QueryMessageRepository;
import com.meet.backend.repository.MeetingRepository;
import com.meet.backend.service.AIServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings/{id}/query")
@CrossOrigin(origins = "*")
public class QueryController {

    private final QueryMessageRepository queryMessageRepository;
    private final MeetingRepository meetingRepository;
    private final AIServiceClient aiServiceClient;

    public QueryController(QueryMessageRepository queryMessageRepository, MeetingRepository meetingRepository, AIServiceClient aiServiceClient) {
        this.queryMessageRepository = queryMessageRepository;
        this.meetingRepository = meetingRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping
    public ResponseEntity<?> askQuestion(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Question is required");
        }

        Meeting meeting = meetingRepository.findById(id).orElse(null);
        if (meeting == null) {
            return ResponseEntity.notFound().build();
        }

        if (meeting.getStatus() != Meeting.Status.READY) {
            return ResponseEntity.badRequest().body("Meeting is not fully processed yet");
        }

        try {
            // Call FastAPI
            Map<String, Object> aiResponse = aiServiceClient.queryMeeting(id.toString(), question);
            String answer = (String) aiResponse.get("answer");

            QueryMessage queryMessage = new QueryMessage();
            queryMessage.setMeeting(meeting);
            queryMessage.setQuestion(question);
            queryMessage.setAnswer(answer);
            queryMessage.setCreatedAt(LocalDateTime.now());
            
            queryMessage = queryMessageRepository.save(queryMessage);

            // Include sources in the return object so frontend can show them, but we don't save sources to DB to keep it simple.
            return ResponseEntity.ok(Map.of(
                "message", queryMessage,
                "sources", aiResponse.get("sources")
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to communicate with AI Service");
        }
    }

    @GetMapping
    public ResponseEntity<List<QueryMessage>> getQueryHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(queryMessageRepository.findByMeetingIdOrderByCreatedAtAsc(id));
    }
}
