package com.metacto.featuresuggestion.domain.usecase

import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class UpvoteFeatureProposalUseCaseTest {

    private lateinit var repository: FeatureRepository
    private lateinit var useCase: UpvoteFeatureProposalUseCase

    @Before
    fun setUp() {
        repository = mock()
        useCase = UpvoteFeatureProposalUseCase(repository)
    }

    @Test
    fun `invoke calls repository with correct parameters`() = runTest {
        val expected = FeatureProposal("f1", "Some feature text", "author@test.com", 1, "2024-01-01")
        whenever(repository.upvoteFeatureProposal("f1", "voter@test.com"))
            .thenReturn(expected)

        val result = useCase("f1", "voter@test.com")

        assertEquals(expected, result)
        verify(repository).upvoteFeatureProposal("f1", "voter@test.com")
    }
}
