'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Heart,
  Upload,
  Loader2,
  CheckCircle2,
  ReceiptText,
} from 'lucide-react';
import { supportConfig, DONATION_API } from '@/lib/support/config';
import { cn } from '@/lib/utils';

type Step = 'pay' | 'confirm' | 'done';

const MAX_IMG = 1280;

export function DonateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('pay');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_IMG / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setScreenshot(canvas.toDataURL('image/jpeg', 0.85));
        setScreenshotName(file.name);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!transactionId.trim() && !screenshot) {
      setError('Please provide a transaction ID or attach a payment screenshot.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(DONATION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          amount: amount.trim() || undefined,
          transactionId: transactionId.trim() || undefined,
          screenshot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('pay');
    setName('');
    setAmount('');
    setTransactionId('');
    setScreenshot(null);
    setScreenshotName('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                  <Heart className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Support Localbox</p>
                  <p className="text-xs text-muted-foreground">UPI donation</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-6 py-6">
              {step === 'pay' && (
                <motion.div
                  key="pay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* QR code */}
                  <div className="rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
                    <img
                      src={supportConfig.upi.qrImagePath}
                      alt="UPI payment QR code"
                      className="size-56 rounded-lg object-contain"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    {supportConfig.upi.payeeName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)
                  </p>
                  <p className="mt-3 rounded-lg bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    {supportConfig.upi.upiId}
                  </p>

                  <button
                    onClick={() => setStep('confirm')}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="size-4" />
                    I&apos;ve paid
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Payment made? Share the details below. We&apos;ll verify your
                    transaction &mdash; if valid, we&apos;ll feature you as a site sponsor on
                    Localbox.
                  </p>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Confirm your donation
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Add a transaction ID or a screenshot so we can verify it. Valid
                      donations will be featured as a site sponsor on the Localbox homepage.
                    </p>
                  </div>

                  {/* Screenshot upload */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors',
                      screenshot
                        ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    {screenshot ? (
                      <>
                        <img
                          src={screenshot}
                          alt="Payment screenshot preview"
                          className="max-h-32 rounded-lg object-contain"
                        />
                        <span className="text-xs text-muted-foreground">
                          {screenshotName} — click to change
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <Upload className="size-5" />
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          Attach payment screenshot
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PNG or JPG — resized automatically
                        </span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Transaction ID <span className="text-muted-foreground/70">(optional if you added a screenshot)</span>
                    </label>
                    <div className="relative">
                      <ReceiptText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. UPI/1234567890123 (UTR)"
                        className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Amount <span className="text-muted-foreground/70">(optional)</span>
                      </label>
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="₹ 500"
                        inputMode="numeric"
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Your name <span className="text-muted-foreground/70">(optional)</span>
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Friend of Localbox"
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit donation'
                    )}
                  </button>
                  <button
                    onClick={() => setStep('pay')}
                    className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Back to QR
                  </button>
                </motion.div>
              )}

              {step === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/15"
                  >
                    <CheckCircle2 className="size-9 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Thank you so much!
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    Your donation helps keep Localbox free, fast, and private for everyone.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}