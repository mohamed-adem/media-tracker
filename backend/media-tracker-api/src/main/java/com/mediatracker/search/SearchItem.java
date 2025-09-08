package com.mediatracker.search;

public record SearchItem(
    String kind,        
    String externalId,  
    String title,
    Integer year,
    String posterUrl   
) {}