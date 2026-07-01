package com.mediatracker.search;

import java.io.Serializable;

public record SearchItem(
    String kind,        
    String externalId,  
    String title,
    Integer year,
    String posterUrl   
) implements Serializable {}
