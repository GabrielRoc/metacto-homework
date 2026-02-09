package com.metacto.featuresuggestion.domain.usecase

import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.model.PaginatedResult
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class GetFeatureProposalsUseCaseTest {

    private lateinit var repository: FeatureRepository
    private lateinit var useCase: GetFeatureProposalsUseCase

    @Before
    fun setUp() {
        repository = mock()
        useCase = GetFeatureProposalsUseCase(repository)
    }

    @Test
    fun `invoke calls repository with correct parameters`() = runTest {
        val expected = PaginatedResult(
            data = listOf(
                FeatureProposal("1", "Test proposal text", "test@test.com", 5, "2024-01-01")
            ),
            page = 1,
            limit = 10,
            total = 1,
            totalPages = 1
        )
        whenever(repository.getFeatureProposals(1, 10)).thenReturn(expected)

        val result = useCase(1, 10)

        assertEquals(expected, result)
        verify(repository).getFeatureProposals(1, 10)
    }

    @Test
    fun `invoke uses default limit of 10`() = runTest {
        val expected = PaginatedResult(
            data = emptyList(),
            page = 2,
            limit = 10,
            total = 0,
            totalPages = 0
        )
        whenever(repository.getFeatureProposals(2, 10)).thenReturn(expected)

        val result = useCase(2)

        assertEquals(expected, result)
        verify(repository).getFeatureProposals(2, 10)
    }
}
