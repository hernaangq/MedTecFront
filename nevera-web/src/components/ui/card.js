import React from 'react';

export function Card({ children, className }) {
  return <div className={`bg-white shadow-md rounded-2xl p-6 ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="text-xl font-semibold mb-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
