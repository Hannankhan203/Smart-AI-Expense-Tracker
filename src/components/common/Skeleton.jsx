import React from 'react';

export default function Skeleton({
  variant = 'text',
  className = '',
  width,
  height,
  count = 1,
}) {
  const baseStyles = 'bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse shrink-0';

  const variants = {
    text: 'h-3.5 w-full rounded-sm',
    circular: 'rounded-full w-9 h-9',
    rectangular: 'rounded-lg w-full h-24',
    card: 'rounded-xl w-full h-36 border border-slate-200 dark:border-slate-800 p-4',
    'table-row': 'h-10 w-full rounded-lg',
  };

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${variants[variant] || variants.text} ${className}`}
          style={style}
        />
      ))}
    </>
  );
}
