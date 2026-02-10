"use client";

interface SummarySectionProps {
  totalScore?: number;
  learnerAverage?: number;
}

export default function SummarySection({
  totalScore = 1608,
  learnerAverage = 84.6,
}: SummarySectionProps) {
  return (
    <div className="mb-4" style={{ fontSize: '12px', color: '#000' }}>
      <div className="flex justify-between items-center border-t-2 border-b-2 border-black py-2 font-bold" style={{ borderColor: '#000' }}>
        <span style={{ color: '#000' }}>TOTAL (Overall Score):</span>
        <span style={{ color: '#000' }}>{totalScore}</span>
      </div>
      <div className="flex justify-between items-center border-b-2 border-black py-2 font-bold" style={{ borderColor: '#000' }}>
        <span style={{ color: '#000' }}>LEARNER'S AVERAGE:</span>
        <span style={{ color: '#000' }}>{learnerAverage}%</span>
      </div>
    </div>
  );
}
