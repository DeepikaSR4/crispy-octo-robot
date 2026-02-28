import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LevelUp Engine – 4 Week Developer Evolution System',
  description: 'Gamified AI-powered structured growth platform. Complete Flutter and SwiftUI challenges, get AI code reviews, earn XP and badges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
