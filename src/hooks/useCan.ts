import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

interface UseCanParams {
    permissions?: string[];
    roles?: string[];    
}

// esse hook garante que o usuário só veja as roles e metrics que tem permissão 

export function useCan({ permissions, roles }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return false;
    }

    const userHasValidPermissions = validateUserPermissions({
        user, 
        permissions,
        roles
    })

    //se passar por toda essas condições, ai sim ter permissão
    return userHasValidPermissions; 
}