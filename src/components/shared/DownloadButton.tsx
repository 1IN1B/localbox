'use client';

import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  children?: React.ReactNode;
  className?: string;
}

export default function DownloadButton({
  blob,
  filename,
  children,
  className,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after a short delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setDownloading(false);
  }, [blob, filename]);

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      className={className}
    >
      <Download className="size-4" />
      {children ?? 'Download'}
    </Button>
  );
}
