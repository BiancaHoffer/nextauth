import axios, { AxiosError } from 'axios';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import Router from 'next/router';
import { AuthTokenError } from './errors/AuthTokenError';

interface AxiosErrorResponse {
    code?: string;
}

let isRefreshToken = false;
let failedRequestsQueue = [];

export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });
    
    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError<AxiosErrorResponse>)  => {
        if(error.response.status === 401) {
            if(error.response.data?.code === "token.expired") {
                cookies = parseCookies(ctx);
    
                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config //todas as infos que preciso para repetir uma requisição ao back-end
    
                if(!isRefreshToken) {
                    isRefreshToken = true;
    
                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const {token} = response.data;
        
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/',
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, 
                            path: '/',
                        })
        
                        api.defaults.headers['Authorization'] = `Bearer ${token}`;
    
                        failedRequestsQueue.forEach(request => request.onSuccess(token))
                        failedRequestsQueue = [];
                    }).catch(err => {
                        failedRequestsQueue.forEach(request => request.onFailure(error))
                        failedRequestsQueue = [];

                        if (typeof window !== "undefined") {
                            destroyCookie(undefined, 'nextauth.token')
                            destroyCookie(undefined, 'nextauth.refreshToken')
        
                            Router.push('/')
                        }
                    })
                    .finally(() => {
                        isRefreshToken = false
                    });
                }
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
    
                            //nova chamada a API
                            resolve(api(originalConfig))
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        },
                    })
                });
            } else {
                // o erro pode não ser do tipo token expirado, portanto o usuário é deslogado
                if (typeof window !== "undefined") {
                    destroyCookie(undefined, 'nextauth.token')
                    destroyCookie(undefined, 'nextauth.refreshToken')

                    Router.push('/')
                }  else {
                    return Promise.reject(error);
                }
            }
        }
    
        return Promise.reject(error);
    });

    return api; 
}
