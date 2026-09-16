import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { JUDGE_DEFENSE_QUESTIONS } from '../data/s3dgenStages';
import { ProvenanceBadge } from './ProvenanceBadge';
import { WorkflowStep } from '../types';

interface JudgeDefenseModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onNavigateToStage?: (step: WorkflowStep) => void;
}

export const JudgeDefenseModal: React.FC<JudgeDefenseModalProps> = ({
  isOpen = true,
  onClose,
  onNavigateToStage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQAId, setSelectedQAId] = useState<number>(1);

  if (!isOpen) return null;

  const filteredQAs = JUDGE_DEFENSE_QUESTIONS.filter((qa) =>
    qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qa.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qa.detailedDefense.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeQA = JUDGE_DEFENSE_QUESTIONS.find((q) => q.id === selectedQAId) || JUDGE_DEFENSE_QUESTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17324D]/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#FFFFFF] border border-[#D8E4EF] rounded-2xl shadow-[0_24px_64px_rgba(50,90,125,0.18)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8E4EF] bg-[#F5F9FD]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ECFAFF] border border-[#28BFEF]/40 text-[#28BFEF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#17324D] font-mono">
                  S3DGen Technical Defense Matrix
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-lg bg-[#ECFAFF] text-[#28BFEF] border border-[#28BFEF]/40 font-bold">
                  EVIDENTIARY AUDIT
                </span>
              </div>
              <p className="text-xs text-[#60758A] font-mono">
                14 Technical & Evidentiary Defense Questions for Expert Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#60758A] hover:text-[#17324D] hover:bg-[#E2ECF4] transition-colors border border-transparent hover:border-[#D8E4EF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="px-6 py-3 border-b border-[#D8E4EF] bg-[#FFFFFF]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9BA8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search defense questions, mathematical formulation, or limitations..."
              className="w-full bg-[#F5F9FD] border border-[#D8E4EF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#17324D] placeholder-[#8C9BA8] focus:outline-none focus:border-[#28BFEF] transition-colors"
            />
          </div>
        </div>

        {/* Split Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Question List (Left) */}
          <div className="md:col-span-5 border-r border-[#D8E4EF] overflow-y-auto p-3 space-y-1.5 max-h-[60vh] md:max-h-none bg-[#F5F9FD]">
            {filteredQAs.map((qa) => {
              const isSelected = qa.id === selectedQAId;
              return (
                <div
                  key={qa.id}
                  onClick={() => setSelectedQAId(qa.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                    isSelected
                      ? 'bg-[#ECFAFF] border-[#28BFEF] text-[#17324D] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#D8E4EF] hover:bg-[#FFFFFF] hover:border-[#28BFEF]/40 text-[#425466]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug">
                      {qa.question}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-[#28BFEF]' : 'text-[#8C9BA8]'}`} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <ProvenanceBadge type={qa.statusTag} size="sm" showIcon={false} />
                    <span className="text-[10px] text-[#8C9BA8] font-mono truncate">
                      {qa.stageReference.split(':')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Question Detail & Defense (Right) */}
          <div className="md:col-span-7 p-6 overflow-y-auto bg-[#FFFFFF] space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#28BFEF] bg-[#ECFAFF] border border-[#28BFEF]/40 px-2.5 py-1 rounded-lg">
                DEFENSE QUESTION #{activeQA.id}
              </span>
              <ProvenanceBadge type={activeQA.statusTag} size="md" />
            </div>

            <h3 className="text-base font-bold text-[#17324D] leading-snug">
              {activeQA.question}
            </h3>

            {/* Quick Answer Banner */}
            <div className="p-3.5 rounded-xl bg-[#ECFAFF] border border-[#28BFEF]/30 text-xs text-[#17324D]">
              <div className="font-mono text-[10px] uppercase text-[#28BFEF] font-bold mb-1">
                Executive Defense Summary:
              </div>
              <p className="font-semibold">{activeQA.shortAnswer}</p>
            </div>

            {/* In-Depth Technical Defense */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-[#60758A] font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#28BFEF]" />
                <span>In-Depth Engineering Defense</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FD] border border-[#D8E4EF] text-xs text-[#425466] leading-relaxed font-sans space-y-2">
                <p>{activeQA.detailedDefense}</p>
              </div>
            </div>

            {/* Technical Honesty & Limitation Acknowledged */}
            <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#D97706] font-mono text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Technical Honesty & Limitation Acknowledged</span>
              </div>
              <p className="text-[#78350F] text-[11px] leading-relaxed">
                {activeQA.limitationsAcknowledged}
              </p>
            </div>

            {/* Stage Association */}
            <div className="pt-2 border-t border-[#D8E4EF] flex items-center justify-between text-xs font-mono text-[#60758A]">
              <span>Primary Pipeline Stage:</span>
              <span className="text-[#17324D] font-bold">{activeQA.stageReference}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#D8E4EF] bg-[#F5F9FD] text-xs font-mono text-[#60758A]">
          <span>Target: S3DGen Photogrammetric & Epistemic Evaluation Matrix</span>
          <button
            onClick={onClose}
            className="btn-primary-cyan px-4 py-1.5 rounded-xl text-xs font-mono"
          >
            Close Defense Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
