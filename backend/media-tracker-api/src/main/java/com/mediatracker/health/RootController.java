package com.mediatracker.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
  @GetMapping("/")      public String home()   { return "ok"; }
  @GetMapping("/health") public String health() { return "healthy"; }
}