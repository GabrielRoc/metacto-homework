package com.metacto.featuresuggestion.data.repository

import com.metacto.featuresuggestion.data.api.FeatureApiService
import com.metacto.featuresuggestion.data.api.dto.CreateFeatureRequestDto
import com.metacto.featuresuggestion.data.api.dto.FeatureProposalResponseDto
import com.metacto.featuresuggestion.data.api.dto.PaginatedResponseDto
import com.metacto.featuresuggestion.data.api.dto.PaginationMetaDto
import com.metacto.featuresuggestion.data.api.dto.UpvoteRequestDto
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class FeatureRepositoryImplTest {

    private lateinit var apiService: FeatureApiService
    private lateinit var repository: FeatureRepositoryImpl

    @Before
    fun setUp() {
        apiService = mock()
        repository = FeatureRepositoryImpl(apiService)
    }

    @Test
    fun `getFeatureProposals maps DTO to domain correctly`() = runTest {
        val dto = PaginatedResponseDto(
            data = listOf(
                FeatureProposalResponseDto("1", "Test feature text", "test@test.com", 5, "2024-01-01")
            ),
            meta = PaginationMetaDto(1, 10, 1, 1)
        )
        whenever(apiService.getFeatures(1, 10)).thenReturn(dto)

        val result = repository.getFeatureProposals(1, 10)

        assertEquals(1, result.data.size)
        assertEquals("1", result.data[0].id)
        assertEquals("Test feature text", result.data[0].text)
        assertEquals(5, result.data[0].upvoteCount)
        assertEquals(1, result.page)
    }

    @Test
    fun `createFeatureProposal maps DTO to domain correctly`() = runTest {
        val dto = FeatureProposalResponseDto("1", "New feature text", "author@test.com", 0, "2024-01-01")
        whenever(apiService.createFeature(CreateFeatureRequestDto("New feature text", "author@test.com")))
            .thenReturn(dto)

        val result = repository.createFeatureProposal("New feature text", "author@test.com")

        assertEquals("1", result.id)
        assertEquals("New feature text", result.text)
        assertEquals("author@test.com", result.authorEmail)
        verify(apiService).createFeature(CreateFeatureRequestDto("New feature text", "author@test.com"))
    }

    @Test
    fun `upvoteFeatureProposal maps DTO to domain correctly`() = runTest {
        val dto = FeatureProposalResponseDto("f1", "Feature text", "author@test.com", 1, "2024-01-01")
        whenever(apiService.upvoteFeature("f1", UpvoteRequestDto("voter@test.com")))
            .thenReturn(dto)

        val result = repository.upvoteFeatureProposal("f1", "voter@test.com")

        assertEquals(1, result.upvoteCount)
        verify(apiService).upvoteFeature("f1", UpvoteRequestDto("voter@test.com"))
    }
}
