interface AccountDTO {
    _id: number;
    name: string;
    phone: string;
    role: 'EMPLOYEE' | 'ADMIN';
    username: string;
    password: string;
    updated_at?: string;
    created_at?: string;
}

export default AccountDTO;