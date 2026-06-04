package com.meet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meetings")
@Data
public class Meeting {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private UUID id;

  private String title;

  @Enumerated(EnumType.STRING)
  private Status status;

  private String audioPath;
  private String pdfPath;
  private String videoPath;
  private Integer durationSeconds;
  private Integer slideCount;
  private Integer chunkCount;
  private LocalDateTime createdAt;

  public enum Status {
    PROCESSING,
    READY,
    FAILED
  }
}
