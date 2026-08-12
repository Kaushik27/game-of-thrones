package com.kaushik27.gameofthrones.util;

import com.kaushik27.gameofthrones.dto.PageLinks;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class PageLinksFactory {
    public PageLinks create(int page, int pagesCount) {
        String self = link(page);
        String next = page + 1 < pagesCount ? link(page + 1) : null;
        String prev = page > 0 ? link(page - 1) : null;
        return new PageLinks(self, next, prev);
    }

    public String toHeader(PageLinks links) {
        StringBuilder value = new StringBuilder("<").append(links.self()).append(">; rel=\"self\"");
        if (links.next() != null) value.append(", <").append(links.next()).append(">; rel=\"next\"");
        if (links.prev() != null) value.append(", <").append(links.prev()).append(">; rel=\"prev\"");
        return value.toString();
    }

    private String link(int page) {
        return ServletUriComponentsBuilder.fromCurrentRequest()
                .replaceQueryParam("page", page)
                .build().toUriString();
    }
}
