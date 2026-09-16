import React from 'react';
import { DataProvenance } from '../types';
import { CheckCircle2, Cpu, FileText, AlertTriangle, Clock, Lock } from 'lucide-react';

interface ProvenanceBadgeProps {
  type: DataProvenance | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'REAL':
        return {
          label: '[REAL]',
          icon: CheckCircle2,
          classes: 'bg-[#EAFBF3] text-[#1A9260] border-[#B9E8D2]',
          desc: 'Real uploaded or directly measured data',
        };
      case 'COMPUTED':
        return {
          label: '[COMPUTED]',
          icon: Cpu,
          classes: 'bg-[#ECFAFF] text-[#1B85AE] border-[#BFE8F5]',
          desc: 'Computed prototype algorithmic result',
        };
      case 'FROM_INPUT':
        return {
          label: '[FROM INPUT DATA]',
          icon: FileText,
          classes: 'bg-[#F0F1FE] text-[#4C4FC4] border-[#C9CBF5]',
          desc: 'Directly sourced from input dataset without modification',
        };
      case 'DEMO_SIMULATED':
        return {
          label: '[DEMO / SIMULATED]',
          icon: AlertTriangle,
          classes: 'bg-[#FDF6E7] text-[#A6740F] border-[#F0DBA6]',
          desc: 'Demonstration / simulated for visual and workflow presentation',
        };
      case 'PLANNED_FUTURE':
        return {
          label: '[PLANNED / FUTURE]',
          icon: Clock,
          classes: 'bg-[#F4F1FF] text-[#6A5CD6] border-[#D9D2F7]',
          desc: 'Planned architecture for production deployment',
        };
      case 'PROTECTED_REFERENCE':
        return {
          label: '[PROTECTED SPATIAL REFERENCE]',
          icon: Lock,
          classes: 'bg-[#17324D] text-[#7FD8F5] border-[#28495F]',
          desc: 'Confidential authorized spatial datum constraint',
        };
      case 'DEMO_METRIC_NOT_VALIDATED':
        return {
          label: '[DEMO METRIC — NOT VALIDATED]',
          icon: AlertTriangle,
          classes: 'bg-[#FDF6E7] text-[#966008] border-[#EFCE85]',
          desc: 'Mathematical formulation demonstrated; requires ground-truth sensor sync for certified validation',
        };
      default:
        return {
          label: `[${type}]`,
          icon: Cpu,
          classes: 'bg-[#F0F4F8] text-[#60758A] border-[#D8E4EF]',
          desc: 'System component',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-wide',
    md: 'text-xs px-2.5 py-1 font-mono font-bold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-mono font-bold tracking-wide',
  }[size];

  return (
    <span
      title={config.desc}
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold select-none ${sizeClasses} ${config.classes} ${className}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};
