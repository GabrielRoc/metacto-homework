package com.metacto.featuresuggestion.data.api

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import retrofit2.HttpException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

data class ApiErrorResponse(
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?,
    @SerializedName("statusCode") val statusCode: Int?
)

object ApiErrorHandler {

    private val gson = Gson()

    fun getReadableMessage(exception: Exception): String {
        return when (exception) {
            is HttpException -> parseHttpError(exception)
            is SocketTimeoutException -> "Connection timed out. Please check your internet and try again."
            is UnknownHostException -> "Unable to reach the server. Please check your internet connection."
            else -> exception.message ?: "An unexpected error occurred. Please try again."
        }
    }

    private fun parseHttpError(exception: HttpException): String {
        val errorBody = exception.response()?.errorBody()?.string()
        if (errorBody != null) {
            try {
                val apiError = gson.fromJson(errorBody, ApiErrorResponse::class.java)
                if (!apiError.message.isNullOrBlank()) {
                    return apiError.message
                }
            } catch (_: Exception) { }
        }

        return when (exception.code()) {
            400 -> "Invalid request. Please check your input and try again."
            404 -> "The requested resource was not found."
            409 -> "This action has already been performed."
            422 -> "Please check your input and try again."
            500 -> "Server error. Please try again later."
            else -> "Something went wrong (error ${exception.code()}). Please try again."
        }
    }
}
