'use client';

import React, { useState } from 'react';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import RichContentRenderer from '@/components/ui/rich-content-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSpoilerPage() {
  const [content, setContent] = useState('<p>Test the spoiler functionality...</p>');
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Spoiler Functionality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Editor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click the eye icon (👁️) in the toolbar to add a spoiler. Then test if it works in the preview below.
              </p>
              <ClientRichEditor
                content={content}
                onChange={setContent}
                placeholder="Test the spoiler functionality..."
                maxHeight="300px"
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
              <h3 className="text-lg font-semibold mb-2">Test Direct Spoiler</h3>
              <Card>
                <CardContent className="p-4">
                  <details className="spoiler-container">
                    <summary className="spoiler-summary">Click to reveal test spoiler</summary>
                    <div className="spoiler-content">
                      <p>This is a test spoiler that should work directly.</p>
                    </div>
                  </details>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Raw HTML</h3>
              <Card>
                <CardContent className="p-4">
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                    {content}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 