export interface SignUpInfo {
    name: string;
    email: string;
    password: string;
    verifyPassword: string;
    phoneNumber?: string;
    isOrganizer: boolean;
}