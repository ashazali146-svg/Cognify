from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow your HTML (even on another port) to call this backend via JS

# --- In-memory demo data -------------------------------------------------

# Simple representation of learner profiles and their adaptive settings.
# In a real system this would live in a database.
LEARNER_PROFILES = {
    "adhd_sprint": {
        "id": "adhd_sprint",
        "label": "ADHD sprint learner",
        "session_length_minutes": 25,
        "break_length_minutes": 5,
        "task_style": "checklist",
        "timers_enabled": True,
        "micro_rewards": True,
    },
    "dyslexic_audio": {
        "id": "dyslexic_audio",
        "label": "Dyslexic audio-first learner",
        "session_length_minutes": 30,
        "break_length_minutes": 10,
        "task_style": "guided audio + text",
        "timers_enabled": False,
        "micro_rewards": True,
    },
    "slow_deep": {
        "id": "slow_deep",
        "label": "Slow-pace deep thinker",
        "session_length_minutes": 45,
        "break_length_minutes": 15,
        "task_style": "long-form reflection",
        "timers_enabled": False,
        "micro_rewards": False,
    },
}

# --- Cognitive load estimation -------------------------------------------

def estimate_load(data):
    """
    Return a cognitive load estimate from 0-100 and a label (low/medium/high).

    Expected JSON from frontend:
    {
      "focus_drops": 3,
      "tab_switches": 5,
      "error_rate": 0.2,
      "minutes_in_session": 18
    }
    """
    focus_drops = int(data.get("focus_drops", 0))
    tab_switches = int(data.get("tab_switches", 0))
    error_rate = float(data.get("error_rate", 0.0))  # 0-1
    minutes_in_session = float(data.get("minutes_in_session", 0.0))

    score = 0
    score += focus_drops * 6
    score += tab_switches * 4
    score += error_rate * 40
    score += max(0, minutes_in_session - 20) * 2  # extra weight for long sessions

    # clamp between 0 and 100
    score = max(0, min(100, score))

    if score < 30:
        label = "low"
    elif score < 65:
        label = "medium"
    else:
        label = "high"

    return score, label

# --- Routes --------------------------------------------------------------

@app.route("/api/ping", methods=["GET"])
def ping():
    """Simple health check."""
    return jsonify({"status": "ok", "message": "Cognify backend online."})

@app.route("/api/profiles", methods=["GET"])
def get_profiles():
    """Return the available learner profiles."""
    return jsonify(list(LEARNER_PROFILES.values()))

@app.route("/api/session", methods=["POST"])
def create_session():
    """
    Create an adaptive session for a given learner profile.

    Request JSON:
    {
      "profile_id": "adhd_sprint"
    }
    """
    payload = request.get_json(force=True) or {}
    profile_id = payload.get("profile_id", "adhd_sprint")
    profile = LEARNER_PROFILES.get(profile_id, LEARNER_PROFILES["adhd_sprint"])

    base_minutes = profile["session_length_minutes"]
    break_minutes = profile["break_length_minutes"]

    session = {
        "profile_id": profile_id,
        "profile_label": profile["label"],
        "duration_minutes": base_minutes,
        "break_minutes": break_minutes,
        "task_style": profile["task_style"],
        "timers_enabled": profile["timers_enabled"],
        "micro_rewards": profile["micro_rewards"],
        "steps": [
            "Warm-up: 2-3 very easy tasks",
            "Core focus sprint",
            "Short break with breathing / stretch",
            "Reflection or quick recap",
        ],
    }

    return jsonify(session), 201

@app.route("/api/adapt", methods=["POST"])
def adapt_session():
    """
    Return adaptation suggestions based on simple cognitive load signals.

    Request JSON example:
    {
      "focus_drops": 4,
      "tab_switches": 7,
      "error_rate": 0.3,
      "minutes_in_session": 25
    }
    """
    payload = request.get_json(force=True) or {}
    score, label = estimate_load(payload)

    suggestions = []

    if label == "low":
        suggestions.append("Safe to introduce a new concept.")
        suggestions.append("Increase difficulty slightly or chain two micro-tasks.")
    elif label == "medium":
        suggestions.append("Keep current difficulty, but shorten instructions.")
        suggestions.append("Offer an optional 2-minute pause before the next task.")
    else:  # high
        suggestions.append("Pause new concepts immediately.")
        suggestions.append("Switch to short review tasks or visual cues only.")
        suggestions.append("Schedule a proper break in the next 3-5 minutes.")

    response = {
        "load_score": score,
        "load_level": label,
        "suggestions": suggestions,
    }

    return jsonify(response)

if __name__ == "__main__":
    # Run on localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=True)
