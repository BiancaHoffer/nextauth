// só podem ser acessdas por visitantes. 

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";


export function WithSSRGuest<P>(fn: GetServerSideProps<P>) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        //  pegar cookies
        const cookies = parseCookies(ctx);

        //  se tiver direcionar para dashboard
        if(cookies['nextauth.token']) {
            return {
                redirect: {
                    destination: '/dashboard',
                    permanent: false,
                }
            }
        }

        // se não tiver retornar a função normal return {props: {}} que está em index.tsx
        return await fn(ctx)
    }
}