import io
import email
from email import policy
from fastapi import UploadFile

def parse_uploaded_file(file: UploadFile, file_bytes: bytes) -> str:
    filename = file.filename.lower()
    
    if filename.endswith(".txt"):
        try:
            return file_bytes.decode("utf-8")
        except Exception:
            return file_bytes.decode("latin-1", errors="ignore")
            
    elif filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted: text.append(extracted)
            return "\n".join(text) if text else "Error: Empty or scanned PDF without OCR."
        except Exception as e:
            return f"PDF parse error: {str(e)}"
            
    elif filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as e:
            return f"DOCX parse error: {str(e)}"
            
    elif filename.endswith(".eml") or filename.endswith(".msg"):
        try:
            msg = email.message_from_bytes(file_bytes, policy=policy.default)
            subject = msg.get("subject", "")
            sender = msg.get("from", "")
            date = msg.get("date", "")
            
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="ignore")
            else:
                body = msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="ignore")
                
            return f"EMAIL SUBJECT: {subject}\nFROM: {sender}\nDATE: {date}\n\nBODY:\n{body}"
        except Exception as e:
            return f"EML parse error: {str(e)}"
            
    else:
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return "Unsupported file format."
