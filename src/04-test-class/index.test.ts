// Uncomment the code below and write your tests
import {
  getBankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
} from '.';

describe('BankAccount', () => {
  test('should create account with initial balance', () => {
    const account = getBankAccount(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    const account = getBankAccount(100);
    expect(() => account.withdraw(200)).toThrow(InsufficientFundsError);
  });

  test('should throw error when transferring more than balance', () => {
    const account = getBankAccount(100);
    const account2 = getBankAccount(100);
    expect(() => account.transfer(200, account2)).toThrow(
      InsufficientFundsError,
    );
  });

  test('should throw error when transferring to the same account', () => {
    const account = getBankAccount(100);
    expect(() => account.transfer(200, account)).toThrow(TransferFailedError);
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(200);
    expect(account.getBalance()).toBe(300);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(100);
    account.withdraw(20);
    expect(account.getBalance()).toBe(80);
  });

  test('should transfer money', () => {
    const account = getBankAccount(100);
    const account2 = getBankAccount(100);
    account.transfer(20, account2);
    expect(account.getBalance()).toBe(80);
    expect(account2.getBalance()).toBe(120);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const account = getBankAccount(100);

    for (let i = 0; i < 20; i++) {
      const balance = await account.fetchBalance();
      if (balance !== null) {
        expect(typeof balance).toBe('number');
        return;
      }
    }

    throw new Error('Failed to test');
  });

  test('should set new balance if fetchBalance returned number', async () => {
    const account = getBankAccount(100);

    for (let i = 0; i < 20; i++) {
      const testValue = await account.fetchBalance();

      if (testValue !== null) {
        account.fetchBalance = async () => testValue;

        await account.synchronizeBalance();

        expect(account.getBalance()).toBe(testValue);
        return;
      }
    }

    throw new Error('fetchBalance returned null 20 times, try test again');
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    const account = getBankAccount(100);

    account.fetchBalance = async () => null;

    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
