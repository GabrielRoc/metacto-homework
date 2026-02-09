package com.metacto.featuresuggestion.domain.usecase

import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import javax.inject.Inject

class CreateFeatureProposalUseCase @Inject constructor(
    private val repository: FeatureRepository
) {
    suspend operator fun invoke(text: String, authorEmail: String): FeatureProposal {
        return repository.createFeatureProposal(text, authorEmail)
    }
}
