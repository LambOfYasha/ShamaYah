'use client';

import { useState } from 'react';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import RichContentRenderer from '@/components/ui/rich-content-renderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRichEditorPage() {
  const [content, setContent] = useState('<p>This is a <strong>test</strong> with <em>rich</em> formatting.</p>');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rich Editor Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientRichEditor
            content={content}
            onChange={setContent}
            placeholder="Test rich content..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw HTML Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {content}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendered Content</CardTitle>
        </CardHeader>
        <CardContent>
          <RichContentRenderer content={content} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Bold Text</h3>
            <RichContentRenderer content="<p>This is <strong>bold text</strong>.</p>" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Italic Text</h3>
            <RichContentRenderer content="<p>This is <em>italic text</em>.</p>" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Colored Text</h3>
            <RichContentRenderer content="<p>This is <span style=\"color: red;\">red text</span>.</p>" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Code Block</h3>
            <RichContentRenderer content="<pre><code>console.log('Hello World');</code></pre>" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Link</h3>
            <RichContentRenderer content="<p>This is a <a href=\"https://example.com\">link</a>.</p>" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Blockquote</h3>
            <RichContentRenderer content="<blockquote>This is a blockquote.</blockquote>" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 