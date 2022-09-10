// só podem ser acessdas por usuários autenticados. 

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode'
import { validateUserPermissions } from "./validateUserPermissions";

interface WidthSSTAuthOptions {
    roles?: string[];
    permissions?: string[];
}

export function WithSSRAuth<P>(fn: GetServerSideProps<P>, options?: WidthSSTAuthOptions) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        //  pegar cookies
        const cookies = parseCookies(ctx);

        const token = cookies['nextauth.token'];

        //  se não estiver logado redirecionar para página principal, no caso, login. 
        if(!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        if (options) {
            const user = decode<{ permissions: string[], roles: string[] }>(token);
            const { roles, permissions } = options

            const userHasValidPermissions = validateUserPermissions({
                user, 
                permissions,
                roles
            })

            if (!userHasValidPermissions) {
                return {
                    redirect: {
                        destination: '/dashboard',
                        permanent: false,
                    }
                }
            }
        }

        

        // se não tiver, retornar a função normal return {props: {}} que está em index.tsx
        try {
            return await fn(ctx)
        } catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'nextauth.token');
                destroyCookie(ctx, 'nextauth.refreshToken');
                
                return {
                    redirect: {
                      destination: '/',
                      permanent: false,
                    }
                }
            }
        }  
    }
}