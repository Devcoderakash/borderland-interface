declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInstance {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: '_modal' | '_self' | '_blank' | string;
    }) => Promise<{ error?: { message: string }; redirect?: boolean; paymentDetails?: unknown }>;
  }

  export interface CashfreeLoadOptions {
    mode: 'sandbox' | 'production';
  }

  export function load(options: CashfreeLoadOptions): Promise<CashfreeInstance>;
}
