package com.metacto.featuresuggestion.presentation.viewmodel

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.domain.usecase.CreateFeatureProposalUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

@OptIn(ExperimentalCoroutinesApi::class)
class CreateFeatureViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var createFeatureProposal: CreateFeatureProposalUseCase

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        createFeatureProposal = mock()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `submit with short text shows validation error`() = runTest {
        val viewModel = CreateFeatureViewModel(createFeatureProposal)
        viewModel.onTextChanged("short")
        viewModel.onEmailChanged("test@test.com")

        viewModel.submit()

        val state = viewModel.uiState.value
        assertNotNull(state.textError)
        assertFalse(state.isSubmitting)
    }

    @Test
    fun `submit with invalid email shows validation error`() = runTest {
        val viewModel = CreateFeatureViewModel(createFeatureProposal)
        viewModel.onTextChanged("This is a valid feature proposal text")
        viewModel.onEmailChanged("invalid-email")

        viewModel.submit()

        val state = viewModel.uiState.value
        assertNotNull(state.emailError)
        assertFalse(state.isSubmitting)
    }

    @Test
    fun `submit with valid data succeeds`() = runTest {
        val expected = FeatureProposal("1", "A great feature proposal text", "test@test.com", 0, "2024-01-01")
        whenever(createFeatureProposal.invoke(any(), any())).thenReturn(expected)

        val viewModel = CreateFeatureViewModel(createFeatureProposal)
        viewModel.onTextChanged("A great feature proposal text")
        viewModel.onEmailChanged("test@test.com")

        viewModel.submit()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue(state.isSuccess)
        assertNull(state.error)
    }

    @Test
    fun `submit sets error on failure`() = runTest {
        whenever(createFeatureProposal.invoke(any(), any()))
            .thenThrow(RuntimeException("Server error"))

        val viewModel = CreateFeatureViewModel(createFeatureProposal)
        viewModel.onTextChanged("A great feature proposal text")
        viewModel.onEmailChanged("test@test.com")

        viewModel.submit()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("Server error", state.error)
        assertFalse(state.isSubmitting)
    }

    @Test
    fun `onTextChanged clears text error`() {
        val viewModel = CreateFeatureViewModel(createFeatureProposal)
        viewModel.onTextChanged("short")
        viewModel.onEmailChanged("test@test.com")
        viewModel.submit()

        assertNotNull(viewModel.uiState.value.textError)

        viewModel.onTextChanged("Updated text content")
        assertNull(viewModel.uiState.value.textError)
    }
}
