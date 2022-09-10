import { setupAPIClient } from "../services/api";
import { WithSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
    return (
        <>
            <h1>Metrics</h1>
        </>
    );
}

export const getServerSideProps = WithSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');

    return {
      props: {}
    }
  }, {
    //cada página recebe permissions e roles diferentes
    permissions: ['metrics.list'],
    roles: ['administrator'],
})