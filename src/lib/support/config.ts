/**
 * Support page configuration.
 */
export const supportConfig = {
  upi: {
    upiId: 'bibhuticodes@oksbi',
    payeeName: 'Localbox',
    qrImagePath: '/qrpay.jpeg',
  },
  github: {
    repoUrl: 'https://github.com/1IN1B/localbox',
    issuesUrl: 'https://github.com/1IN1B/localbox/issues',
  },
  share: {
    defaultText:
      'Localbox — free PDF & audio tools that run 100% in your browser. No uploads, no login. Check it out!',
  },
} as const;

export const DONATION_API = '/api/support/donation';