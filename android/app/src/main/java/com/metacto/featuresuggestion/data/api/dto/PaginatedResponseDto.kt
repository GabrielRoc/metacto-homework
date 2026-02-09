package com.metacto.featuresuggestion.data.api.dto

import com.metacto.featuresuggestion.domain.model.PaginatedResult

data class PaginationMetaDto(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)

data class PaginatedResponseDto(
    val data: List<FeatureProposalResponseDto>,
    val meta: PaginationMetaDto
) {
    fun toDomain(): PaginatedResult = PaginatedResult(
        data = data.map { it.toDomain() },
        page = meta.page,
        limit = meta.limit,
        total = meta.total,
        totalPages = meta.totalPages
    )
}
