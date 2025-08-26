'use client'

import { useState } from 'react'

export default function ImportProposalsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setStatus('Please select a file'); return }
    const formData = new FormData()
    formData.append('file', file)
    setStatus('Uploading...')
    try {
      const res = await fetch('/api/proposals-feedback/import', { method: 'POST', body: formData })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt)
      }
      const data = await res.json()
      setStatus(`Imported ${data.inserted} records`)
    } catch (e: any) {
      setStatus(e.message || 'Upload failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Import Proposals Feedback XLSX</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select XLSX File</label>
          <input type="file" accept=".xlsx,.xls" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} className="block w-full border border-gray-300 p-2 rounded" />
        </div>
        <button type="submit" disabled={!file} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">Upload & Import</button>
      </form>
      {status && <div className="mt-4 text-sm">{status}</div>}
    </div>
  )
}




