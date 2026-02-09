package com.metacto.featuresuggestion.domain.usecase

import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import javax.inject.Inject

class UpvoteFeatureProposalUseCase @Inject constructor(
    private val repository: FeatureRepository
) {
    suspend operator fun invoke(featureId: String, email: String): FeatureProposal {
        return repository.upvoteFeatureProposal(featureId, email)
    }
}
