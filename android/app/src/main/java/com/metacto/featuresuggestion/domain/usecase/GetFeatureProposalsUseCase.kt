package com.metacto.featuresuggestion.domain.usecase

import com.metacto.featuresuggestion.domain.model.PaginatedResult
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import javax.inject.Inject

class GetFeatureProposalsUseCase @Inject constructor(
    private val repository: FeatureRepository
) {
    suspend operator fun invoke(page: Int, limit: Int = 10, sortBy: String = "createdAt", sortOrder: String = "desc"): PaginatedResult {
        return repository.getFeatureProposals(page, limit, sortBy, sortOrder)
    }
}
