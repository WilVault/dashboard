import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import constants from '../../constants';
import { useSession } from '../../context/SessionContext';
import { WilvaultLogo } from '../../icons';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import toast from 'react-hot-toast';
import { isValidEmail } from '../../utilities';
import type { Currencies } from '../../types';
import { useLoader } from '../../context/LoaderContext';
import { getCurrentcies } from '../../services/currencies';
import { login, register, resetPassword } from '../../services/auth';
import SelectCurrency from '../../components/SelectCurrency';
import './styles.css';
import Checkbox from '../../components/Checkbox';
import { validateEmail } from '../../services/email';
import OtpInput from '../OtpInput';
import { sendOtp, verifyOtp } from '../../services/otp';
import { uploadDefaultAvatar, updateProfileUrl, uploadCustomAvatar } from '../../services/persons';

const ACTION_TYPES = {
  SET_LOGIN_EMAIL:                     'SET_LOGIN_EMAIL',
  SET_LOGIN_PASSWORD:                  'SET_LOGIN_PASSWORD',
  SET_ERROR:                           'SET_ERROR',
  CLEAR_ERROR:                         'CLEAR_ERROR',
  SET_TOGGLE_CONTENT:                  'SET_TOGGLE_CONTENT',
  SET_CURRENCIES:                      'SET_CURRENCIES',
  SET_REGISTER_FULL_NAME:              'SET_REGISTER_FULL_NAME',
  SET_REGISTER_EMAIL:                  'SET_REGISTER_EMAIL',
  SET_REGISTER_CURRENCY_ID:            'SET_REGISTER_CURRENCY_ID',
  SET_REGISTER_PASSWORD:               'SET_REGISTER_PASSWORD',
  SET_REGISTER_CONFIRM_PASSWORD:       'SET_REGISTER_CONFIRM_PASSWORD',
  SET_REGISTER_TIMEZONE:               'SET_REGISTER_TIMEZONE',
  SET_REGISTER_PROFILE_URL:            'SET_REGISTER_PROFILE_URL',
  SET_REGISTER_PROFILE_URL_CUSTOMIZED: 'SET_REGISTER_PROFILE_URL_CUSTOMIZED',
  SET_AGREE_TO_TERMS:                  'SET_AGREE_TO_TERMS',
  SET_REGISTER_OTP:                    'SET_REGISTER_OTP',
  START_OTP_COUNTDOWN:                 'START_OTP_COUNTDOWN',
  TICK_OTP_COUNTDOWN:                  'TICK_OTP_COUNTDOWN',
  RESET_ALL_STATES:                    'RESET_ALL_STATES',
  SET_FORGOT_EMAIL:                    'SET_FORGOT_EMAIL',
  SET_FORGOT_OTP:                      'SET_FORGOT_OTP',
  SET_NEW_PASSWORD:                    'SET_NEW_PASSWORD',
  SET_CONFIRM_NEW_PASSWORD:            'SET_CONFIRM_NEW_PASSWORD',
} as const;

interface State {
  email:                        string;
  password:                     string;
  error:                        string | null;
  toggleContent:                'SIGN IN' | 'SIGN UP' | 'EMAIL VERIFICATION' | 'PROFILE' | 'FORGOT_PASSWORD' | 'FORGOT_OTP' | 'RESET_PASSWORD';
  currencies:                   Array<Currencies>;
  registerFullName:             string;
  registerEmail:                string;
  registerCurrencyId:           number | null;
  registerPassword:             string;
  registerConfirmPassword:      string;
  registerTimezone:             string;
  registerProfileUrl:           string;
  registerProfileUrlCustomized: boolean;
  registerAgreeToTerms:         boolean;
  registerOTP:                  string;
  otpCountdown:                 number;
  otpCountdownStarted:          boolean;
  forgotEmail:                  string;
  forgotOTP:                    string;
  newPassword:                  string;
  confirmNewPassword:           string;
}

