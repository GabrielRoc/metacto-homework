package com.metacto.featuresuggestion.domain.model

data class FeatureProposal(
    val id: String,
    val text: String,
    val authorEmail: String,
    val upvoteCount: Int,
    val createdAt: String
)
