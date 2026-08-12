package com.kaushik27.gameofthrones.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class SpaForwardController {
    @GetMapping({"/", "/people", "/people/{characterId}", "/houses", "/stories", "/battles", "/quotes", "/architecture"})
    String forwardToReact() {
        return "forward:/index.html";
    }
}
