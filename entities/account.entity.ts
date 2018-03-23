export default class AccountEntity {
    public _id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public isActive: boolean;
    public token: string; 
    public code: number;
    public codeExpireTime: Date;
}