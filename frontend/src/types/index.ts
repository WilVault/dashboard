export interface Person {
    personId: number;
    email: string;
    fullName: string;
    profileUrl: string;
    profileUrlCustomized: boolean;
    timezone: string;
}

export interface Currencies {
    currencyId: number;
    currency: string;
    description: string;
    emoji: string;
}
