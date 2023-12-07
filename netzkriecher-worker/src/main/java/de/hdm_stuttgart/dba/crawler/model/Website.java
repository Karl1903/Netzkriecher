package de.hdm_stuttgart.dba.crawler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Website {
    private int Id;
    private String htmlLink;
}
