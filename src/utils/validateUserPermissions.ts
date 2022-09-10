interface User {
    permissions: string[];
    roles: string[];
}

interface ValidateUserPermissionsParams {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export function validateUserPermissions({
    user,
    permissions,
    roles,
}: ValidateUserPermissionsParams) {
   // se o usuário tiver alguma permissão 
   if (permissions?.length > 0) {
    //every só retorna true caso todas as condições da função estiverem satisfeitas
    const hasAllPermissions = permissions.every(permission => {
        return user.permissions.includes(permission)
    });

    if (!hasAllPermissions) {
        return false; 
    }
}

    // mesma coisa para roles
    if (roles?.length > 0) {
        // some verifica de o usuário tem alguma role
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role)
        });

        if (!hasAllRoles) {
            return false; 
        }
    }

    return true; 
}