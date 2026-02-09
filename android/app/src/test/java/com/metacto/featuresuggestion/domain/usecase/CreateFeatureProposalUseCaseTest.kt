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

class CreateFeatureProposalUseCaseTest {

    private lateinit var repository: FeatureRepository
    private lateinit var useCase: CreateFeatureProposalUseCase

    @Before
    fun setUp() {
        repository = mock()
        useCase = CreateFeatureProposalUseCase(repository)
    }

    @Test
    fun `invoke calls repository with correct parameters`() = runTest {
        val expected = FeatureProposal("1", "New feature proposal text", "author@test.com", 0, "2024-01-01")
        whenever(repository.createFeatureProposal("New feature proposal text", "author@test.com"))
            .thenReturn(expected)

        val result = useCase("New feature proposal text", "author@test.com")

        assertEquals(expected, result)
        verify(repository).createFeatureProposal("New feature proposal text", "author@test.com")
    }
}
