package com.meet.backend.repository;

import com.meet.backend.entity.QueryMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QueryMessageRepository extends JpaRepository<QueryMessage, UUID> {
    List<QueryMessage> findByMeetingIdOrderByCreatedAtAsc(UUID meetingId);
}
