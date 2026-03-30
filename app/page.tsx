'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File>(null);

  return (
    <div style={{padding: '40px', textAlign: 'center'}}>
      <h1>Image Background Remover</h1>
      <input type='file' onChange={(e) => setFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)} />
      <p>{file ? file.name : 'No file selected'}</p>
    </div>
  );
}
