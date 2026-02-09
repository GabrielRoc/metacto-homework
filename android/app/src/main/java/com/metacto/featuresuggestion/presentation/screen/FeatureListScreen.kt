package com.metacto.featuresuggestion.presentation.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.metacto.featuresuggestion.presentation.components.FeatureCard
import com.metacto.featuresuggestion.presentation.viewmodel.FeatureListViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeatureListScreen(
    onNavigateToCreate: () -> Unit,
    onNavigateToSettings: () -> Unit,
    viewModel: FeatureListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(
                message = it,
                actionLabel = "OK",
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Feature Proposals") },
                actions = {
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToCreate) {
                Icon(Icons.Default.Add, contentDescription = "Create proposal")
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading && uiState.features.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                uiState.features.isEmpty() -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("No feature proposals yet", style = MaterialTheme.typography.bodyLarge)
                        Spacer(modifier = Modifier.height(8.dp))
                        TextButton(onClick = { viewModel.refresh() }) {
                            Text("Refresh")
                        }
                    }
                }
                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            SortControls(
                                sortBy = uiState.sortBy,
                                sortOrder = uiState.sortOrder,
                                onSortByChanged = viewModel::setSortBy,
                                onSortOrderChanged = viewModel::setSortOrder
                            )
                        }
                        items(uiState.features, key = { it.id }) { proposal ->
                            FeatureCard(
                                proposal = proposal,
                                onUpvote = { id -> viewModel.upvote(id) }
                            )
                        }
                        if (uiState.currentPage < uiState.totalPages) {
                            item {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    LaunchedEffect(Unit) { viewModel.loadNextPage() }
                                    CircularProgressIndicator()
                                }
                            }
                        }
                    }
                }
            }
            if (uiState.isRefreshing) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.TopCenter).padding(top = 16.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SortControls(
    sortBy: String,
    sortOrder: String,
    onSortByChanged: (String) -> Unit,
    onSortOrderChanged: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Sort by", style = MaterialTheme.typography.labelMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = sortBy == "createdAt",
                onClick = { onSortByChanged("createdAt") },
                label = { Text("Date") }
            )
            FilterChip(
                selected = sortBy == "upvoteCount",
                onClick = { onSortByChanged("upvoteCount") },
                label = { Text("Upvotes") }
            )
            Spacer(modifier = Modifier.width(16.dp))
            FilterChip(
                selected = sortOrder == "desc",
                onClick = { onSortOrderChanged("desc") },
                label = { Text("Desc") }
            )
            FilterChip(
                selected = sortOrder == "asc",
                onClick = { onSortOrderChanged("asc") },
                label = { Text("Asc") }
            )
        }
    }
}
