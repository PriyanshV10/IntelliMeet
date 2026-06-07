import os
from gtts import gTTS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Ensure directory exists
os.makedirs("../demo_data", exist_ok=True)

print("Generating audio...")
text = (
    "Good morning everyone, let's kick off the Q3 Product Launch meeting. We have three main items on the agenda today: the final pricing strategy, the launch timeline, and the marketing budget. "
    "Let's start with pricing. After reviewing the competitor analysis, we've decided to officially launch the Pro tier at 299 dollars per month. The Basic tier will remain at 99 dollars per month, and the Enterprise tier will be custom pricing starting at 999 dollars. That is the final decision on pricing, so please update all marketing materials accordingly. "
    "Moving on to the launch timeline. I know we originally aimed for August 15th, but Sarah raised a valid point about the QA testing phase. Because of the new AI integration features, we are officially pushing the launch date back to September 1st. This gives the engineering team exactly two extra weeks to iron out the bugs. "
    "Now regarding the budget. As I highlighted on Slide 5, we are currently facing a 150,000 dollar shortfall in the marketing budget for Q3. Mike, we need to decide if we are going to cut our ad spend or ask the board for additional funding. For now, let's freeze all new ad campaigns until we get an answer. "
    "Finally, let's go over the action items before we wrap up. Number one, John needs to finalize the pricing document by this Friday. Number two, Sarah needs to submit the revised QA timeline by Thursday. And number three, Mike needs to present the three budget options to the board next Monday. Let's get to work."
)
tts = gTTS(text)
tts.save("../demo_data/demo_audio.mp3")
print("Audio saved to ../demo_data/demo_audio.mp3")

print("Generating PDF slides...")
c = canvas.Canvas("../demo_data/demo_slides.pdf", pagesize=letter)
width, height = letter

def draw_slide(c, title, content, page_num):
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 100, title)
    c.setFont("Helvetica", 14)
    y = height - 150
    for line in content.split('\n'):
        c.drawString(50, y, line)
        y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(width - 100, 50, f"Page {page_num}")
    c.showPage()

# Page 1
draw_slide(c, "Q3 Product Launch", "Agenda overview:\n- Pricing Strategy\n- Launch Timeline\n- Marketing Budget\n- Action Items", 1)

# Page 2
draw_slide(c, "Pricing Strategy", "Final Pricing Model:\n- Basic: $99/month\n- Pro: $299/month\n- Enterprise: Starting at $999/month\n\nNote: Competitor analysis shows this is the sweet spot.", 2)

# Page 3
draw_slide(c, "Launch Timeline", "Original Date: August 15th\nNew Date: September 1st\n\nReason: QA testing for new AI integration requires 2 additional weeks.", 3)

# Page 4
draw_slide(c, "Marketing Budget", "Current Status: $150K Shortfall\n\nAction Required:\n- Freeze all new ad campaigns\n- Decide between cutting ad spend vs requesting board funding", 4)

# Page 5
draw_slide(c, "Action Items", "1. John - Finalize pricing doc (Due: Friday)\n2. Sarah - Submit revised QA timeline (Due: Thursday)\n3. Mike - Present budget options to board (Due: Monday)", 5)

c.save()
print("PDF saved to ../demo_data/demo_slides.pdf")
