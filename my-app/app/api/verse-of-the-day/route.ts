import { NextResponse } from 'next/server';

// Fallback verses for when the API is unavailable
const fallbackVerses = [
  {
    verse: "John 3:16",
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
  },
  {
    verse: "Psalm 23:1",
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd, I lack nothing."
  },
  {
    verse: "Philippians 4:13",
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength."
  },
  {
    verse: "Jeremiah 29:11",
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
  },
  {
    verse: "Romans 8:28",
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."
  }
];

export async function GET() {
  try {
    // Try to get a random verse from the Bible API
    const response = await fetch('https://labs.bible.org/api/?passage=random&type=json&formatting=plain');
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data[0]) {
        const verse = {
          verse: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`,
          reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`,
          text: data[0].text.trim()
        };
        
        return NextResponse.json(verse);
      }
    }
    
    // If the API fails, return a random fallback verse
    const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
    return NextResponse.json(fallbackVerses[randomIndex]);
    
  } catch (error) {
    console.error('Error fetching verse of the day:', error);
    
    // Return a random fallback verse on error
    const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
    return NextResponse.json(fallbackVerses[randomIndex]);
  }
}
