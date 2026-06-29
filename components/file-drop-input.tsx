'use client';

import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';

type FileDropInputProps = {
  name: string;
  label: string;
  helperText: string;
  accept: string;
  required?: boolean;
  maxSizeLabel: string;
};

export function FileDropInput({ name, label, helperText, accept, required = false, maxSizeLabel }: FileDropInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  function updateSelectedFile(files: FileList | null) {
    const file = files?.[0];
    setFileName(file?.name ?? '');
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    updateSelectedFile(event.currentTarget.files);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (inputRef.current && files.length > 0) {
      inputRef.current.files = files;
    }
    updateSelectedFile(files);
  }

  return (
    <div className="ll-field ll-file-field">
      <label className="ll-label" htmlFor={inputId}>
        {label} {required ? <span aria-label="required">required</span> : null}
      </label>
      <label
        className={`ll-drop-zone ${isDragging ? 'is-dragging' : ''}`}
        htmlFor={inputId}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input ref={inputRef} id={inputId} name={name} type="file" accept={accept} required={required} onChange={onChange} />
        <strong>Browse computer</strong>
        <span>{helperText}</span>
        <small>{fileName || 'No file selected yet'}</small>
        <em>{maxSizeLabel} max</em>
      </label>
    </div>
  );
}
