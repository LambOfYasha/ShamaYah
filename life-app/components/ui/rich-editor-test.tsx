'use client';

import React, { useState } from 'react';
import ClientRichEditor from './client-rich-editor';
import RichContentRenderer from './rich-content-renderer';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export default function RichEditorTest() {
  const [content, setContent] = useState('<p>Start typing here to test the rich text editor...</p>');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Editor</h3>
              <ClientRichEditor
                content={content}
                onChange={setContent}
                placeholder="Test the rich text editor features..."
                maxHeight="500px"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              <Button 
                onClick={() => setContent('<p>Reset content</p>')}
                variant="outline"
              >
                Reset Content
              </Button>
            </div>
            
            {showPreview && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <Card>
                  <CardContent className="p-4">
                    <RichContentRenderer content={content} />
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Raw HTML</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {content}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 