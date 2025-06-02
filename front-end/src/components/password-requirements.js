import { CheckCircle, XCircle } from 'phosphor-react';

export default function PasswordRequirements({ password, confirmPassword }) {
  const isMinLengthValid = password.length >= 6;

  return (
    <div className="space-y-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex justify-center items-center gap-2">
        {isMinLengthValid ? (
          <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
        ) : (
          <XCircle size={18} className="text-[#B3090F] dark:text-red-400" />
        )}
        <span>Mínimo de 6 caracteres</span>
      </div>
      <div className="flex justify-center items-center gap-2">
        {password && confirmPassword && password === confirmPassword ? (
          <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
        ) : (
          <XCircle size={18} className="text-[#B3090F] dark:text-red-400" />
        )}
        <span>Senhas coincidem</span>
      </div>
    </div>
  );
}
