package com.metacto.featuresuggestion.data.repository

import com.metacto.featuresuggestion.data.api.FeatureApiService
import com.metacto.featuresuggestion.data.api.dto.CreateFeatureRequestDto
import com.metacto.featuresuggestion.data.api.dto.UpvoteRequestDto
import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.model.PaginatedResult
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import javax.inject.Inject

class FeatureRepositoryImpl @Inject constructor(
    private val apiService: FeatureApiService
) : FeatureRepository {

    override suspend fun getFeatureProposals(page: Int, limit: Int, sortBy: String, sortOrder: String): PaginatedResult {
        return apiService.getFeatures(page, limit, sortBy, sortOrder).toDomain()
    }

    override suspend fun createFeatureProposal(text: String, authorEmail: String): FeatureProposal {
        return apiService.createFeature(CreateFeatureRequestDto(text, authorEmail)).toDomain()
    }

    override suspend fun upvoteFeatureProposal(featureId: String, email: String): FeatureProposal {
        return apiService.upvoteFeature(featureId, UpvoteRequestDto(email)).toDomain()
    }
}
