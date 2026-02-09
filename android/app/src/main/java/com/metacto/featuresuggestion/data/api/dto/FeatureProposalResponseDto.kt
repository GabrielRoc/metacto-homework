package com.metacto.featuresuggestion.data.api.dto

import com.metacto.featuresuggestion.domain.model.FeatureProposal

data class FeatureProposalResponseDto(
    val id: String,
    val text: String,
    val authorEmail: String,
    val upvoteCount: Int,
    val createdAt: String
) {
    fun toDomain(): FeatureProposal = FeatureProposal(
        id = id,
        text = text,
        authorEmail = authorEmail,
        upvoteCount = upvoteCount,
        createdAt = createdAt
    )
}
