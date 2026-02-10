"use client";

interface CommentsSectionProps {
  classTeacherComment?: string;
  principalRemark?: string;
  nextTermBegins?: string;
}

export default function CommentsSection({
  classTeacherComment = "She is very intelligent, focused in class and a good team player.",
  principalRemark = "An excellent result. Uche keep soaring.",
  nextTermBegins = "10th January, 2022",
}: CommentsSectionProps) {
  return (
    <div className="mb-4" style={{ fontSize: '12px', color: '#000' }}>
      <div className="mb-2.5">
        <p className="font-bold mb-1" style={{ color: '#000' }}>Class Teacher's Comment:</p>
        <p 
          className="pl-4" 
          style={{ 
            color: '#000',
            borderBottom: '1px solid #000',
            display: 'inline-block',
            minWidth: '400px',
            paddingBottom: '2px'
          }}
        >
          {classTeacherComment}
        </p>
      </div>
      <div className="mb-2.5">
        <p className="font-bold mb-1" style={{ color: '#000' }}>Principal's Remark:</p>
        <p 
          className="pl-4" 
          style={{ 
            color: '#000',
            borderBottom: '1px solid #000',
            display: 'inline-block',
            minWidth: '400px',
            paddingBottom: '2px'
          }}
        >
          {principalRemark}
        </p>
      </div>
      <div>
        <p className="font-bold" style={{ color: '#000' }}>
          Next term begins:{" "}
          <span 
            className="font-normal"
            style={{ 
              borderBottom: '1px solid #000',
              display: 'inline-block',
              minWidth: '150px',
              paddingBottom: '2px'
            }}
          >
            {nextTermBegins}
          </span>
        </p>
      </div>
    </div>
  );
}
