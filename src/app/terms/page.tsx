import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Code2, Scale, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Localbox',
  description: 'Terms of service, open source license, and usage guidelines for Localbox browser tools.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using Localbox (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should discontinue use of the Service immediately.
        </p>
        <p>
          Localbox is operated as a free, open-source utility for processing documents, PDFs, and audio directly within your web browser.
        </p>
      </>
    ),
  },
  {
    title: '2. Client-Side Execution & Service Nature',
    content: (
      <>
        <p>
          Localbox provides browser-based utilities that execute locally on your device via Web Workers, WebAssembly (FFmpeg), and client-side JavaScript.
        </p>
        <p>
          Because file processing happens entirely inside your browser sandbox, Localbox does not upload, copy, or retain your files, text, images, or audio on remote servers. Performance depends on your hardware capabilities, available memory, and web browser compatibility.
        </p>
      </>
    ),
  },
  {
    title: '3. Your Content and Data',
    content: (
      <>
        <p>
          You retain full ownership and intellectual property rights in all files and content that you process using Localbox. Localbox claims no ownership, copyright, or licensing rights over your documents, images, or audio.
        </p>
        <p>
          You are solely responsible for ensuring that you have all necessary rights, licenses, and permissions to process, alter, or convert the files you input into the Service.
        </p>
      </>
    ),
  },
  {
    title: '4. User Responsibility & File Backups',
    content: (
      <>
        <p>
          Localbox is provided for your convenience. While designed to be reliable, client-side processing can occasionally be interrupted by browser tab closures, memory limits, or unexpected file corruption.
        </p>
        <p>
          Always keep backup copies of your original files before performing merge, split, trim, or conversion operations. You agree that Localbox is not liable for any data loss, accidental file overwrite, or corruption.
        </p>
      </>
    ),
  },
  {
    title: '5. Open Source License',
    content: (
      <>
        <p>
          The Localbox web application source code is open source and licensed under the MIT License. The repository is available on GitHub at{' '}
          <Link
            href="https://github.com/1IN1B/localbox"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            github.com/1IN1B/localbox
          </Link>.
        </p>
        <p>
          You are free to view, fork, inspect, and contribute to the code in accordance with the terms of the MIT License.
        </p>
      </>
    ),
  },
  {
    title: '6. Privacy & Analytics',
    content: (
      <>
        <p>
          Our handling of information is described in our{' '}
          <Link
            href="/privacy"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Privacy Policy
          </Link>. We collect only minimal, anonymous telemetry (such as aggregate page visits and completed tool operation counts) without transmitting any file names or file content.
        </p>
      </>
    ),
  },
  {
    title: '7. Disclaimer of Warranties',
    content: (
      <>
        <p>
          LOCALBOX IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NONINFRINGEMENT.
        </p>
        <p>
          WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM BUGS.
        </p>
      </>
    ),
  },
  {
    title: '8. Limitation of Liability',
    content: (
      <>
        <p>
          IN NO EVENT SHALL THE AUTHORS, OPERATORS, OR CONTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
      </>
    ),
  },
  {
    title: '9. Changes and Questions',
    content: (
      <>
        <p>
          We may revise these Terms of Service periodically. Changes will be posted to this page with an updated date. If you have questions, feedback, or need to report an issue, please open an issue in the{' '}
          <Link
            href="https://github.com/1IN1B/localbox/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Localbox GitHub repository
          </Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
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
            <Scale className="size-6" />
          </div>
          <p className="mt-6 text-sm font-semibold text-primary">Clear, simple guidelines</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Localbox is free, open source, and processes files locally on your device. These terms outline how the service works and what you can expect.
          </p>
          <p className="mt-6 text-xs font-medium text-muted-foreground">Last updated: September 12, 2026</p>
        </header>

        <section aria-label="Terms summary" className="mt-5 grid gap-3 sm:grid-cols-3">
          <Summary icon={CheckCircle2} title="100% Free & Local" detail="Free to use with no remote file uploads or login required." />
          <Summary icon={Code2} title="MIT Open Source" detail="Source code freely available and transparent on GitHub." />
          <Summary icon={ShieldAlert} title="As-Is Software" detail="Standard open-source terms; always keep file backups." />
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

function Summary({ icon: Icon, title, detail }: { icon: typeof Scale; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <Icon className="size-4 text-primary" />
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}
