"""Document verification engine — detects fake/tampered documents."""
import re, io, logging, hashlib
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from PIL import Image, ExifTags
import pdfplumber

logger = logging.getLogger(__name__)

# ── Passport number patterns by country ──────────────────────────────
PASSPORT_PATTERNS = {
    "INDIA": r"^[A-Z][0-9]{7}$",
    "USA": r"^[0-9]{9}$",
    "UK": r"^[0-9]{9}$",
    "CANADA": r"^[A-Z]{2}[0-9]{6}$",
    "AUSTRALIA": r"^[A-Z][0-9]{7}$",
    "GERMANY": r"^[A-Z]{1,2}[0-9]{7}$",
    "FRANCE": r"^[0-9]{2}[A-Z]{2}[0-9]{5}$",
    "CHINA": r"^[GE][0-9]{8}$",
    "JAPAN": r"^[A-Z]{2}[0-9]{7}$",
    "BRAZIL": r"^[A-Z]{2}[0-9]{6}$",
}

# ── Date validation ──────────────────────────────────────────────────
def validate_date(date_str: str) -> Tuple[bool, str]:
    """Validate date format and logic."""
    formats = ["%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y"]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            if dt.year < 1900 or dt.year > datetime.now().year:
                return False, f"Year {dt.year} is out of range"
            if dt > datetime.now():
                return False, "Date is in the future"
            return True, "Valid"
        except ValueError:
            continue
    return False, "Invalid date format"

def validate_date_range(start: str, end: str) -> Tuple[bool, str]:
    """Validate that end date is after start date."""
    formats = ["%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d"]
    for fmt in formats:
        try:
            s = datetime.strptime(start, fmt)
            e = datetime.strptime(end, fmt)
            if e < s:
                return False, "End date is before start date"
            return True, "Valid range"
        except ValueError:
            continue
    return False, "Could not parse dates"

# ── Passport validation ──────────────────────────────────────────────
def validate_passport_number(passport_no: str, nationality: str = None) -> Tuple[bool, str, float]:
    """Validate passport number format and return confidence score."""
    if not passport_no:
        return False, "No passport number found", 0.0
    
    passport_no = passport_no.strip().upper()
    
    if nationality and nationality.upper() in PASSPORT_PATTERNS:
        pattern = PASSPORT_PATTERNS[nationality.upper()]
        if re.match(pattern, passport_no):
            return True, "Valid passport format", 0.95
        else:
            return False, f"Passport number doesn't match {nationality} format", 0.3
    
    # Generic validation: alphanumeric, 6-12 chars
    if re.match(r"^[A-Z0-9]{6,12}$", passport_no):
        return True, "Generic passport format valid", 0.7
    return False, "Invalid passport number format", 0.1

# ── Image integrity checks ───────────────────────────────────────────
def check_image_integrity(image_bytes: bytes) -> Dict:
    """Check image for signs of tampering."""
    results = {
        "is_valid_image": False,
        "compression_quality": None,
        "has_exif": False,
        "exif_anomalies": [],
        "metadata_consistent": True,
        "warnings": [],
        "confidence": 1.0,
    }
    
    try:
        img = Image.open(io.BytesIO(image_bytes))
        results["is_valid_image"] = True
        results["format"] = img.format
        results["size"] = img.size
        
        # Check compression quality for JPEG
        if img.format == "JPEG":
            quality = img.info.get("quality")
            results["compression_quality"] = quality
            if quality and quality < 50:
                results["warnings"].append("Low compression quality suggests re-saving")
                results["confidence"] -= 0.2
        
        # Check EXIF data
        exif = img.getexif()
        if exif:
            results["has_exif"] = True
            exif_data = {}
            for tag_id, value in exif.items():
                tag_name = ExifTags.Tags.get(tag_id, tag_id)
                exif_data[tag_name] = str(value)[:100]
            results["exif_data"] = exif_data
            
            # Check for editing software
            software = exif_data.get("Software", "").lower()
            if any(soft in software for soft in ["photoshop", "gimp", "paint", "editor"]):
                results["exif_anomalies"].append(f"Edited with: {exif_data.get('Software')}")
                results["confidence"] -= 0.3
            
            # Check for inconsistent dates
            date_taken = exif_data.get("DateTimeOriginal")
            date_modified = exif_data.get("DateTime")
            if date_taken and date_modified and date_taken != date_modified:
                results["exif_anomalies"].append("Creation and modification dates differ")
                results["confidence"] -= 0.1
        else:
            results["warnings"].append("No EXIF data (may be screenshot or re-saved)")
            results["confidence"] -= 0.15
        
        # Check for common tampering signs
        if img.mode == "RGBA":
            results["warnings"].append("Image has alpha channel (may be edited)")
            results["confidence"] -= 0.1
        
        results["confidence"] = max(0.0, min(1.0, results["confidence"]))
        
    except Exception as e:
        results["error"] = str(e)
        results["confidence"] = 0.0
    
    return results

