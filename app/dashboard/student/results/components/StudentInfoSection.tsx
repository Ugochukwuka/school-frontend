"use client";

interface StudentInfoSectionProps {
  studentName?: string;
  sex?: string;
  className?: string;
  age?: string;
  classAttendance?: string;
  classTeacher?: string;
  academicSession?: string;
  classPosition?: string;
  admissionNumber?: string;
}

export default function StudentInfoSection({
  studentName = "CHUKWUKA UCHE KOBIRUO",
  sex = "FEMALE",
  className = "SSS 1",
  age = "14 YEARS",
  classAttendance = "122 out of 126",
  classTeacher = "MRS EKIYOR E. E",
  academicSession = "2021/2022",
  classPosition = "1st out of 8",
  admissionNumber = "SSDS/SS1/0080/2021",
}: StudentInfoSectionProps) {
  return (
    <div className="mb-4" style={{ fontSize: '12px', color: '#000' }}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Learner's Name:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '200px',
              paddingBottom: '2px'
            }}
          >
            {studentName}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Sex:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '150px',
              paddingBottom: '2px'
            }}
          >
            {sex}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Class:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '150px',
              paddingBottom: '2px'
            }}
          >
            {className}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Age:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '150px',
              paddingBottom: '2px'
            }}
          >
            {age}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Class Attendance:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '80px',
              paddingBottom: '2px'
            }}
          >
            {classAttendance.includes('Out of') ? classAttendance.split(' Out of ')[0] : classAttendance.split(' ')[0]}
          </span>
          {" "}Out of{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '60px',
              paddingBottom: '2px'
            }}
          >
            {classAttendance.includes('Out of') ? classAttendance.split(' Out of ')[1] : classAttendance.split(' ').slice(-1)[0]}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Class Teacher:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '150px',
              paddingBottom: '2px'
            }}
          >
            {classTeacher}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Academic Session:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '120px',
              paddingBottom: '2px'
            }}
          >
            {academicSession}
          </span>
        </div>
        <div>
          <span className="font-bold" style={{ color: '#000' }}>Class Position:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '120px',
              paddingBottom: '2px'
            }}
          >
            {classPosition}
          </span>
        </div>
        <div className="col-span-2">
          <span className="font-bold" style={{ color: '#000' }}>Admission Number:</span>{" "}
          <span 
            style={{ 
              color: '#000',
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '200px',
              paddingBottom: '2px'
            }}
          >
            {admissionNumber}
          </span>
        </div>
      </div>
    </div>
  );
}
