import fitz  # PyMuPDF

def extract_pdf(path: str):
    """
    Reads every page of a presentation PDF and extracts the text.
    """
    doc = fitz.open(path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text()
        pages.append({
            "page_number": i + 1,
            "text": text.strip()
        })
    return pages
