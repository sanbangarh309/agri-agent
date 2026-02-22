from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from langchain_openai import ChatOpenAI
import os
import json
from storage import load_history, append_message, trim_history

app = Flask(__name__)
CORS(app)

llm = ChatOpenAI(
    model=os.getenv("LM_MODEL", "qwen2.5-7b-instruct"),
    openai_api_base=os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1"),
    openai_api_key="lm-studio",
    temperature=0.4,
    streaming=True,
)

@app.route("/api/agri/<session_id>", methods=["POST"])
def agri_agent(session_id):
    data = request.json
    question = data.get("question", "")
    location = data.get("location", "India")
    crop = data.get("crop")  # optional

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    system_prompt = f"""
You are a practical agriculture expert helping Indian farmers.

Output format:
- Use Markdown.
- Use headings (##), bullet points (-), and numbered steps (1., 2., 3.).
- Separate sections with blank lines.

Content rules:
- Step-by-step advice
- Organic & low-cost options first
- Mention Kharif/Rabi/Zaid when relevant
- For pests: prevention + treatment
- For selling: mandi, FPOs, processors, exporters

Rules:
- Give step-by-step advice.
- Mention local season (Kharif/Rabi/Zaid) if relevant.
- Suggest organic and low-cost options first.
- For pests/diseases: suggest prevention + treatment.
- For buy/sell: suggest mandi, FPOs, processors, pharma companies, exporters.
- If unsure, ask clarifying questions (crop, location, symptoms, acreage).
- Avoid brand promotion unless asked.

Guidelines:
- Give practical, step-by-step advice.
- Use simple language.

IMPORTANT:
- Always complete all phases.
- Do NOT stop mid-section.
- End with a short summary section titled: "## Summary".

Use Markdown headings and bullet points.

Location: {location}
Crop (if provided): {crop}
"""

    history = load_history(session_id)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-10:])
    messages.append({"role": "user", "content": question})

    def generate():
        full_reply = ""
        try:
            for chunk in llm.stream(messages):
                token = chunk.content
                if token:
                    full_reply += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            # Save whatever we got
            append_message(session_id, "user", question)
            append_message(session_id, "assistant", full_reply)
            trim_history(session_id, max_messages=20)
            yield f"data: {json.dumps({'done': True})}\n\n"

    return Response(generate(), mimetype="text/event-stream")

@app.route("/api/agri/<session_id>/clear", methods=["POST"])
def clear_agri_history(session_id):
    from storage import clear_history
    clear_history(session_id)
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    app.run(port=5000, debug=True, threaded=True)