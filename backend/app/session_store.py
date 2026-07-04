"""
Session state store.

In-memory dict for the hackathon — swap for Redis later if you need state
to survive server restarts or run across multiple server instances.

Each session tracks:
  - history          : the running Gemini conversation (list[types.Content])
  - last_student_id   : the most recently viewed/created/updated student
  - last_list_ids       : student_ids from the last list/table shown

last_student_id / last_list_ids get fed back into the system prompt each
turn so the LLM can resolve "that student" / "the last one" / "delete it"
without the user having to repeat the exact ID every time.
"""

SESSIONS: dict[str, dict] = {}


def get_session(session_id: str) -> dict:
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "history": [],
            "last_student_id": None,
            "last_list_ids": [],
        }
    return SESSIONS[session_id]


def remember_context(session: dict, ui_event: dict | None):
    """Call after every tool execution to update what 'that'/'it' refers to."""
    if not ui_event:
        return
    if ui_event["type"] in ("row_created", "row_updated") and ui_event.get("table") == "students":
        session["last_student_id"] = ui_event["id"] if "id" in ui_event else ui_event["data"]["student_id"]
    elif ui_event["type"] == "row_deleted" and ui_event.get("table") == "students":
        session["last_student_id"] = None
    elif ui_event["type"] == "render_table" and ui_event.get("table") == "students":
        ids = [r["student_id"] for r in ui_event["rows"]]
        session["last_list_ids"] = ids
        if len(ids) == 1:
            session["last_student_id"] = ids[0]
