import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Replace, Trash2 } from 'lucide-react';
import {
  getSignatureImage,
  removeSignatureImage,
  saveSignatureImage,
} from '../../utils/signatureStorage';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

const readFileAsDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error('Unable to read the selected image.'));
  reader.readAsDataURL(file);
});

export default function SignatureUpload({ applicationId, section, signature, onChange }) {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;

    getSignatureImage(applicationId, section)
      .then(savedImage => {
        if (!active) return;
        setImage(savedImage || null);
        if (savedImage) {
          onChangeRef.current({ fileName: savedImage.fileName, mimeType: savedImage.mimeType });
        }
        setLoading(false);
      })
      .catch(storageError => {
        if (!active) return;
        console.error('Signature image load error', storageError);
        setError('Unable to load the saved signature image. Please check browser storage.');
        setLoading(false);
      });

    return () => { active = false; };
  }, [applicationId, section]);

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Choose a PNG, JPG, or JPEG image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('The signature image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const savedImage = { dataUrl, fileName: file.name, mimeType: file.type };
      await saveSignatureImage(applicationId, section, savedImage);
      setImage(savedImage);
      onChange({ fileName: file.name, mimeType: file.type });
    } catch (uploadError) {
      console.error('Signature image save error', uploadError);
      setError('Unable to save this signature image. Please try again.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemove = async () => {
    setError('');
    try {
      await removeSignatureImage(applicationId, section);
      setImage(null);
      onChange('');
    } catch (removeError) {
      console.error('Signature image remove error', removeError);
      setError('Unable to remove the saved signature image. Please try again.');
    }
  };

  return (
    <div>
      <label className="label">Upload Signature</label>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        onChange={handleFileChange}
        className="sr-only"
        aria-label={`Upload signature image for ${section}`}
      />

      {image ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <img
            src={image.dataUrl}
            alt="Uploaded signature preview"
            className="h-20 max-w-full object-contain object-left"
          />
          <p className="mt-2 truncate text-xs text-slate-500" title={image.fileName}>
            {image.fileName}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary btn-sm">
              <Replace size={13} /> Replace
            </button>
            <button type="button" onClick={handleRemove} className="btn-secondary btn-sm text-red-600">
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn-secondary w-full justify-center"
        >
          <ImagePlus size={15} /> {loading ? 'Loading signature...' : 'Choose signature image'}
        </button>
      )}
      <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, or JPEG · Maximum 5 MB</p>
      {signature && !image && !loading && (
        <p className="mt-1 text-xs text-slate-500">
          {typeof signature === 'string'
            ? `Previously saved signature text: ${signature}`
            : `Saved file: ${signature.fileName}`}
        </p>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
