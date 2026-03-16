import api from '../helpers/apiClient';

export function sendOtp(email: string, otp_type_id: number, timezone: string) {
    return api.post('/otp/send', { email, otp_type_id, timezone });
}

export function verifyOtp(email: string, otp: string, otp_type_id: string) {
    return api.post('/otp/verify', { email, otp, otp_type_id });
}