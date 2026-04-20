// app/(dynamic)/layout.js
export const dynamic = 'force-dynamic';

export default function DynamicLayout({ children }) {
  return <>{children}</>;
}