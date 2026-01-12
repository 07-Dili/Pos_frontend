import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                }

                if (error.response?.data) {
                    const data = error.response.data;

                    // If data is a string, use it directly
                    if (typeof data === 'string') {
                        error.message = data;
                    }
                    // If data is an object, try multiple possible error message fields
                    else if (typeof data === 'object') {
                        error.message = data.message || data.error || data.detail || data.errorMessage ||
                            data.msg || data.description ||
                            // Check nested error object
                            data.error?.message || data.errors?.[0]?.message ||
                            error.message;
                    }
                }

                // If no message extracted from data, try statusText (for servlet sendError)
                if (!error.message || error.message === 'Request failed with status code ' + error.response?.status) {
                    error.message = error.response?.statusText || error.message;
                }

                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, {
            ...config,
            headers: {
                ...config?.headers,
            }
        });
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
        return response.data;
    }
}

export default new ApiService();
