package com.meet.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class UploadService {

  @Value("${app.upload.dir}")
  private String root;

  @PostConstruct
  public void init() {
    try {
      Files.createDirectories(Paths.get(root));
    } catch (IOException e) {
      throw new RuntimeException("Could not create directory");
    }
  }

  public String store(MultipartFile file, UUID meetingId) {
    try {
      String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
      String fileName =
          meetingId.toString()
              + "_"
              + UUID.randomUUID().toString().substring(0, 5)
              + "."
              + extension;

      Path targetPath = Paths.get(root).resolve(fileName);
      Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
      
      return targetPath.toAbsolutePath().toString();
    } catch (Exception e) {
      throw new RuntimeException("Could not store file " + e.getMessage());
    }
  }
}
