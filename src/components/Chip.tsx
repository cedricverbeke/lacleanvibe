import type { ReactNode } from 'react';

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function Chip({ label, active, onClick, icon }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ChipGroupProps {
  options: { value: string; label: string; icon?: ReactNode }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  max?: number;
}

export function ChipGroup({ options, value, onChange, multiple = false, max }: ChipGroupProps) {
  const isSelected = (val: string) => {
    if (multiple) return Array.isArray(value) && value.includes(val);
    return value === val;
  };

  const handleClick = (val: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        if (max && arr.length >= max) return;
        onChange([...arr, val]);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          active={isSelected(opt.value)}
          onClick={() => handleClick(opt.value)}
        />
      ))}
    </div>
  );
}
