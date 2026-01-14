import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/pos';

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

                    if (typeof data === 'string') {
                        error.message = data;
                    }
                    else if (typeof data === 'object') {
                        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                            if (data.errors.length > 1) {
                                error.message = data.errors
                                    .map((err: any) => err.message)
                                    .filter((msg: string) => msg)
                                    .join('\n');
                            }
                            else {
                                error.message = data.errors[0].message;
                            }
                        }
                        else {
                            error.message = data.message || data.error || data.detail || data.errorMessage ||
                                data.msg || data.description ||
                                data.error?.message ||
                                error.message;
                        }
                    }
                }

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
