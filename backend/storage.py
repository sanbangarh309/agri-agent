# storage.py
import json
from pathlib import Path
from typing import List, Dict

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def _file_path(session_id: str) -> Path:
    return DATA_DIR / f"{session_id}.json"

def load_history(session_id: str) -> List[Dict]:
    file = _file_path(session_id)
    if not file.exists():
        return []
    try:
        return json.loads(file.read_text())
    except Exception:
        return []

def save_history(session_id: str, history: List[Dict]) -> None:
    file = _file_path(session_id)
    file.write_text(json.dumps(history, indent=2))

def append_message(session_id: str, role: str, content: str) -> None:
    history = load_history(session_id)
    history.append({"role": role, "content": content})
    save_history(session_id, history)

def clear_history(session_id: str) -> None:
    file = _file_path(session_id)
    if file.exists():
        file.unlink()

def trim_history(session_id: str, max_messages: int = 20) -> None:
    history = load_history(session_id)
    if len(history) > max_messages:
        save_history(session_id, history[-max_messages:])