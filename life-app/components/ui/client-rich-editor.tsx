'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Import the editor component dynamically with SSR disabled
const SimpleRichEditor = dynamic(
  () => import('./simple-rich-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-md p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    ),
  }
);

// Type for the props
type RichEditorProps = ComponentProps<typeof SimpleRichEditor>;

export default function ClientRichEditor(props: RichEditorProps) {
  return <SimpleRichEditor {...props} />;
} 