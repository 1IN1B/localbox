import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Database, FileLock2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Localbox',
  description: 'Learn how Localbox handles files, browser storage, and anonymous usage analytics.',
};

const sections = [
  {
    title: '1. Overview',
    content: (
      <>
        <p>
          Localbox is designed to process PDF, document, image, and audio files in your browser. This policy explains the limited information we process when you use the website, how anonymous usage analytics work, and the choices available to you.
        </p>
        <p>
          This policy applies to the Localbox website and its built-in tools. It does not cover third-party websites that may be linked from Localbox, including GitHub, Vercel, or Turso.
        </p>
      </>
    ),
  },
  {
    title: '2. Your files stay on your device',
    content: (
      <>
        <p>
          Files you select for a Localbox tool are processed locally in your browser, including by Web Workers and browser-based libraries. We do not upload your source files, generated files, document text, audio, images, or file names to our analytics database.
        </p>
        <p>
          Depending on the tool and your browser, temporary working data may remain in browser memory while a task runs. Localbox may also use browser storage such as IndexedDB or the Origin Private File System (OPFS) for local workflow data. That data is controlled by your browser and can be cleared through your browser’s site-data settings.
        </p>
      </>
    ),
  },
  {
    title: '3. Anonymous usage analytics',
    content: (
      <>
        <p>
          To understand whether Localbox is being used and which tools are useful, the site creates a random UUID for each browser. The UUID is stored in that browser’s local storage under <code>localbox.visitor-id</code>. It is not an account, is not tied to your name or email address, and is not used for advertising or cross-site tracking.
        </p>
        <p>When analytics are enabled, Localbox stores only the following records:</p>
        <ul>
          <li>the random browser UUID;</li>
          <li>timestamps for landing-page visits;</li>
          <li>the name of a completed Localbox operation, such as “Merge PDF”; and</li>
          <li>aggregate counters used to display unique visitors, total visits, and completed operations.</li>
        </ul>
        <p>
          Localbox does not send your file contents, file names, document text, audio, images, selected options, or generated output to the analytics service. We do not use analytics events to make decisions about you, build profiles, serve targeted advertising, or sell personal information.
        </p>
      </>
    ),
  },
  {
    title: '4. Storage and service providers',
    content: (
      <>
        <p>
          Anonymous analytics records are stored in a Turso/libSQL database. The application may be hosted by Vercel or another hosting provider. These providers may process ordinary technical connection information, such as IP addresses, request metadata, and security logs, in order to deliver and protect their services under their own terms and privacy notices.
        </p>
        <p>
          We share data only as needed to operate Localbox: with hosting and database providers that deliver the service, when required by law, or to protect the security and integrity of the service. We do not sell or rent personal information.
        </p>
      </>
    ),
  },
  {
    title: '5. Retention',
    content: (
      <>
        <p>
          Browser-local data remains on your device until the tool finishes, you remove it, or you clear Localbox site data in your browser. Anonymous analytics records are retained until they are deleted during maintenance or when they are no longer needed to understand service usage. Localbox does not currently apply an automatic expiration period to analytics records.
        </p>
      </>
    ),
  },
  {
    title: '6. Your choices and rights',
    content: (
      <>
        <p>
          You can clear the Localbox browser UUID and local workflow data at any time through your browser’s site-data controls. Clearing the UUID prevents future events from being linked to the old UUID, but it does not automatically delete prior anonymous records held in the analytics database.
        </p>
        <p>
          Depending on where you live, privacy law may provide rights to request access, deletion, correction, restriction, or objection. Because Localbox does not collect direct contact information, requests should include the browser UUID shown in the Localbox activity panel, if available, so we can locate the relevant anonymous record.
        </p>
      </>
    ),
  },
  {
    title: '7. Security',
    content: (
      <>
        <p>
          We use reasonable technical measures intended to protect the website and its analytics infrastructure. No internet transmission or storage system can be guaranteed completely secure. Please avoid uploading sensitive files to any web application unless you understand and accept the risks of using your device and browser.
        </p>
      </>
    ),
  },
  {
    title: '8. Changes and contact',
    content: (
      <>
        <p>
          We may update this policy as Localbox changes. The “Last updated” date at the top of this page will be revised when material changes are made. For privacy questions or requests, please{' '}
          <Link
            href="https://github.com/1IN1B/localbox/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            open an issue in the Localbox GitHub repository
          </Link>{' '}
          and include your browser UUID only if you want us to locate an analytics record.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="surface-grid pointer-events-none absolute inset-x-0 top-0 h-[34rem]" />
      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:-translate-x-0.5 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Localbox
        </Link>

        <header className="glass-panel mt-7 rounded-[2rem] border border-border/70 p-7 shadow-xl shadow-primary/5 sm:p-10">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="size-6" />
          </div>
          <p className="mt-6 text-sm font-semibold text-primary">Your privacy, plainly explained</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Localbox processes files on your device. The only service-side information we collect is limited anonymous usage analytics.
          </p>
          <p className="mt-6 text-xs font-medium text-muted-foreground">Last updated: September 12, 2026</p>
        </header>

        <section aria-label="Privacy summary" className="mt-5 grid gap-3 sm:grid-cols-3">
          <Summary icon={FileLock2} title="Files stay local" detail="No file content or file names are sent to analytics." />
          <Summary icon={BarChart3} title="Minimal analytics" detail="Only a random browser ID, timestamps, and tool names." />
          <Summary icon={Database} title="Transparent storage" detail="Anonymous analytics are stored in Turso/libSQL." />
        </section>

        <article className="mt-8 space-y-8 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-border/60 pb-8 last:border-b-0 last:pb-0">
              <h2 className="text-xl font-bold tracking-[-0.025em]">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                {section.content}
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}

function Summary({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <Icon className="size-4 text-primary" />
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}
