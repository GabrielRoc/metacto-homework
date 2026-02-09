package com.metacto.featuresuggestion.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.metacto.featuresuggestion.data.api.ApiErrorHandler
import com.metacto.featuresuggestion.data.local.SettingsDataStore
import com.metacto.featuresuggestion.domain.usecase.CreateFeatureProposalUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CreateFeatureUiState(
    val text: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false,
    val textError: String? = null
)

@HiltViewModel
class CreateFeatureViewModel @Inject constructor(
    private val createFeatureProposal: CreateFeatureProposalUseCase,
    private val settingsDataStore: SettingsDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(CreateFeatureUiState())
    val uiState: StateFlow<CreateFeatureUiState> = _uiState.asStateFlow()

    fun onTextChanged(text: String) {
        _uiState.value = _uiState.value.copy(text = text, textError = null)
    }

    fun submit() {
        val state = _uiState.value

        if (state.text.length < 10) {
            _uiState.value = _uiState.value.copy(textError = "Text must be at least 10 characters")
            return
        }
        if (state.text.length > 500) {
            _uiState.value = _uiState.value.copy(textError = "Text must be at most 500 characters")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmitting = true, error = null)
            try {
                val email = settingsDataStore.getEmail().first()
                createFeatureProposal(state.text, email)
                _uiState.value = _uiState.value.copy(isSubmitting = false, isSuccess = true)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    error = ApiErrorHandler.getReadableMessage(e)
                )
            }
        }
    }
}
