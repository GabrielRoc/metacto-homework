package com.metacto.featuresuggestion.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.metacto.featuresuggestion.presentation.screen.CreateFeatureScreen
import com.metacto.featuresuggestion.presentation.screen.FeatureListScreen
import com.metacto.featuresuggestion.presentation.screen.SettingsScreen
import com.metacto.featuresuggestion.presentation.viewmodel.FeatureListViewModel

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "feature_list") {
        composable("feature_list") {
            val viewModel: FeatureListViewModel = hiltViewModel()
            val uiState by viewModel.uiState.collectAsState()

            LaunchedEffect(uiState.savedEmail, uiState.emailChecked) {
                if (uiState.emailChecked && uiState.savedEmail.isEmpty()) {
                    navController.navigate("settings") {
                        launchSingleTop = true
                    }
                }
            }

            FeatureListScreen(
                onNavigateToCreate = { navController.navigate("create_feature") },
                onNavigateToSettings = { navController.navigate("settings") },
                viewModel = viewModel
            )
        }
        composable("create_feature") {
            CreateFeatureScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("settings") {
            SettingsScreen(
                onNavigateBack = {
                    if (!navController.popBackStack()) {
                        navController.navigate("feature_list") {
                            popUpTo("feature_list") { inclusive = true }
                        }
                    }
                }
            )
        }
    }
}
