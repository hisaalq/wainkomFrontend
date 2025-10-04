export interface SignUpInfo {
    username: string;
    email: string;
    password: string;
    verifyPassword: string;
    phoneNumber?: string;
    isOrganizer: boolean;
}