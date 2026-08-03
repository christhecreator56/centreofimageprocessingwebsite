import React, { useRef, useState } from 'react';
import { admin } from '../lib/api';
import { Button, Field, Input } from './ui';

/**
 * Image picker that accepts either an upload or a pasted URL.
 *
 * Both are kept because they solve different problems: uploads go to Supabase
 * Storage and are owned by the site, while a URL lets you point at an existing
 * asset without duplicating it. `path` is tracked alongside the URL so a
 * replaced upload can be deleted from the bucket instead of orphaned.
 */
export default function ImageField({ value, path, folder, onChange, label = 'Image' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Images must be under 8 MB — resize it first.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const uploaded = await admin.uploadImage(file, folder);
      // Only remove the previous object once the new one is safely stored.
      if (path) await admin.removeImage(path);
      onChange({ url: uploaded.url, path: uploaded.path });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Field label={label}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-ink/15 bg-background">
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-muted">
                none
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Input
              type="url"
              placeholder="https://… or upload a file"
              value={value || ''}
              onChange={(e) => onChange({ url: e.target.value, path: null })}
            />
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
              <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
                {busy ? 'Uploading…' : 'Upload'}
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (path) await admin.removeImage(path);
                    onChange({ url: '', path: null });
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Field>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
