'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyDocumentsPage() {
  const [documents, setDocuments] = useState({
    business_license: null as File | null,
    tax_certificate: null as File | null,
    company_profile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const router = useRouter();

  const handleFileChange = (docType: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const uploadDocument = async (docType: string, file: File) => {
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch('/api/company/documents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    return response.json();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload all documents
      for (const [docType, file] of Object.entries(documents)) {
        if (file) {
          await uploadDocument(docType, file);
          setUploadedDocs(prev => [...prev, docType]);
        }
      }

      // Submit for review
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company/documents/submit', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        router.push('/client');
      }
    } catch (err) {
      console.error('Document submission failed');
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { key: 'business_license', label: 'Business License', required: true },
    { key: 'tax_certificate', label: 'Tax Certificate', required: true },
    { key: 'company_profile', label: 'Company Profile', required: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Company Document Verification</h1>
          <p className="text-gray-600 mt-2">Upload your company documents for verification</p>
        </div>

        <div className="space-y-6">
          {documentTypes.map(({ key, label, required }) => (
            <div key={key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{label}</h3>
                {required && <span className="text-red-500 text-sm">Required</span>}
                {uploadedDocs.includes(key) && (
                  <span className="text-green-500 text-sm">✓ Uploaded</span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
              />
              {documents[key as keyof typeof documents] && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {documents[key as keyof typeof documents]?.name}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• All documents will be reviewed by our admin team</li>
            <li>• Review process typically takes 1-2 business days</li>
            <li>• You'll receive email notification once approved</li>
            <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !documents.business_license || !documents.tax_certificate}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting Documents...' : 'Submit for Review'}
        </button>
      </div>
    </div>
  );
}