type Action =
  | { type: typeof ACTION_TYPES.SET_LOGIN_EMAIL;                     email: string }
  | { type: typeof ACTION_TYPES.SET_LOGIN_PASSWORD;                  password: string }
  | { type: typeof ACTION_TYPES.SET_ERROR;                           error: string }
  | { type: typeof ACTION_TYPES.CLEAR_ERROR }
  | { type: typeof ACTION_TYPES.SET_TOGGLE_CONTENT;                  toggleContent: State['toggleContent'] }
  | { type: typeof ACTION_TYPES.SET_CURRENCIES;                      currencies: Array<Currencies> }
  | { type: typeof ACTION_TYPES.SET_REGISTER_FULL_NAME;              fullName: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_EMAIL;                  email: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_CURRENCY_ID;            currencyId: number }
  | { type: typeof ACTION_TYPES.SET_REGISTER_PASSWORD;               password: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_CONFIRM_PASSWORD;       confirmPassword: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_TIMEZONE;               timezone: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_PROFILE_URL;            profileUrl: string }
  | { type: typeof ACTION_TYPES.SET_REGISTER_PROFILE_URL_CUSTOMIZED; profileUrlCustomized: boolean }
  | { type: typeof ACTION_TYPES.SET_AGREE_TO_TERMS;                  agreeToTerms: boolean }
  | { type: typeof ACTION_TYPES.SET_REGISTER_OTP;                    otpNumber: string }
  | { type: typeof ACTION_TYPES.START_OTP_COUNTDOWN }
  | { type: typeof ACTION_TYPES.TICK_OTP_COUNTDOWN }
  | { type: typeof ACTION_TYPES.RESET_ALL_STATES }
  | { type: typeof ACTION_TYPES.SET_FORGOT_EMAIL;         email: string }
  | { type: typeof ACTION_TYPES.SET_FORGOT_OTP;           otpNumber: string }
  | { type: typeof ACTION_TYPES.SET_NEW_PASSWORD;         password: string }
  | { type: typeof ACTION_TYPES.SET_CONFIRM_NEW_PASSWORD; password: string };

const initialState: State = {
  email:                        '',
  password:                     '',
  error:                        null,
  toggleContent:                'SIGN IN',
  currencies:                   [],
  registerFullName:             '',
  registerEmail:                '',
  registerCurrencyId:           null,
  registerPassword:             '',
  registerConfirmPassword:      '',
  registerTimezone:             '',
  registerProfileUrl:           '',
  registerProfileUrlCustomized: false,
  registerAgreeToTerms:         false,
  registerOTP:                  '',
  otpCountdown:                 0,
  otpCountdownStarted:          false,
  forgotEmail:                  '',
  forgotOTP:                    '',
  newPassword:                  '',
  confirmNewPassword:           '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_LOGIN_EMAIL:                     return { ...state, email: action.email };
    case ACTION_TYPES.SET_LOGIN_PASSWORD:                  return { ...state, password: action.password };
    case ACTION_TYPES.SET_TOGGLE_CONTENT:                  return { ...state, toggleContent: action.toggleContent };
    case ACTION_TYPES.SET_CURRENCIES:                      return { ...state, currencies: action.currencies };
    case ACTION_TYPES.SET_ERROR:                           return { ...state, error: action.error };
    case ACTION_TYPES.CLEAR_ERROR:                         return { ...state, error: null };
    case ACTION_TYPES.SET_REGISTER_FULL_NAME:              return { ...state, registerFullName: action.fullName };
    case ACTION_TYPES.SET_REGISTER_EMAIL:                  return { ...state, registerEmail: action.email };
    case ACTION_TYPES.SET_REGISTER_CURRENCY_ID:            return { ...state, registerCurrencyId: action.currencyId };
    case ACTION_TYPES.SET_REGISTER_PASSWORD:               return { ...state, registerPassword: action.password };
    case ACTION_TYPES.SET_REGISTER_CONFIRM_PASSWORD:       return { ...state, registerConfirmPassword: action.confirmPassword };
    case ACTION_TYPES.SET_REGISTER_TIMEZONE:               return { ...state, registerTimezone: action.timezone };
    case ACTION_TYPES.SET_REGISTER_PROFILE_URL:            return { ...state, registerProfileUrl: action.profileUrl };
    case ACTION_TYPES.SET_REGISTER_PROFILE_URL_CUSTOMIZED: return { ...state, registerProfileUrlCustomized: action.profileUrlCustomized };
    case ACTION_TYPES.SET_AGREE_TO_TERMS:                  return { ...state, registerAgreeToTerms: action.agreeToTerms };
    case ACTION_TYPES.SET_REGISTER_OTP:                    return { ...state, registerOTP: action.otpNumber };
    case ACTION_TYPES.START_OTP_COUNTDOWN:                 return { ...state, otpCountdown: 300, otpCountdownStarted: true, registerOTP: '', forgotOTP: '' };
    case ACTION_TYPES.TICK_OTP_COUNTDOWN:                  return { ...state, otpCountdown: Math.max(0, state.otpCountdown - 1) };
    case ACTION_TYPES.RESET_ALL_STATES:                    return { ...initialState, toggleContent: state.toggleContent, currencies: state.currencies };
    case ACTION_TYPES.SET_FORGOT_EMAIL:                    return { ...state, forgotEmail: action.email };
    case ACTION_TYPES.SET_FORGOT_OTP:                      return { ...state, forgotOTP: action.otpNumber };
    case ACTION_TYPES.SET_NEW_PASSWORD:                    return { ...state, newPassword: action.password };
    case ACTION_TYPES.SET_CONFIRM_NEW_PASSWORD:            return { ...state, confirmNewPassword: action.password };
    default: return state;
  }
}

