export class User {
    id: string;
    username: string;
    password: string;
    createdAt: string;
    roles: [];
    token: string;
    refreshToken: string;
    isDeletable: boolean;
}
