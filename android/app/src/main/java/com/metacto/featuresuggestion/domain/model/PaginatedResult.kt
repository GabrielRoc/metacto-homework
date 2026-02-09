package com.metacto.featuresuggestion.domain.model

data class PaginatedResult(
    val data: List<FeatureProposal>,
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)
