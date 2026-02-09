package com.metacto.featuresuggestion.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.metacto.featuresuggestion.presentation.navigation.AppNavigation
import com.metacto.featuresuggestion.presentation.theme.FeatureSuggestionTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FeatureSuggestionTheme {
                AppNavigation()
            }
        }
    }
}