// ─── interfaces ───────────────────────────────────────────────────────────────

interface LoginProps      { state: State; dispatch: React.Dispatch<Action>; handleLogin: () => void; }
interface RegisterProps   { state: State; dispatch: React.Dispatch<Action>; handleValidateRegisterFields: () => void; }
interface OtpProps        { state: State; dispatch: React.Dispatch<Action>; show: (m: string) => void; hide: () => void; }
interface ProfileProps    { state: State; dispatch: React.Dispatch<Action>; show: (m: string) => void; hide: () => void; }
interface ForgotProps     { state: State; dispatch: React.Dispatch<Action>; show: (m: string) => void; hide: () => void; }

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginComponent({ state, dispatch, handleLogin }: LoginProps) {
  return (
    <div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#4A4A68] mb-2 uppercase">Email</p>
          <Input type="email" value={state.email} onChange={e => dispatch({ type: ACTION_TYPES.SET_LOGIN_EMAIL, email: e.target.value })} placeholder="juan@example.com" />
        </div>
        <div className='mt-5'>
          <p className="text-xs text-[#4A4A68] mb-2 uppercase">Password</p>
          <PasswordInput value={state.password} onChange={e => dispatch({ type: ACTION_TYPES.SET_LOGIN_PASSWORD, password: e.target.value })} placeholder="•••••••••••" />
        </div>
      </div>
      <p
        className='text-[#C9FA30] text-xs mt-4 text-right cursor-pointer hover:opacity-70'
        onClick={() => dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'FORGOT_PASSWORD' })}
      >
        Forgot your password?
      </p>
      <button onClick={handleLogin} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all mt-5 hover:opacity-70 cursor-pointer">
        Sign in →
      </button>
      <p className='text-[#4A4A68] text-xs text-center mt-8 pb-3'>
        Don't have an account?{' '}
        <span onClick={() => dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN UP' })} className='text-[#C9FA30] cursor-pointer font-bold'>
          Create one free.
        </span>
      </p>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

function RegisterComponent({ state, dispatch, handleValidateRegisterFields }: RegisterProps) {
  return (
    <div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#4A4A68] mb-2 uppercase">Full Name</p>
            <Input type="text" value={state.registerFullName} onChange={e => dispatch({ type: ACTION_TYPES.SET_REGISTER_FULL_NAME, fullName: e.target.value })} placeholder="Juan dela Cruz" />
          </div>
          <div>
            <p className="text-xs text-[#4A4A68] mb-2 uppercase">Email</p>
            <Input type="email" value={state.registerEmail} onChange={e => dispatch({ type: ACTION_TYPES.SET_REGISTER_EMAIL, email: e.target.value })} placeholder="juan@example.com" />
          </div>
        </div>
        <div>
          <p className="text-xs text-[#4A4A68] mb-2 uppercase">Currency</p>
          <SelectCurrency currencies={state.currencies} value={state.registerCurrencyId} onChange={currencyId => dispatch({ type: ACTION_TYPES.SET_REGISTER_CURRENCY_ID, currencyId })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#4A4A68] mb-2 uppercase">Password</p>
            <PasswordInput value={state.registerPassword} onChange={e => dispatch({ type: ACTION_TYPES.SET_REGISTER_PASSWORD, password: e.target.value })} placeholder="•••••••••••" />
          </div>
          <div>
            <p className="text-xs text-[#4A4A68] mb-2 uppercase">Confirm Password</p>
            <Input type="password" value={state.registerConfirmPassword} onChange={e => dispatch({ type: ACTION_TYPES.SET_REGISTER_CONFIRM_PASSWORD, confirmPassword: e.target.value })} placeholder="•••••••••••" />
          </div>
        </div>
        <div className="flex items-center gap-2 py-2">
          <Checkbox checked={state.registerAgreeToTerms} onChange={val => dispatch({ type: ACTION_TYPES.SET_AGREE_TO_TERMS, agreeToTerms: val })} />
          <p className="text-xs text-[#4A4A68]">I agree to the <span className="text-[#C9FA30] font-bold">Terms of Service</span> and <span className="text-[#C9FA30] font-bold">Privacy Policy</span>.</p>
        </div>
        <button onClick={handleValidateRegisterFields} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all hover:opacity-70 cursor-pointer">
          Start now →
        </button>
      </div>
    </div>
  );
}

// ─── Email Verification (Register OTP) ────────────────────────────────────────

function EmailVerificationComponent({ state, dispatch, show, hide }: OtpProps) {
  const minutes  = Math.floor(state.otpCountdown / 60);
  const seconds  = state.otpCountdown % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isExpired = state.otpCountdownStarted && state.otpCountdown <= 0;

  const handleResendOtp = async () => {
    show('Resending verification code...');
    try {
      await sendOtp(state.registerEmail, 1, state.registerTimezone);
      dispatch({ type: ACTION_TYPES.START_OTP_COUNTDOWN });
      toast.success('Verification code sent!');
    } catch { toast.error('Failed to resend verification code.'); }
    finally { hide(); }
  };

  const handleVerifyOtp = async () => {
    if (state.registerOTP.length < 6) { toast.error('Please enter the complete 6-digit code.'); return; }

    show('Verifying code...');
    try {
      await verifyOtp(state.registerEmail, state.registerOTP, '1');
      toast.success('Email verified!');
    } catch (err: any) {
      toast.error(err?.response?.status === 400 ? 'Invalid or incorrect code.' : 'Failed to verify code.');
      hide(); return;
    }

    try {
      show('Setting up your account...');
      const avatarRes  = await uploadDefaultAvatar(state.registerEmail, state.registerFullName);
      const profileUrl = (avatarRes.data as { data: { profile_url: string } }).data.profile_url;
      const bustUrl    = `${profileUrl}?t=${Date.now()}`;

      await register({
        email: state.registerEmail, password: state.registerPassword,
        full_name: state.registerFullName, profile_url: profileUrl,
        profile_url_customized: false, timezone: state.registerTimezone,
        currency_id: state.registerCurrencyId!,
      });

      dispatch({ type: ACTION_TYPES.SET_REGISTER_PROFILE_URL, profileUrl: bustUrl });
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'PROFILE' });
    } catch { toast.error('Registration failed. Please try again.'); }
    finally { hide(); }
  };

  return (
    <div>
      <p className='text-center text-5xl my-7'>📬</p>
      <p className='text-center text-white text-lg'>Verify your email</p>
      <p className='text-center text-[#4A4A68] text-sm mt-2 mb-1'>We sent a 6-digit code to</p>
      <p className='text-center text-[#C9FA30] text-xs'>{state.registerEmail}</p>
      <div className='mt-6'>
        <OtpInput value={state.registerOTP} onChange={otp => dispatch({ type: ACTION_TYPES.SET_REGISTER_OTP, otpNumber: otp })} disabled={isExpired} />
      </div>
      <div className='text-center mt-4'>
        {!state.otpCountdownStarted && (
          <p className='text-[#4A4A68] text-xs'>Didn't receive a code? <span onClick={handleResendOtp} className='text-[#C9FA30] font-bold cursor-pointer hover:opacity-70'>Send code</span></p>
        )}
        {state.otpCountdownStarted && !isExpired && (
          <p className='text-[#4A4A68] text-sm'>Code expires in <span className='text-[#C9FA30] font-bold'>{formatted}</span></p>
        )}
        {isExpired && (
          <p className='text-red-400 text-sm'>Code expired. <span onClick={handleResendOtp} className='text-[#C9FA30] font-bold cursor-pointer hover:opacity-70'>Resend</span></p>
        )}
        <button onClick={handleVerifyOtp} disabled={isExpired} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all mt-8 hover:opacity-70 cursor-pointer">
          Verify Code
        </button>
      </div>
    </div>
  );
}

// ─── Profile (Register final step) ────────────────────────────────────────────

function ProfileComponent({ state, dispatch, show, hide }: ProfileProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    dispatch({ type: ACTION_TYPES.SET_REGISTER_PROFILE_URL, profileUrl: previewUrl });
    dispatch({ type: ACTION_TYPES.SET_REGISTER_PROFILE_URL_CUSTOMIZED, profileUrlCustomized: true });

    show('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', state.registerEmail);
      const res    = await uploadCustomAvatar(formData);
      const newUrl = (res.data as { data: { profile_url: string } }).data.profile_url;
      dispatch({ type: ACTION_TYPES.SET_REGISTER_PROFILE_URL, profileUrl: `${newUrl}?t=${Date.now()}` });
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload photo.');
      dispatch({ type: ACTION_TYPES.SET_REGISTER_PROFILE_URL_CUSTOMIZED, profileUrlCustomized: false });
    } finally { hide(); }
  };

  const handleContinue = async () => {
    show('Finishing up...');
    try {
      if (state.registerProfileUrlCustomized) {
        await updateProfileUrl(state.registerEmail, state.registerProfileUrl, true);
      }
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN IN' });
      toast.success('Account created! Please sign in.');
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { hide(); }
  };

  return (
    <div className='pb-4'>
      <p className='text-center text-white text-lg mt-4'>Set your profile photo</p>
      <p className='text-center text-[#4A4A68] text-sm mt-2'>This is how others will see you on Wilvault.</p>
      <div className='flex justify-center mt-8'>
        <div className='relative'>
          <img src={state.registerProfileUrl} alt="profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9FA30' }} />
          <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, background: '#C9FA30', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </label>
          <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>
      <p className='text-center text-[#4A4A68] text-xs mt-4'>
        {state.registerProfileUrlCustomized ? <span className='text-[#C9FA30]'>Custom photo set ✓</span> : 'Using default avatar — tap the pencil to change it.'}
      </p>
      <button onClick={handleContinue} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all mt-8 hover:opacity-70 cursor-pointer">
        Continue →
      </button>
    </div>
  );
}

// ─── Forgot Password — Phase 1: Enter email ───────────────────────────────────

function ForgotPasswordComponent({ state, dispatch, show, hide }: ForgotProps) {
  const handleSend = async () => {
    if (!isValidEmail(state.forgotEmail)) {
      toast.error('Please enter a valid email.');
      return;
    }

    show('Checking email...');
    try {
      // validateEmail returns 409 if email exists — we want it to exist here
      await validateEmail(state.forgotEmail);
      // 200 means email does NOT exist
      toast.error('No account found with that email.');
      return;
    } catch (err: any) {
      if (err?.response?.status !== 409) {
        toast.error('Failed to check email. Please try again.');
        hide(); return;
      }
      // 409 = email exists, proceed
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await sendOtp(state.forgotEmail, 2, timezone);
      dispatch({ type: ACTION_TYPES.START_OTP_COUNTDOWN });
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'FORGOT_OTP' });
      toast.success('Verification code sent!');
    } catch {
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      hide();
    }
  };

  return (
    <div>
      <p className='text-center text-5xl my-7'>🔐</p>
      <p className='text-center text-white text-lg'>Forgot your password?</p>
      <p className='text-center text-[#4A4A68] text-sm mt-2 mb-6'>Enter your email and we'll send you a reset code.</p>
      <div className='mb-4'>
        <p className="text-xs text-[#4A4A68] mb-2 uppercase">Email</p>
        <Input type="email" value={state.forgotEmail} onChange={e => dispatch({ type: ACTION_TYPES.SET_FORGOT_EMAIL, email: e.target.value })} placeholder="juan@example.com" />
      </div>
      <button onClick={handleSend} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all hover:opacity-70 cursor-pointer">
        Send Reset Code →
      </button>
      <p className='text-[#4A4A68] text-xs text-center mt-6 cursor-pointer hover:text-white' onClick={() => dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN IN' })}>
        ← Back to Sign In
      </p>
    </div>
  );
}

