import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { certificateId } = await request.json()

    const supabase = createServerClient()

    // Get certificate data
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        *,
        users!certificates_user_id_fkey(full_name),
        courses!certificates_course_id_fkey(title, duration, skills)
      `)
      .eq("id", certificateId)
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Generate PDF certificate
    const pdfBuffer = await generateCertificatePDF({
      user_name: certificate.users.full_name,
      course_title: certificate.courses.title,
      completion_date: certificate.completion_date,
      certificate_id: certificate.certificate_id,
      course_duration: certificate.courses.duration,
      skills_learned: certificate.courses.skills || [],
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.courses.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating certificate:", error)
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 })
  }
}

async function generateCertificatePDF(data: {
  user_name: string
  course_title: string
  completion_date: string
  certificate_id: string
  course_duration: string
  skills_learned: string[]
}) {
  // Simple PDF generation using HTML to PDF conversion
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 800px;
          width: 100%;
          position: relative;
          border: 8px solid #2563eb;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
        }
        .header {
          margin-bottom: 40px;
        }
        .title {
          font-size: 48px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .subtitle {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 40px;
        }
        .recipient {
          font-size: 36px;
          font-weight: bold;
          color: #1f2937;
          margin: 30px 0;
          text-decoration: underline;
          text-decoration-color: #2563eb;
        }
        .course {
          font-size: 28px;
          color: #2563eb;
          font-weight: 600;
          margin: 30px 0;
        }
        .completion-text {
          font-size: 16px;
          color: #6b7280;
          margin: 20px 0;
        }
        .date {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 20px 0;
        }
        .certificate-id {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .skills {
          margin: 30px 0;
          text-align: left;
        }
        .skills-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
          text-align: center;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .skill {
          background: #eff6ff;
          color: #2563eb;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: end;
        }
        .signature {
          text-align: center;
          flex: 1;
        }
        .signature-line {
          border-top: 2px solid #2563eb;
          width: 200px;
          margin: 0 auto 10px;
        }
        .signature-text {
          font-size: 14px;
          color: #6b7280;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="title">Certificado</div>
          <div class="subtitle">de Finalización Exitosa</div>
        </div>
        
        <div class="completion-text">Se otorga el presente certificado a</div>
        <div class="recipient">${data.user_name}</div>
        <div class="completion-text">por haber completado exitosamente el curso</div>
        <div class="course">${data.course_title}</div>
        
        ${
          data.skills_learned.length > 0
            ? `
          <div class="skills">
            <div class="skills-title">Habilidades Adquiridas</div>
            <div class="skills-list">
              ${data.skills_learned.map((skill) => `<span class="skill">${skill}</span>`).join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <div class="date">Fecha de Finalización: ${new Date(data.completion_date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</div>
        
        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Plataforma de Aprendizaje IA</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Director Académico</div>
          </div>
        </div>
        
        <div class="certificate-id">
          ID del Certificado: ${data.certificate_id}<br>
          Duración del Curso: ${data.course_duration}<br>
          Verificar en: https://tu-plataforma.com/verify/${data.certificate_id}
        </div>
      </div>
    </body>
    </html>
  `

  // For now, return a simple PDF placeholder
  // In production, you would use a library like puppeteer or jsPDF
  const pdfContent = Buffer.from(`
    %PDF-1.4
    1 0 obj
    <<
    /Type /Catalog
    /Pages 2 0 R
    >>
    endobj
    2 0 obj
    <<
    /Type /Pages
    /Kids [3 0 R]
    /Count 1
    >>
    endobj
    3 0 obj
    <<
    /Type /Page
    /Parent 2 0 R
    /MediaBox [0 0 612 792]
    /Contents 4 0 R
    >>
    endobj
    4 0 obj
    <<
    /Length 44
    >>
    stream
    BT
    /F1 12 Tf
    100 700 Td
    (Certificate for ${data.user_name}) Tj
    ET
    endstream
    endobj
    xref
    0 5
    0000000000 65535 f 
    0000000009 00000 n 
    0000000058 00000 n 
    0000000115 00000 n 
    0000000206 00000 n 
    trailer
    <<
    /Size 5
    /Root 1 0 R
    >>
    startxref
    299
    %%EOF
  `)

  return pdfContent
}
