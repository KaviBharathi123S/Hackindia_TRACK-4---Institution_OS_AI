"""
Agent loop — the "brain" of Track 04.

run_agent_turn() is called once per user message. It:
  1. Adds the user's message to that session's running history
  2. Sends history + tool declarations + current context to Gemini
  3. If Gemini wants to call a tool, executes it for real against MySQL
     (via agent_tools.dispatch_tool_call), feeds the result back to Gemini
  4. Gemini produces a final natural-language reply
  5. Returns the reply text + a list of ui_events for the frontend to render

NOTE: I don't have network access in the sandbox that generated this code,
so this hasn't been run against the live Gemini API. It follows the
documented google-genai manual function-calling pattern closely, but if you
hit an SDK signature mismatch, check `pip show google-genai` version against
https://github.com/googleapis/python-genai — the manual function-calling
API has shifted slightly between minor versions.
"""

import os
import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.agent_tools import TOOL_DECLARATIONS, dispatch_tool_call
from app.session_store import get_session, remember_context

MODEL_NAME = "gemini-2.5-flash"

_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set in .env")
        _client = genai.Client(api_key=api_key)
    return _client


def _system_instruction(session: dict) -> str:
    context_note = ""
    if session["last_student_id"]:
        context_note = (
            f"\nContext: the student most recently shown, created, or updated in this "
            f"conversation is student_id='{session['last_student_id']}'. "
            f"If the user refers to 'that student', 'them', 'the last one', or similar "
            f"without naming an ID, use this student_id."
        )
    if session["last_list_ids"]:
        context_note += f"\nThe last list of students shown had these ids: {session['last_list_ids']}."

    return (
        "You are an assistant for a student records system. You can list, view, "
        "create, update, and delete student records, view academic records, and "
        "update attendance — always by calling the provided tools, never by "
        "making up data. After a tool runs, briefly confirm what happened in "
        "plain language (1-2 sentences), you don't need to repeat the raw data "
        "since the UI will render it separately." + context_note
    )


def run_agent_turn(db: Session, session_id: str, user_text: str) -> dict:
    session = get_session(session_id)
    client = get_client()

    session["history"].append(
        types.Content(role="user", parts=[types.Part.from_text(text=user_text)])
    )

    config = types.GenerateContentConfig(
        system_instruction=_system_instruction(session),
        tools=[{"function_declarations": TOOL_DECLARATIONS}],
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )

    response = client.models.generate_content(
        model=MODEL_NAME, contents=session["history"], config=config
    )

    ui_events = []
    function_calls = response.function_calls or []

    # --- TEMPORARY DEBUG LOGGING - remove once the issue is diagnosed ---
    print(f"[DEBUG] function_calls={function_calls!r}")
    try:
        print(f"[DEBUG] finish_reason={response.candidates[0].finish_reason!r}")
    except Exception as debug_err:
        print(f"[DEBUG] couldn't inspect finish_reason: {debug_err!r}")
    if not function_calls:
        # .text is only safe to access when there's no function_call part
        try:
            print(f"[DEBUG] response.text={response.text!r}")
        except Exception as debug_err:
            print(f"[DEBUG] couldn't read response.text: {debug_err!r}")
    # --- END DEBUG LOGGING ---

    if function_calls:
        # Record the model's turn (which contains the function_call parts)
        session["history"].append(response.candidates[0].content)

        # Execute every tool call the model asked for, feed results back
        for fc in function_calls:
            result, ui_event = dispatch_tool_call(fc.name, dict(fc.args), db)
            if ui_event:
                ui_events.append(ui_event)
                remember_context(session, ui_event)

            session["history"].append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_function_response(
                        name=fc.name, response={"result": result}
                    )],
                )
            )

        # Second call: let Gemini turn the tool result(s) into a natural reply
        final_response = client.models.generate_content(
            model=MODEL_NAME, contents=session["history"], config=config
        )
        try:
            reply_text = final_response.text or "Done."
        except Exception:
            # Model tried to chain another function call instead of replying in
            # text — we don't loop multiple rounds, so just confirm generically.
            reply_text = "Done."
        session["history"].append(
            types.Content(role="model", parts=[types.Part.from_text(text=reply_text)])
        )
    else:
        reply_text = response.text or "I'm not sure how to help with that."
        session["history"].append(
            types.Content(role="model", parts=[types.Part.from_text(text=reply_text)])
        )

    return {"reply": reply_text, "ui_events": ui_events}