// ─── Forgot Password — Phase 2: Verify OTP ────────────────────────────────────

function ForgotOtpComponent({ state, dispatch, show, hide }: ForgotProps) {
  const minutes   = Math.floor(state.otpCountdown / 60);
  const seconds   = state.otpCountdown % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isExpired = state.otpCountdownStarted && state.otpCountdown <= 0;

  const handleResend = async () => {
    show('Resending code...');
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await sendOtp(state.forgotEmail, 2, timezone);
      dispatch({ type: ACTION_TYPES.START_OTP_COUNTDOWN });
      toast.success('Verification code sent!');
    } catch { toast.error('Failed to resend code.'); }
    finally { hide(); }
  };

  const handleVerify = async () => {
    if (state.forgotOTP.length < 6) { toast.error('Please enter the complete 6-digit code.'); return; }

    show('Verifying code...');
    try {
      await verifyOtp(state.forgotEmail, state.forgotOTP, '2');
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'RESET_PASSWORD' });
      toast.success('Code verified!');
    } catch (err: any) {
      toast.error(err?.response?.status === 400 ? 'Invalid or incorrect code.' : 'Failed to verify code.');
    } finally { hide(); }
  };

  return (
    <div>
      <p className='text-center text-5xl my-7'>📬</p>
      <p className='text-center text-white text-lg'>Check your email</p>
      <p className='text-center text-[#4A4A68] text-sm mt-2 mb-1'>We sent a 6-digit code to</p>
      <p className='text-center text-[#C9FA30] text-xs mb-6'>{state.forgotEmail}</p>
      <OtpInput value={state.forgotOTP} onChange={otp => dispatch({ type: ACTION_TYPES.SET_FORGOT_OTP, otpNumber: otp })} disabled={isExpired} />
      <div className='text-center mt-4'>
        {!state.otpCountdownStarted && (
          <p className='text-[#4A4A68] text-xs'>Didn't receive a code? <span onClick={handleResend} className='text-[#C9FA30] font-bold cursor-pointer hover:opacity-70'>Send code</span></p>
        )}
        {state.otpCountdownStarted && !isExpired && (
          <p className='text-[#4A4A68] text-sm'>Code expires in <span className='text-[#C9FA30] font-bold'>{formatted}</span></p>
        )}
        {isExpired && (
          <p className='text-red-400 text-sm'>Code expired. <span onClick={handleResend} className='text-[#C9FA30] font-bold cursor-pointer hover:opacity-70'>Resend</span></p>
        )}
        <button onClick={handleVerify} disabled={isExpired} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all mt-8 hover:opacity-70 cursor-pointer">
          Verify Code
        </button>
      </div>
    </div>
  );
}

