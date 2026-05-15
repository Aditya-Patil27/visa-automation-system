"""Document type configuration for visa applications."""

from enum import Enum


class DocType(str, Enum):
    PASSPORT = "passport"
    BANK_STATEMENT = "bank_statement"
    PHOTOGRAPH = "photograph"
    TRAVEL_INSURANCE = "travel_insurance"
    FLIGHT_ITINERARY = "flight_itinerary"
    HOTEL_BOOKING = "hotel_booking"
    EMPLOYMENT_LETTER = "employment_letter"
    INVITATION_LETTER = "invitation_letter"
    VISA_APPLICATION_FORM = "visa_application_form"
    PROOF_OF_RESIDENCE = "proof_of_residence"
    BIRTH_CERTIFICATE = "birth_certificate"
    MARRIAGE_CERTIFICATE = "marriage_certificate"
    COVER_LETTER = "cover_letter"


DOC_TYPE_MAP = {
    DocType.PASSPORT: "Passport / Travel Document",
    DocType.BANK_STATEMENT: "Bank Statement / Financial Proof",
    DocType.PHOTOGRAPH: "Passport-size Photograph",
    DocType.TRAVEL_INSURANCE: "Travel Insurance",
    DocType.FLIGHT_ITINERARY: "Flight Itinerary",
    DocType.HOTEL_BOOKING: "Hotel Booking / Accommodation Proof",
    DocType.EMPLOYMENT_LETTER: "Employment Letter",
    DocType.INVITATION_LETTER: "Invitation Letter",
    DocType.VISA_APPLICATION_FORM: "Visa Application Form",
    DocType.PROOF_OF_RESIDENCE: "Proof of Residence",
    DocType.BIRTH_CERTIFICATE: "Birth Certificate",
    DocType.MARRIAGE_CERTIFICATE: "Marriage Certificate",
    DocType.COVER_LETTER: "Cover Letter",
}

DOC_TYPE_DESC = {
    DocType.PASSPORT: "Valid passport with at least 6 months validity",
    DocType.BANK_STATEMENT: "Bank statements for the last 3-6 months",
    DocType.PHOTOGRAPH: "Recent passport-size photograph (35x45mm)",
    DocType.TRAVEL_INSURANCE: "Travel insurance covering the entire stay",
    DocType.FLIGHT_ITINERARY: "Round-trip flight reservation",
    DocType.HOTEL_BOOKING: "Hotel reservation for the entire stay",
    DocType.EMPLOYMENT_LETTER: "Letter from employer with leave approval",
    DocType.INVITATION_LETTER: "Invitation from host in destination country",
    DocType.VISA_APPLICATION_FORM: "Completed and signed visa application form",
    DocType.PROOF_OF_RESIDENCE: "Proof of residence (utility bill, etc.)",
    DocType.BIRTH_CERTIFICATE: "Birth certificate (for minor applicants)",
    DocType.MARRIAGE_CERTIFICATE: "Marriage certificate (if applicable)",
    DocType.COVER_LETTER: "Cover letter explaining purpose of visit",
}