# ── PDF integrity checks ─────────────────────────────────────────────
def check_pdf_integrity(pdf_bytes: bytes) -> Dict:
    """Check PDF for signs of tampering."""
    results = {
        "is_valid_pdf": False,
        "page_count": 0,
        "has_text": False,
        "metadata": {},
        "warnings": [],
        "confidence": 1.0,
    }
    
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            results["is_valid_pdf"] = True
            results["page_count"] = len(pdf.pages)
            
            # Check for text content
            text_pages = sum(1 for page in pdf.pages if page.extract_text())
            results["text_pages"] = text_pages
            results["has_text"] = text_pages > 0
            
            if not results["has_text"]:
                results["warnings"].append("PDF contains no text (scanned image)")
                results["confidence"] -= 0.2
            
            # Check metadata
            if pdf.metadata:
                results["metadata"] = {k: str(v)[:100] for k, v in pdf.metadata.items() if v}
                
                # Check for editing software
                producer = results["metadata"].get("Producer", "").lower()
                creator = results["metadata"].get("Creator", "").lower()
                if any(soft in producer + creator for soft in ["photoshop", "gimp", "paint"]):
                    results["warnings"].append("PDF created/edited with image editor")
                    results["confidence"] -= 0.3
                
                # Check creation vs modification dates
                created = results["metadata"].get("CreationDate")
                modified = results["metadata"].get("ModDate")
                if created and modified and created != modified:
                    results["warnings"].append("Creation and modification dates differ")
                    results["confidence"] -= 0.1
            
            results["confidence"] = max(0.0, min(1.0, results["confidence"]))
            
    except Exception as e:
        results["error"] = str(e)
        results["confidence"] = 0.0
    
    return results

# ── Cross-field validation ───────────────────────────────────────────
def validate_extracted_fields(fields: Dict, ocr_text: str) -> Dict:
    """Validate consistency between extracted fields."""
    results = {
        "validations": [],
        "warnings": [],
        "confidence": 1.0,
    }
    
    # Validate passport number
    if fields.get("passport_number"):
        valid, msg, score = validate_passport_number(
            fields["passport_number"], 
            fields.get("nationality")
        )
        results["validations"].append({"field": "passport_number", "valid": valid, "message": msg})
        if not valid:
            results["confidence"] -= 0.3
        else:
            results["confidence"] *= score
    
    # Validate dates
    if fields.get("dates_found"):
        for date_str in fields["dates_found"]:
            valid, msg = validate_date(date_str)
            results["validations"].append({"field": "date", "value": date_str, "valid": valid, "message": msg})
            if not valid:
                results["confidence"] -= 0.2
    
    # Check for required fields
    required = ["full_name", "passport_number"]
    missing = [f for f in required if not fields.get(f)]
    if missing:
        results["warnings"].append(f"Missing required fields: {', '.join(missing)}")
        results["confidence"] -= 0.2 * len(missing)
    
    # Check name consistency
    if fields.get("full_name"):
        name = fields["full_name"].strip()
        if len(name) < 2:
            results["warnings"].append("Name is too short")
            results["confidence"] -= 0.2
        if not re.match(r"^[A-Za-z\s\-'.]+$", name):
            results["warnings"].append("Name contains unusual characters")
            results["confidence"] -= 0.1
    
    results["confidence"] = max(0.0, min(1.0, results["confidence"]))
    return results

# ── Main verification function ───────────────────────────────────────
def verify_document(file_bytes: bytes, content_type: str, ocr_text: str, extracted_fields: Dict) -> Dict:
    """Run all verification checks and return comprehensive results."""
    verification = {
        "overall_confidence": 0.0,
        "is_likely_genuine": False,
        "checks": {},
        "warnings": [],
        "recommendation": "",
    }
    
    # Run file integrity checks
    if content_type.startswith("image/"):
        verification["checks"]["file_integrity"] = check_image_integrity(file_bytes)
    elif content_type == "application/pdf":
        verification["checks"]["file_integrity"] = check_pdf_integrity(file_bytes)
    
    # Run cross-field validation
    verification["checks"]["field_validation"] = validate_extracted_fields(extracted_fields, ocr_text)
    
    # Calculate overall confidence
    confidences = []
    for check_name, check_result in verification["checks"].items():
        if "confidence" in check_result:
            confidences.append(check_result["confidence"])
    
    if confidences:
        verification["overall_confidence"] = sum(confidences) / len(confidences)
    
    # Collect all warnings
    for check_name, check_result in verification["checks"].items():
        verification["warnings"].extend(check_result.get("warnings", []))
        verification["warnings"].extend(check_result.get("exif_anomalies", []))
    
    # Determine recommendation
    if verification["overall_confidence"] >= 0.8:
        verification["is_likely_genuine"] = True
        verification["recommendation"] = "Document appears genuine. Safe to approve."
    elif verification["overall_confidence"] >= 0.5:
        verification["is_likely_genuine"] = False
        verification["recommendation"] = "Document has some concerns. Manual review recommended."
    else:
        verification["is_likely_genuine"] = False
        verification["recommendation"] = "Document has significant issues. Likely fake or tampered."
    
    return verification