// ─── Forgot Password — Phase 3: New Password ──────────────────────────────────

function ResetPasswordComponent({ state, dispatch, show, hide }: ForgotProps) {
  const handleReset = async () => {
    if (state.newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (state.newPassword !== state.confirmNewPassword) { toast.error('Passwords do not match.'); return; }

    show('Resetting password...');
    try {
      await resetPassword(state.forgotEmail, state.newPassword);
      toast.success('Password reset! Please sign in.');
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN IN' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to reset password.');
    } finally { hide(); }
  };

  return (
    <div>
      <p className='text-center text-5xl my-7'>🔑</p>
      <p className='text-center text-white text-lg'>Set new password</p>
      <p className='text-center text-[#4A4A68] text-sm mt-2 mb-6'>Choose a strong password for your account.</p>
      <div className='space-y-4'>
        <div>
          <p className="text-xs text-[#4A4A68] mb-2 uppercase">New Password</p>
          <PasswordInput value={state.newPassword} onChange={e => dispatch({ type: ACTION_TYPES.SET_NEW_PASSWORD, password: e.target.value })} placeholder="•••••••••••" />
        </div>
        <div>
          <p className="text-xs text-[#4A4A68] mb-2 uppercase">Confirm New Password</p>
          <PasswordInput value={state.confirmNewPassword} onChange={e => dispatch({ type: ACTION_TYPES.SET_CONFIRM_NEW_PASSWORD, password: e.target.value })} placeholder="•••••••••••" />
        </div>
        <button onClick={handleReset} className="w-full py-3 bg-[#C9FA30] text-black text-sm font-semibold rounded-lg transition-all hover:opacity-70 cursor-pointer">
          Reset Password →
        </button>
      </div>
    </div>
  );
}

