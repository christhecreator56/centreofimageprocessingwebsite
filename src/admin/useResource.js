import { useCallback, useEffect, useState } from 'react';
import { admin } from '../lib/api';

/**
 * List + edit state for one table.
 *
 * Editing happens against a draft copy, so an abandoned edit never mutates the
 * list, and a failed save leaves the form exactly as the user left it rather
 * than reverting their typing.
 */
export function useResource(table, loader, blank) {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await loader());
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load rows.');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startNew = () => setDraft({ ...blank });
  const startEdit = (row) => setDraft({ ...row });
  const cancel = () => setDraft(null);
  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await admin.save(table, draft);
      setDraft(null);
      setNotice('Saved.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete “${row.title || row.name}”? This cannot be undone.`)) return;
    setError('');
    try {
      await admin.remove(table, row.id);
      if (row.image_path) await admin.removeImage(row.image_path);
      setNotice('Deleted.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  };

  return {
    rows, draft, loading, saving, error, notice,
    setError, setNotice, refresh, startNew, startEdit, cancel, patch, save, remove,
  };
}

export default useResource;
