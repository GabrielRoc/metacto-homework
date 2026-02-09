package com.metacto.featuresuggestion.presentation.viewmodel

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.metacto.featuresuggestion.data.local.SettingsDataStore
import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.model.PaginatedResult
import com.metacto.featuresuggestion.domain.usecase.GetFeatureProposalsUseCase
import com.metacto.featuresuggestion.domain.usecase.UpvoteFeatureProposalUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

@OptIn(ExperimentalCoroutinesApi::class)
class FeatureListViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var getFeatureProposals: GetFeatureProposalsUseCase
    private lateinit var upvoteFeatureProposal: UpvoteFeatureProposalUseCase
    private lateinit var settingsDataStore: SettingsDataStore

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        getFeatureProposals = mock()
        upvoteFeatureProposal = mock()
        settingsDataStore = mock()
        whenever(settingsDataStore.getEmail()).thenReturn(flowOf("test@test.com"))
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial load fetches features successfully`() = runTest {
        val result = PaginatedResult(
            data = listOf(FeatureProposal("1", "Test feature", "test@test.com", 0, "2024-01-01")),
            page = 1,
            limit = 10,
            total = 1,
            totalPages = 1
        )
        whenever(getFeatureProposals.invoke(any(), any(), any(), any())).thenReturn(result)

        val viewModel = FeatureListViewModel(getFeatureProposals, upvoteFeatureProposal, settingsDataStore)
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals(1, state.features.size)
        assertNull(state.error)
    }

    @Test
    fun `load features sets error on failure`() = runTest {
        whenever(getFeatureProposals.invoke(any(), any(), any(), any())).thenThrow(RuntimeException("Network error"))

        val viewModel = FeatureListViewModel(getFeatureProposals, upvoteFeatureProposal, settingsDataStore)
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals("Network error", state.error)
        assertTrue(state.features.isEmpty())
    }

    @Test
    fun `refresh updates features`() = runTest {
        val initialResult = PaginatedResult(
            data = listOf(FeatureProposal("1", "Initial feature", "test@test.com", 0, "2024-01-01")),
            page = 1, limit = 10, total = 1, totalPages = 1
        )
        val refreshResult = PaginatedResult(
            data = listOf(
                FeatureProposal("1", "Initial feature", "test@test.com", 0, "2024-01-01"),
                FeatureProposal("2", "New feature added", "new@test.com", 0, "2024-01-02")
            ),
            page = 1, limit = 10, total = 2, totalPages = 1
        )
        whenever(getFeatureProposals.invoke(any(), any(), any(), any()))
            .thenReturn(initialResult)
            .thenReturn(refreshResult)

        val viewModel = FeatureListViewModel(getFeatureProposals, upvoteFeatureProposal, settingsDataStore)
        advanceUntilIdle()

        viewModel.refresh()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(2, state.features.size)
        assertFalse(state.isRefreshing)
    }
}