// ─── Main AuthScreen ───────────────────────────────────────────────────────────

export default function AuthScreen() {
  const navigate    = useNavigate();
  const { refresh } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { show, hide }    = useLoader();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.otpCountdownStarted && state.otpCountdown > 0) {
      intervalRef.current = setInterval(() => { dispatch({ type: ACTION_TYPES.TICK_OTP_COUNTDOWN }); }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.otpCountdownStarted, state.otpCountdown]);

  useEffect(() => {
    if (state.toggleContent === 'SIGN IN' || state.toggleContent === 'SIGN UP') {
      dispatch({ type: ACTION_TYPES.RESET_ALL_STATES });
    }
  }, [state.toggleContent]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  useEffect(() => {
    if (state.toggleContent === 'SIGN UP') {
      dispatch({ type: ACTION_TYPES.SET_REGISTER_TIMEZONE, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      if (state.currencies.length < 1) {
        dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
        const fetchCurrencies = async () => {
          try {
            const res = await getCurrentcies();
            if (!res.data.data || !Array.isArray(res.data.data)) { dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load currencies.' }); return; }
            dispatch({ type: ACTION_TYPES.SET_CURRENCIES, currencies: res.data.data });
          } catch {
            dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load currencies.' });
            dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN IN' });
          }
        };
        fetchCurrencies();
      }
    }
  }, [state.toggleContent]);

  const handleLogin = useCallback(async () => {
    if (!state.email || !state.password) { toast.error('Please enter your email or password.'); return; }
    if (!isValidEmail(state.email)) { toast.error('Please enter a valid email.'); return; }

    show('Signing in...');
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    try {
      const res = await login(state.email, state.password);
      localStorage.setItem(constants.ACCESS_TOKEN, (res.data as { data: { access_token: string } }).data.access_token);
      await refresh();
      navigate('/dashboard');
    } catch { dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Invalid email or password.' }); }
    finally { hide(); }
  }, [state.email, state.password, show, hide, navigate, refresh]);

  const handleValidateRegisterFields = useCallback(async () => {
    if (!state.registerFullName || !state.registerEmail || !state.registerCurrencyId || !state.registerPassword || !state.registerConfirmPassword) {
      toast.error('Please fill up the fields.'); return;
    }
    if (state.registerFullName.length < 3) { toast.error('Full name should be 3 or more characters.'); return; }
    if (!isValidEmail(state.registerEmail)) { toast.error('Please enter a valid email.'); return; }
    if (state.registerPassword.length < 8) { toast.error('Password should be 8 or more characters.'); return; }
    if (state.registerPassword !== state.registerConfirmPassword) { toast.error('Passwords should match.'); return; }
    if (!state.registerAgreeToTerms) { toast.error('Please agree to the Terms of Services & Privacy Policy.'); return; }
    if (await isEmailUsed(state.registerEmail)) { toast.error('Email is already used.'); return; }

    show('Sending verification code...');
    try {
      await sendOtp(state.registerEmail, 1, state.registerTimezone);
      dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'EMAIL VERIFICATION' });
      dispatch({ type: ACTION_TYPES.START_OTP_COUNTDOWN });
    } catch { toast.error('Failed to send verification code. Please try again.'); }
    finally { hide(); }
  }, [state.registerFullName, state.registerEmail, state.registerCurrencyId, state.registerPassword, state.registerConfirmPassword, state.registerAgreeToTerms, state.registerTimezone]);

  async function isEmailUsed(registerEmail: string): Promise<boolean> {
    try {
      await validateEmail(registerEmail);
      return false;
    } catch (err: any) {
      if (err?.response?.status === 409) return true;
      dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to verify email' });
      return false;
    }
  }

  const isAuthTab = state.toggleContent === 'SIGN IN' || state.toggleContent === 'SIGN UP';

  return (
    <div className="w-full sm:max-w-lg bg-[#0C0C17] rounded-2xl shadow-2xl p-8 space-y-5 overflow-y-auto max-h-screen scrollbar-hide">
      <div>
        <div className='flex justify-center'>
          <WilvaultLogo width={40} height={40} className='mb-3' />
        </div>
        <h1 className="text-[40px] font-bold text-[#C9FA30] text-center">WILVAULT</h1>
        <p className="text-sm text-[#4A4A68] mt-1 text-center">YOUR PERSONAL FINANCE TRACKER</p>
      </div>

      {isAuthTab && (
        <div className="my-8 flex justify-center">
          <div className='border border-[#4A4A68] flex justify-between rounded-3xl min-w-35'>
            <div onClick={() => dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN IN' })} className={`${state.toggleContent === 'SIGN IN' ? 'bg-[#C9FA30] text-black' : 'text-[#4A4A68]'} rounded-3xl px-4 py-2 font-bold cursor-pointer text-sm`}>Sign In</div>
            <div onClick={() => dispatch({ type: ACTION_TYPES.SET_TOGGLE_CONTENT, toggleContent: 'SIGN UP' })} className={`${state.toggleContent === 'SIGN UP' ? 'bg-[#C9FA30] text-black' : 'text-[#4A4A68]'} rounded-3xl px-4 py-2 font-bold cursor-pointer text-sm`}>Sign Up</div>
          </div>
        </div>
      )}

      {state.toggleContent === 'SIGN IN'            && <LoginComponent state={state} dispatch={dispatch} handleLogin={handleLogin} />}
      {state.toggleContent === 'SIGN UP'            && <RegisterComponent state={state} dispatch={dispatch} handleValidateRegisterFields={handleValidateRegisterFields} />}
      {state.toggleContent === 'EMAIL VERIFICATION' && <EmailVerificationComponent state={state} dispatch={dispatch} show={show} hide={hide} />}
      {state.toggleContent === 'PROFILE'            && <ProfileComponent state={state} dispatch={dispatch} show={show} hide={hide} />}
      {state.toggleContent === 'FORGOT_PASSWORD'    && <ForgotPasswordComponent state={state} dispatch={dispatch} show={show} hide={hide} />}
      {state.toggleContent === 'FORGOT_OTP'         && <ForgotOtpComponent state={state} dispatch={dispatch} show={show} hide={hide} />}
      {state.toggleContent === 'RESET_PASSWORD'     && <ResetPasswordComponent state={state} dispatch={dispatch} show={show} hide={hide} />}
    </div>
  );
}