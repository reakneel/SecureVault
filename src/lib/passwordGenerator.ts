export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

export class PasswordGenerator {
  private static UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static NUMBERS = '0123456789';
  private static SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  static generate(options: PasswordOptions): string {
    let charset = '';
    let password = '';

    if (options.uppercase) charset += this.UPPERCASE;
    if (options.lowercase) charset += this.LOWERCASE;
    if (options.numbers) charset += this.NUMBERS;
    if (options.special) charset += this.SPECIAL;

    if (charset.length === 0) {
      throw new Error('At least one character type must be selected');
    }

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
      password += charset[array[i] % charset.length];
    }

    if (options.uppercase && !/[A-Z]/.test(password)) {
      password = this.UPPERCASE[array[0] % this.UPPERCASE.length] + password.slice(1);
    }
    if (options.lowercase && !/[a-z]/.test(password)) {
      password = this.LOWERCASE[array[0] % this.LOWERCASE.length] + password.slice(1);
    }
    if (options.numbers && !/[0-9]/.test(password)) {
      password = this.NUMBERS[array[0] % this.NUMBERS.length] + password.slice(1);
    }
    if (options.special && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      password = this.SPECIAL[array[0] % this.SPECIAL.length] + password.slice(1);
    }

    return password;
  }

  static calculateStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 15;

    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    if (/[a-z].*[a-z]/.test(password)) score += 5;
    if (/[A-Z].*[A-Z]/.test(password)) score += 5;
    if (/[0-9].*[0-9]/.test(password)) score += 5;
    if (/[^a-zA-Z0-9].*[^a-zA-Z0-9]/.test(password)) score += 5;

    score = Math.min(score, 100);

    let label = 'Weak';
    let color = '#EF4444';

    if (score >= 80) {
      label = 'Strong';
      color = '#059669';
    } else if (score >= 60) {
      label = 'Good';
      color = '#3B82F6';
    } else if (score >= 40) {
      label = 'Fair';
      color = '#F59E0B';
    }

    return { score, label, color };
  }
}
