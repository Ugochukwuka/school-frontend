"use client";

interface SubjectResult {
  subject: string;
  test1?: number;
  test2?: number;
  testTotal?: number;
  exam?: number;
  total?: number;
  classAverage?: number;
  position?: string;
  teacherRemark?: string;
}

interface MarksTableProps {
  results: SubjectResult[];
  totalScore?: number;
  learnerAverage?: number;
}

export default function MarksTable({ results, totalScore = 0, learnerAverage = 0 }: MarksTableProps) {
  return (
    <div className="mb-4" style={{ color: '#000' }}>
      <h3 className="text-center font-bold uppercase mb-2" style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
        PART A: ACADEMIC PERFORMANCE
      </h3>
      <div className="overflow-x-auto">
        <table 
          className="w-full border-collapse" 
          style={{ 
            fontSize: '11px',
            border: '1px solid #000'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th className="border border-black px-2 py-1 text-left font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                SUBJECTS
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                1ST TEST (20mks)
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                2ND TEST (20mks)
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                TEST TOTAL (40mks)
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                EXAM (60mks)
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                TOTAL (100mks)
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                CLASS AVERAGE
              </th>
              <th className="border border-black px-2 py-1 text-center font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                POSITION
              </th>
              <th className="border border-black px-2 py-1 text-left font-bold" style={{ fontSize: '10px', color: '#000', borderColor: '#000' }}>
                TEACHER'S REMARK
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} style={{ color: '#000' }}>
                <td className="border border-black px-2 py-1 text-left" style={{ borderColor: '#000' }}>
                  {result.subject}
                </td>
                <td className="border border-black px-2 py-1 text-right" style={{ borderColor: '#000' }}>
                  {result.test1 ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-right" style={{ borderColor: '#000' }}>
                  {result.test2 ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-right" style={{ borderColor: '#000' }}>
                  {result.testTotal ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-right" style={{ borderColor: '#000' }}>
                  {result.exam ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-right font-bold" style={{ borderColor: '#000', color: '#000' }}>
                  {result.total ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-right" style={{ borderColor: '#000' }}>
                  {result.classAverage ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-center" style={{ borderColor: '#000' }}>
                  {result.position ?? "N/A"}
                </td>
                <td className="border border-black px-2 py-1 text-left" style={{ borderColor: '#000' }}>
                  {result.teacherRemark ?? "N/A"}
                </td>
              </tr>
            ))}
            {/* TOTAL row inside table */}
            <tr style={{ color: '#000', borderTop: '2px solid #000' }}>
              <td 
                colSpan={5} 
                className="border border-black px-2 py-1 text-right font-bold" 
                style={{ borderColor: '#000' }}
              >
                TOTAL (Overall Score):
              </td>
              <td className="border border-black px-2 py-1 text-right font-bold" style={{ borderColor: '#000', color: '#000' }}>
                {totalScore}
              </td>
              <td colSpan={3} className="border border-black" style={{ borderColor: '#000' }}></td>
            </tr>
            {/* LEARNER'S AVERAGE row inside table */}
            <tr style={{ color: '#000', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
              <td 
                colSpan={5} 
                className="border border-black px-2 py-1 text-right font-bold" 
                style={{ borderColor: '#000' }}
              >
                LEARNER'S AVERAGE:
              </td>
              <td className="border border-black px-2 py-1 text-right font-bold" style={{ borderColor: '#000', color: '#000' }}>
                {learnerAverage}%
              </td>
              <td colSpan={3} className="border border-black" style={{ borderColor: '#000' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
