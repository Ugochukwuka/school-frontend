"use client";

interface TraitsTableProps {
  traits?: {
    punctuality?: boolean;
    classAttendance?: boolean;
    workHabit?: boolean;
    senseOfResponsibility?: boolean;
    initiative?: boolean;
    reliability?: boolean;
    selfControl?: boolean;
    organizingAbility?: boolean;
    spiritOfCooperation?: boolean;
    neatness?: boolean;
    honesty?: boolean;
    politeness?: boolean;
    respectOfAuthority?: boolean;
    courtesyToOthers?: boolean;
    attentiveness?: boolean;
  };
}

export default function TraitsTable({
  traits = {
    punctuality: true,
    classAttendance: true,
    workHabit: true,
    senseOfResponsibility: true,
    initiative: true,
    reliability: true,
    selfControl: true,
    organizingAbility: true,
    spiritOfCooperation: true,
    neatness: true,
    honesty: true,
    politeness: true,
    respectOfAuthority: true,
    courtesyToOthers: true,
    attentiveness: true,
  },
}: TraitsTableProps) {
  const traitList = [
    { key: "punctuality", label: "Punctuality" },
    { key: "classAttendance", label: "Class Attendance" },
    { key: "workHabit", label: "Work Habit" },
    { key: "senseOfResponsibility", label: "Sense of Responsibility" },
    { key: "initiative", label: "Initiative" },
    { key: "reliability", label: "Reliability" },
    { key: "selfControl", label: "Self Control" },
    { key: "organizingAbility", label: "Organizing Ability" },
    { key: "spiritOfCooperation", label: "Spirit of Co-operation" },
    { key: "neatness", label: "Neatness" },
    { key: "honesty", label: "Honesty" },
    { key: "politeness", label: "Politeness" },
    { key: "respectOfAuthority", label: "Respect of Authority" },
    { key: "courtesyToOthers", label: "Courtesy to others" },
    { key: "attentiveness", label: "Attentiveness" },
  ];

  return (
    <div className="mb-4" style={{ color: '#000' }}>
      <h3 className="text-center font-bold uppercase mb-2" style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
        PART B: ACADEMIC RATING AND TRAITS
      </h3>
      
      {/* Academic Rating Keys */}
      <div className="mb-3" style={{ fontSize: '11px', color: '#000' }}>
        <p className="font-bold mb-1" style={{ color: '#000' }}>KEYS TO ACADEMIC RATING:</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <div style={{ color: '#000' }}>A. 80-Above - Excellent</div>
          <div style={{ color: '#000' }}>B. 70-79.9% - Very good</div>
          <div style={{ color: '#000' }}>C. 60-69.9% - Good</div>
          <div style={{ color: '#000' }}>D. 50-59.9% - Pass</div>
          <div style={{ color: '#000' }}>E. 40-49.9% - Fail</div>
          <div style={{ color: '#000' }}>F. 0-39.9% - Withdraw</div>
        </div>
      </div>

      {/* Traits Table */}
      <div style={{ border: '1px solid #000' }}>
        <div className="grid grid-cols-3">
          {traitList.map((trait, index) => {
            const hasCheck = traits?.[trait.key as keyof typeof traits] ?? true;
            return (
              <div
                key={trait.key}
                className="px-2 py-1 border-r border-b"
                style={{ 
                  fontSize: '11px',
                  borderColor: '#000',
                  borderRight: index % 3 === 2 ? 'none' : '1px solid #000',
                  color: '#000'
                }}
              >
                <div className="flex items-center gap-1">
                  {hasCheck && (
                    <span className="font-bold" style={{ color: '#22c55e' }}>✓</span>
                  )}
                  <span style={{ color: '#000' }}>{trait.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
