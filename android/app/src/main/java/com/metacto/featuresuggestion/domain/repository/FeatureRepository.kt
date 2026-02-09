package com.metacto.featuresuggestion.domain.repository

import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.model.PaginatedResult

interface FeatureRepository {
    suspend fun getFeatureProposals(page: Int, limit: Int, sortBy: String = "createdAt", sortOrder: String = "desc"): PaginatedResult
    suspend fun createFeatureProposal(text: String, authorEmail: String): FeatureProposal
    suspend fun upvoteFeatureProposal(featureId: String, email: String): FeatureProposal
}
