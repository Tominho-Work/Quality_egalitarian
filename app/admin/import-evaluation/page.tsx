'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportEvaluationPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setStatus('Please select a file')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    setStatus('Uploading...')
    try {
      const res = await fetch('/api/evaluation-survey/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let message = 'Upload failed'
        try {
          const error = await res.json()
          message = error.error ?? message
          console.error('Server error:', error)
        } catch {
          message = await res.text()
          console.error('Server response:', message)
        }
        throw new Error(message)
      }
      const data = await res.json()
      setStatus(`Imported ${data.inserted} records`)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setStatus(err.message || 'Upload failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Import Evaluation Survey XLSX</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-blue-900 mb-2">Supported File Formats</h2>
        <div className="text-sm text-blue-800">
          <p className="mb-2"><strong>Cycle 2 & 3 XLSX files are supported.</strong></p>
          <p className="mb-1"><strong>Key differences between cycles:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Cycle 2: Has Cultural Tour question (Column N)</li>
            <li>Cycle 3: No Cultural Tour, has Memorable Moment (Column P)</li>
            <li>Both cycles supported automatically</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select XLSX File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full border border-gray-300 p-2 rounded"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!file}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Upload & Import
        </button>
      </form>
      
      {status && (
        <div className={`mt-4 p-3 rounded-lg ${
          status.includes('Imported') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : status.includes('failed') || status.includes('Missing')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <p className="font-medium">{status}</p>
          {status.includes('Missing column') && (
            <p className="text-sm mt-2">
              Check the browser console (F12) for detailed column information.
            </p>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Troubleshooting</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Make sure the file is an Excel (.xlsx) format</li>
          <li>• Ensure the first row contains column headers</li>
          <li>• Check the browser console (F12) for detailed error messages</li>
          <li>• Verify the file isn't corrupted by opening it in Excel first</li>
        </ul>
      </div>
    </div>
  )
}
