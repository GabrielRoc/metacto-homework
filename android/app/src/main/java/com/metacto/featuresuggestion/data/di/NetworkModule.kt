package com.metacto.featuresuggestion.data.di

import android.content.Context
import com.metacto.featuresuggestion.data.api.FeatureApiService
import com.metacto.featuresuggestion.data.local.SettingsDataStore
import com.metacto.featuresuggestion.data.repository.FeatureRepositoryImpl
import com.metacto.featuresuggestion.domain.repository.FeatureRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://localhost:3000/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideFeatureApiService(retrofit: Retrofit): FeatureApiService {
        return retrofit.create(FeatureApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideFeatureRepository(apiService: FeatureApiService): FeatureRepository {
        return FeatureRepositoryImpl(apiService)
    }

    @Provides
    @Singleton
    fun provideSettingsDataStore(@ApplicationContext context: Context): SettingsDataStore {
        return SettingsDataStore(context)
    }
}
