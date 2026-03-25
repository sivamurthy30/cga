import asyncio
from app.utils.simple_resume_parser import parse_resume

def test():
    try:
        data = parse_resume(b"This is a resume. I know Python, React, and CSS. Skills Experience Projects", "resume.txt")
        print(data)
    except Exception as e:
        print("ERROR:", str(e))

test()
