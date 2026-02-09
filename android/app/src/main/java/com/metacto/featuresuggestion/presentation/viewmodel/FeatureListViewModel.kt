package com.metacto.featuresuggestion.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.metacto.featuresuggestion.domain.model.FeatureProposal
import com.metacto.featuresuggestion.data.api.ApiErrorHandler
import com.metacto.featuresuggestion.data.local.SettingsDataStore
import com.metacto.featuresuggestion.domain.usecase.GetFeatureProposalsUseCase
import com.metacto.featuresuggestion.domain.usecase.UpvoteFeatureProposalUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FeatureListUiState(
    val features: List<FeatureProposal> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val currentPage: Int = 1,
    val totalPages: Int = 1,
    val isRefreshing: Boolean = false,
    val sortBy: String = "createdAt",
    val sortOrder: String = "desc",
    val savedEmail: String = "",
    val emailChecked: Boolean = false
)

@HiltViewModel
class FeatureListViewModel @Inject constructor(
    private val getFeatureProposals: GetFeatureProposalsUseCase,
    private val upvoteFeatureProposal: UpvoteFeatureProposalUseCase,
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeatureListUiState())
    val uiState: StateFlow<FeatureListUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            settingsDataStore.getEmail().collect { email ->
                _uiState.value = _uiState.value.copy(savedEmail = email, emailChecked = true)
            }
        }
        loadFeatures()
    }

    fun loadFeatures(page: Int = 1) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val state = _uiState.value
                val result = getFeatureProposals(page, sortBy = state.sortBy, sortOrder = state.sortOrder)
                _uiState.value = _uiState.value.copy(
                    features = result.data,
                    isLoading = false,
                    currentPage = result.page,
                    totalPages = result.totalPages
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = ApiErrorHandler.getReadableMessage(e)
                )
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true, error = null)
            try {
                val email = settingsDataStore.getEmail().first()
                val state = _uiState.value
                val result = getFeatureProposals(1, sortBy = state.sortBy, sortOrder = state.sortOrder)
                _uiState.value = _uiState.value.copy(
                    features = result.data,
                    isRefreshing = false,
                    currentPage = result.page,
                    totalPages = result.totalPages,
                    savedEmail = email
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isRefreshing = false,
                    error = ApiErrorHandler.getReadableMessage(e)
                )
            }
        }
    }

    fun setSortBy(sortBy: String) {
        _uiState.value = _uiState.value.copy(sortBy = sortBy)
        loadFeatures(1)
    }

    fun setSortOrder(sortOrder: String) {
        _uiState.value = _uiState.value.copy(sortOrder = sortOrder)
        loadFeatures(1)
    }

    fun upvote(featureId: String) {
        val email = _uiState.value.savedEmail
        viewModelScope.launch {
            try {
                upvoteFeatureProposal(featureId, email)
                loadFeatures(_uiState.value.currentPage)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = ApiErrorHandler.getReadableMessage(e)
                )
            }
        }
    }

    fun loadNextPage() {
        val state = _uiState.value
        if (state.currentPage < state.totalPages && !state.isLoading) {
            loadFeatures(state.currentPage + 1)
        }
    }
}
