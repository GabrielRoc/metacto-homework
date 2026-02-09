package com.metacto.featuresuggestion.data.api

import com.metacto.featuresuggestion.data.api.dto.CreateFeatureRequestDto
import com.metacto.featuresuggestion.data.api.dto.FeatureProposalResponseDto
import com.metacto.featuresuggestion.data.api.dto.PaginatedResponseDto
import com.metacto.featuresuggestion.data.api.dto.UpvoteRequestDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface FeatureApiService {

    @GET("api/features")
    suspend fun getFeatures(
        @Query("page") page: Int,
        @Query("limit") limit: Int,
        @Query("sortBy") sortBy: String = "createdAt",
        @Query("sortOrder") sortOrder: String = "desc"
    ): PaginatedResponseDto

    @POST("api/features")
    suspend fun createFeature(
        @Body request: CreateFeatureRequestDto
    ): FeatureProposalResponseDto

    @POST("api/features/{id}/upvote")
    suspend fun upvoteFeature(
        @Path("id") id: String,
        @Body request: UpvoteRequestDto
    ): FeatureProposalResponseDto
}
