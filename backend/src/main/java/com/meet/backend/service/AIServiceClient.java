package com.meet.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.Map;

@Service
public class AIServiceClient {
  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${app.aiservice.url}")
  private String baseUrl;

  public Map<String, Object> processAudio(String filePath) {
    return sendMultipart(filePath, "/process/audio");
  }

  public Map<String, Object> processPdf(String filePath) {
    return sendMultipart(filePath, "/process/pdf");
  }

  public Map<String, Object> processVideo(String filePath) {
    return sendMultipart(filePath, "/process/video");
  }

  private Map<String, Object> sendMultipart(String filePath, String endpoint) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);

    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
    body.add("file", new FileSystemResource(new File(filePath)));

    HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
    ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + endpoint, request, Map.class);

    return response.getBody();
  }

  public void storeChunks(Map<String, Object> payload) {
    restTemplate.postForLocation(baseUrl + "/embed/store", payload, Map.class);
  }
}
